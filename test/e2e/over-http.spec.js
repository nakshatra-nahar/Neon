import axios from 'axios'

import server from '@/core/http-server/http-server'

const urlPrefix = `${process.env.neon_HOST}:${process.env.neon_PORT}/api`
const queryUrl = `${urlPrefix}/query`
const actionSkillUrl = `${urlPrefix}/p/neon/randomnumber/run`

/**
 * Test the query endpoint over HTTP
 * and a simple skill action over HTTP
 */

;(async () => {
  await server.init()
})()

describe('Over HTTP', () => {
  test(`Request query endpoint POST ${queryUrl}`, async () => {
    const { data } = await axios.post(
      queryUrl,
      {
        utterance: 'Hello'
      },
      {
        headers: {
          'X-API-Key': process.env.neon_HTTP_API_KEY
        }
      }
    )

    expect(data).toHaveProperty('success', true)
  })

  test(`Request an action skill: GET ${actionSkillUrl}`, async () => {
    const { data } = await axios.get(actionSkillUrl, {
      headers: {
        'X-API-Key': process.env.neon_HTTP_API_KEY
      }
    })

    expect(data).toHaveProperty('success', true)
  })
})
