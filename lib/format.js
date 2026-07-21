const TZ = 'Asia/Jakarta'

function jakartaParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]))
  return parts
}

export function todayStr(date = new Date()) {
  const p = jakartaParts(date)
  return `${p.year}-${p.month}-${p.day}`
}

export function monthStr(date = new Date()) {
  const p = jakartaParts(date)
  return `${p.year}-${p.month}`
}

export function humanDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00+07:00`)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
}

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function lastNMonths(n) {
  const result = []
  const nowParts = jakartaParts()
  const baseYear = Number(nowParts.year)
  const baseMonthIndex = Number(nowParts.month) - 1

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(baseYear, baseMonthIndex - i, 1))
    result.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      label: MONTH_NAMES_ID[d.getUTCMonth()],
    })
  }

  return result
}
