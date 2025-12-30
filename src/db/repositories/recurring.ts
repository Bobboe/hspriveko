import { db } from '../db'
import { newId } from '../helpers'
import type { Expense, RecurringExpense } from '../types'
import { dateFromMonthAndDay } from '../../utils/date'

export async function listRecurringExpenses() {
  return db.recurringExpenses.orderBy('createdAt').toArray()
}

export async function addRecurringExpense(input: {
  name: string
  amountCents: number
  categoryId: string
  dayOfMonth: number
  startMonth: string
  endMonth?: string
  active: 0 | 1
}) {
  const now = Date.now()
  const recurring: RecurringExpense = {
    id: newId(),
    name: input.name.trim(),
    amountCents: input.amountCents,
    categoryId: input.categoryId,
    dayOfMonth: Math.trunc(input.dayOfMonth),
    startMonth: input.startMonth,
    endMonth: input.endMonth?.trim() ? input.endMonth.trim() : undefined,
    active: input.active,
    createdAt: now,
    updatedAt: now,
  }

  validateRecurring(recurring)
  await db.recurringExpenses.add(recurring)
  return recurring
}

export async function updateRecurringExpense(
  id: string,
  patch: Partial<
    Pick<
      RecurringExpense,
      'name' | 'amountCents' | 'categoryId' | 'dayOfMonth' | 'startMonth' | 'endMonth' | 'active'
    >
  >,
) {
  const updates: Partial<RecurringExpense> = { ...patch, updatedAt: Date.now() }
  if (typeof updates.name === 'string') updates.name = updates.name.trim()
  if (typeof updates.endMonth === 'string') updates.endMonth = updates.endMonth.trim() || undefined
  if (typeof updates.dayOfMonth === 'number') updates.dayOfMonth = Math.trunc(updates.dayOfMonth)

  // Validate with merged values (read current)
  const current = await db.recurringExpenses.get(id)
  if (!current) throw new Error('Hittade inte återkommande utgift')
  const merged: RecurringExpense = { ...current, ...updates, id: current.id }
  validateRecurring(merged)

  await db.recurringExpenses.update(id, updates)
}

export async function deleteRecurringExpense(id: string) {
  await db.recurringExpenses.delete(id)
}

export async function generateRecurringForMonth(month: string) {
  const templates = await db.recurringExpenses.where('active').equals(1).toArray()
  const eligible = templates.filter((t) => isEligibleForMonth(t, month))

  let created = 0
  await db.transaction('rw', db.expenses, db.recurringExpenses, async () => {
    for (const t of eligible) {
      const existing = await db.expenses.where('[month+recurringId]').equals([month, t.id]).count()
      if (existing > 0) continue

      const now = Date.now()
      const date = dateFromMonthAndDay(month, t.dayOfMonth)

      const expense: Expense = {
        id: newId(),
        amountCents: t.amountCents,
        categoryId: t.categoryId,
        date,
        month,
        recurringId: t.id,
        note: t.name,
        createdAt: now,
        updatedAt: now,
      }

      await db.expenses.add(expense)
      created++
    }
  })

  return { created, eligible: eligible.length }
}

function validateRecurring(r: RecurringExpense) {
  if (!r.name) throw new Error('Namn krävs')
  if (!Number.isFinite(r.amountCents) || r.amountCents <= 0) throw new Error('Belopp måste vara större än 0')
  if (!r.categoryId) throw new Error('Kategori krävs')
  if (!Number.isFinite(r.dayOfMonth) || r.dayOfMonth < 1 || r.dayOfMonth > 31) throw new Error('Dag måste vara 1–31')
  if (!/^\d{4}-\d{2}$/.test(r.startMonth)) throw new Error('Ogiltig startmånad')
  if (r.endMonth !== undefined && !/^\d{4}-\d{2}$/.test(r.endMonth)) throw new Error('Ogiltig slutmånad')
  if (r.endMonth !== undefined && r.endMonth < r.startMonth) throw new Error('Slutmånad måste vara efter startmånad')
  if (r.active !== 0 && r.active !== 1) throw new Error('Ogiltigt active-värde')
}

function isEligibleForMonth(t: RecurringExpense, month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return false
  if (month < t.startMonth) return false
  if (t.endMonth && month > t.endMonth) return false
  return true
}


