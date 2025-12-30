function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function daysInMonth(month: string) {
  const [y, m] = month.split('-').map((x) => Number(x))
  if (!y || !m) throw new Error('Ogiltig månad')
  return new Date(y, m, 0).getDate()
}

export function dateFromMonthAndDay(month: string, dayOfMonth: number) {
  const max = daysInMonth(month)
  const d = Math.min(Math.max(1, Math.trunc(dayOfMonth)), max)
  return `${month}-${pad2(d)}`
}

export function monthAdd(month: string, deltaMonths: number) {
  const [y, m] = month.split('-').map((x) => Number(x))
  if (!y || !m) throw new Error('Ogiltig månad')
  const dt = new Date(y, m - 1 + deltaMonths, 1)
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}`
}

export function monthsBackFrom(month: string, count: number) {
  const n = Math.max(1, Math.trunc(count))
  const months: string[] = []
  for (let i = n - 1; i >= 0; i--) months.push(monthAdd(month, -i))
  return months
}


