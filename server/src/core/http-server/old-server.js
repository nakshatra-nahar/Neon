/* eslint-disable */

// TODO: delete this file once multi clients are reimplemented

import { join } from 'node:path'

import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import socketio from 'socket.io'

import { version } from '@@/package.json'
import { endpoints } from '@@/core/skills-endpoints.json'
import {
  HAS_LOGGER,
  HAS_OVER_HTTP,
  HAS_STT,
  HAS_TTS,
  HOST,
  IS_DEVELOPMENT_ENV,
  neon_NODE_ENV,
  PORT,
  STT_PROVIDER,
  TTS_PROVIDER
} from '@/constants'
import { TCP_CLIENT } from '@/core'
import Nlu from '@/core/nlu'
import Brain from '@/core/brain'
import Asr from '@/core/asr/asr'
import Stt from '@/stt/stt'
import Tts from '@/tts/tts'
import corsMidd from '@/core/http-server/plugins/cors'
import otherMidd from '@/core/http-server/plugins/other'
import keyMidd from '@/core/http-server/plugins/key'
import infoPlugin from '@/core/http-server/api/info'
import { LogHelper } from '@/helpers/log-helper'
import { DateHelper } from '@/helpers/date-helper'

const server = {}

let mainProvider = {
  id: 1,
  brain: {},
  nlu: {}
}
let providers = []
const createProvider = async (id) => {
  const brain = new Brain()
  const nlu = new Nlu(brain)

  // Load NLP models
  try {
    await Promise.all([
      nlu.loadGlobalResolversModel(
        join(process.cwd(), 'core/data/models/neon-global-resolvers-model.nlp')
      ),
      nlu.loadSkillsResolversModel(
        join(process.cwd(), 'core/data/models/neon-skills-resolvers-model.nlp')
      ),
      nlu.loadMainModel(
        join(process.cwd(), 'core/data/models/neon-main-model.nlp')
      )
    ])

    return {
      id,
      brain,
      nlu
    }
  } catch (e) {
    LogHelper[e.type](e.obj.message)

    return null
  }
}
const addProvider = async (id) => {
  providers = providers || []
  const index = providers.indexOf((p) => p.id === id)
  const obj = await createProvider(id)

  if (id === '1' && obj) {
    mainProvider = obj
  }

  if (index < 0) {
    providers.push(obj)
  } else {
    providers.splice(index, 1, obj)
  }

  return obj
}

const deleteProvider = (id) => {
  providers = providers || []
  providers = providers.filter((p) => p.id !== id)

  if (id === '1') {
    mainProvider = {
      id: 1,
      brain: {},
      nlu: {}
    }
  }
}

server.fastify = Fastify()
server.httpServer = {}

/**
 * Generate skills routes
 */
/* istanbul ignore next */
server.generateSkillsRoutes = (instance) => {
  // Dynamically expose neon skills over HTTP
  endpoints.forEach((endpoint) => {
    instance.route({
      method: endpoint.method,
      url: endpoint.route,
      async handler(request, reply) {
        const timeout = endpoint.timeout || 60000
        const [, , , domain, skill, action] = endpoint.route.split('/')
        const handleRoute = async () => {
          const { params } = endpoint
          const entities = []

          params.forEach((param) => {
            const value = request.body[param]
            const trimEntity = {
              entity: param,
              sourceText: value,
              utteranceText: value,
              resolution: { value }
            }
            const builtInEntity = {
              entity: param,
              resolution: { ...value }
            }
            let entity =
              endpoint?.entitiesType === 'trim' ? trimEntity : builtInEntity

            if (Array.isArray(value)) {
              value.forEach((v) => {
                entity = {
                  entity: param,
                  resolution: { ...v }
                }

                entities.push(entity)
              })
            } else {
              entities.push(entity)
            }
          })

          const obj = {
            utterance: '',
            entities,
            classification: {
              domain,
              skill,
              action,
              confidence: 1
            }
          }
          const responseData = {
            domain,
            skill,
            action,
            speeches: []
          }

          try {
            const data = await mainProvider.brain.execute(obj, { mute: true })

            reply.send({
              ...data,
              success: true
            })
          } catch (e) /* istanbul ignore next */ {
            LogHelper[e.type](e.obj.message)
            reply.statusCode = 500
            reply.send({
              ...responseData,
              speeches: e.speeches,
              executionTime: e.executionTime,
              message: e.obj.message,
              success: false
            })
          }
        }

        handleRoute()
        setTimeout(() => {
          reply.statusCode = 408
          reply.send({
            domain,
            skill,
            action,
            message: 'The action has timed out',
            timeout,
            success: false
          })
        }, timeout)
      }
    })
  })
}

/**
 * Bootstrap socket
 */
server.handneonConnection = (socket) => {
  LogHelper.title('Client')
  LogHelper.success('Connected')

  // Init
  socket.on('init', async (data) => {
    LogHelper.info(`Type: ${data}`)
    LogHelper.info(`Socket id: ${socket.id}`)

    const provider = await addProvider(socket.id)

    // Check whether the TCP client is connected to the TCP server
    if (TCP_CLIENT.isConnected) {
      socket.emit('ready')
    } else {
      TCP_CLIENT.ee.on('connected', () => {
        socket.emit('ready')
      })
    }

    if (data === 'hotword-node') {
      // Hotword triggered
      socket.on('hotword-detected', (data) => {
        LogHelper.title('Socket')
        LogHelper.success(`Hotword ${data.hotword} detected`)

        socket.broadcast.emit('enable-record')
      })
    } else {
      const asr = new Asr()
      let sttState = 'disabled'
      let ttsState = 'disabled'

      provider.brain.socket = socket

      /* istanbul ignore if */
      if (HAS_STT) {
        sttState = 'enabled'

        provider.brain.stt = new Stt(socket, STT_PROVIDER)
        provider.brain.stt.init(() => null)
      }
      if (HAS_TTS) {
        ttsState = 'enabled'

        provider.brain.tts = new Tts(socket, TTS_PROVIDER)
        provider.brain.tts.init('en', () => null)
      }

      LogHelper.title('Initialization')
      LogHelper.success(`STT ${sttState}`)
      LogHelper.success(`TTS ${ttsState}`)

      // Listen for new utterance
      socket.on('utterance', async (data) => {
        LogHelper.title('Socket')
        LogHelper.info(`${data.client} emitted: ${data.value}`)

        socket.emit('is-typing', true)

        const utterance = data.value
        try {
          LogHelper.time('Utterance processed in')
          await provider.nlu.process(utterance)
          LogHelper.title('Execution Time')
          LogHelper.timeEnd('Utterance processed in')
        } catch (e) {
          /* */
        }
      })

      // Handle automatic speech recognition
      socket.on('recognize', async (data) => {
        try {
          await asr.run(data, provider.brain.stt)
        } catch (e) {
          LogHelper[e.type](e.obj.message)
        }
      })
    }
  })

  socket.once('disconnect', () => {
    deleteProvider(socket.id)
  })
}

/**
 * Launch server
 */
server.listen = async (port) => {
  const io = IS_DEVELOPMENT_ENV
    ? socketio(server.httpServer, {
        cors: { origin: `${HOST}:3000` }
      })
    : socketio(server.httpServer)

  io.on('connection', server.handneonConnection)

  server.fastify.listen(
    {
      port,
      host: '0.0.0.0'
    },
    () => {
      LogHelper.title('Initialization')
      LogHelper.success(`Server is available at ${HOST}:${port}`)
    }
  )
}

/**
 * Bootstrap API
 */
server.bootstrap = async () => {
  const apiVersion = 'v1'

  // Render the web app
  server.fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'app/dist'),
    prefix: '/'
  })
  server.fastify.get('/', (request, reply) => {
    reply.sendFile('index.html')
  })

  server.fastify.register(infoPlugin, { apiVersion })

  if (HAS_OVER_HTTP) {
    server.fastify.register((instance, opts, next) => {
      instance.addHook('preHandler', keyMidd)

      instance.post('/api/query', async (request, reply) => {
        const { utterance } = request.body

        try {
          const data = await mainProvider.nlu.process(utterance, { mute: true })

          reply.send({
            ...data,
            success: true
          })
        } catch (e) {
          reply.statusCode = 500
          reply.send({
            message: e.message,
            success: false
          })
        }
      })

      server.generateSkillsRoutes(instance)

      next()
    })
  }

  server.httpServer = server.fastify.server

  try {
    await server.listen(PORT)
  } catch (e) {
    LogHelper.error(e.message)
  }
}

/**
 * Server entry point
 */
server.init = async () => {
  server.fastify.addHook('onRequest', corsMidd)
  server.fastify.addHook('preValidation', otherMidd)

  LogHelper.title('Initialization')
  LogHelper.success(`The current env is ${neon_NODE_ENV}`)
  LogHelper.success(`The current version is ${version}`)

  LogHelper.success(`The current time zone is ${DateHelper.getTimeZone()}`)

  const sLogger = !HAS_LOGGER ? 'disabled' : 'enabled'
  LogHelper.success(`Collaborative logger ${sLogger}`)

  await addProvider('1')

  await server.bootstrap()
}

export default server
