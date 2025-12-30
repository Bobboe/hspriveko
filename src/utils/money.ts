const SEK = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 2,
})

export function formatCents(cents: number) {
  return SEK.format((cents ?? 0) / 100)
}

export function parseMoneyToCents(input: string) {
  const cleaned = input.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return 0

  // Keep only digits and dot; allow leading minus (but we reject negative later where needed)
  const normalized = cleaned.replace(/[^0-9.-]/g, '')
  const value = Number(normalized)
  if (!Number.isFinite(value)) throw new Error('Ogiltigt belopp')
  return Math.round(value * 100)
}


