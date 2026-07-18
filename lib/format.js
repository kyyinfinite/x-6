export function todayStr() {
  const now = new Date()
  const jakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const y = jakarta.getFullYear()
  const m = String(jakarta.getMonth() + 1).padStart(2, '0')
  const d = String(jakarta.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthStr(date = new Date()) {
  const jakarta = new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const y = jakarta.getFullYear()
  const m = String(jakarta.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function humanDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00+07:00`)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function lastNMonths(n) {
  const result = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_NAMES_ID[d.getMonth()],
    })
  }
  return result
}
