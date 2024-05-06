import type { ActionFunction } from '@sdk/types'
import { neon } from '@sdk/neon'

export const run: ActionFunction = async function (params) {
  const currentDate = new Date()
  await neon.answer({
    key: 'current_date',
    data: {
      weekday: currentDate.toLocaleString(params.lang, { weekday: 'long' }),
      month: currentDate.toLocaleString(params.lang, { month: 'long' }),
      day: currentDate.getDate(),
      year: currentDate.getFullYear()
    }
  })
}
