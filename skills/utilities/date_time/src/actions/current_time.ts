import type { ActionFunction } from '@sdk/types'
import { neon } from '@sdk/neon'

import { zeroPad } from '../lib/zeroPad'

export const run: ActionFunction = async function () {
  const currentDate = new Date()
  await neon.answer({
    key: 'current_time',
    data: {
      hours: zeroPad(currentDate.getHours()),
      minutes: zeroPad(currentDate.getMinutes()),
      seconds: zeroPad(currentDate.getSeconds())
    }
  })
}
