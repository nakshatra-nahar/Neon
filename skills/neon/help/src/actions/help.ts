import fs from 'node:fs'
import path from 'node:path'

import type { ActionFunction } from '@sdk/types'
import { neon } from '@sdk/neon'

const SKILLS_PATH = path.join(process.cwd(), 'skills')

interface Domain {
  name: string
}

interface Skill {
  name: string
  description: string
}

async function getDirectoriesFromPath(basePath: string): Promise<string[]> {
  const paths = await fs.promises.readdir(basePath)
  const directories: string[] = []
  for (const item of paths) {
    const itemPath = path.join(basePath, item)
    if ((await fs.promises.stat(itemPath)).isDirectory()) {
      directories.push(itemPath)
    }
  }
  return directories
}

export const run: ActionFunction = async function () {
  let list = ''
  const domains = (await getDirectoriesFromPath(SKILLS_PATH)).reverse()

  for (const domain of domains) {
    const { name: domainName } = JSON.parse(
      await fs.promises.readFile(path.join(domain, 'domain.json'), {
        encoding: 'utf8'
      })
    ) as Domain

    const skills = await getDirectoriesFromPath(domain)
    if (skills.length === 0) {
      continue
    }

    let item = ''
    for (const skill of skills) {
      const { name: skillName, description } = JSON.parse(
        await fs.promises.readFile(path.join(skill, 'skill.json'), {
          encoding: 'utf8'
        })
      ) as Skill

      item += neon
        .setAnswerData('item', {
          item: `${skillName}: ${description}`
        })
        .toString()
    }

    list += neon
      .setAnswerData('item', {
        item: neon
          .setAnswerData('list', {
            title: domainName,
            list: item
          })
          .toString()
      })
      .toString()
  }

  await neon.answer({
    key: 'help_introduction',
    data: {
      list
    }
  })
}
