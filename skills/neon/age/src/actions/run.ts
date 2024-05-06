import type { ActionFunction } from '@sdk/types'
import { neon } from '@sdk/neon'

import { getTimeDifferenceBetweenDates } from '../lib/getTimeDifferenceBetweenDates'

const neon_BIRTH_DATE = new Date('2019-02-10T20:29:00+08:00')

export const run: ActionFunction = async function (params) {
  const answers = ['alive_for', 'magical_day', 'commemorate'] as const
  const answer = answers[Math.floor(Math.random() * answers.length)]

  if (answer === 'magical_day') {
    return neon.answer({
      key: 'magical_day',
      data: {
        weekday: neon_BIRTH_DATE.toLocaleString(params.lang, {
          weekday: 'long'
        }),
        month: neon_BIRTH_DATE.toLocaleString(params.lang, { month: 'long' }),
        day: neon_BIRTH_DATE.getDate(),
        year: neon_BIRTH_DATE.getFullYear()
      }
    })
  }

  if (answer === 'commemorate') {
    return neon.answer({
      key: 'commemorate',
      data: {
        month: neon_BIRTH_DATE.toLocaleString(params.lang, { month: 'long' }),
        day: neon_BIRTH_DATE.getDate(),
        year: neon_BIRTH_DATE.getFullYear()
      }
    })
  }

  const currentDate = new Date()
  const { years, months, days, hours, minutes, seconds } =
    getTimeDifferenceBetweenDates(currentDate, neon_BIRTH_DATE)
  await neon.answer({
    key: 'alive_for',
    data: {
      years,
      months,
      days,
      hours,
      minutes,
      seconds
    }
  })
}
