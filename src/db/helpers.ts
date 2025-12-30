export function newId() {
  // Safari/iOS supports crypto.randomUUID in modern versions; fallback included.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function monthFromDate(date: string) {
  // expects YYYY-MM-DD
  return date.slice(0, 7)
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}


