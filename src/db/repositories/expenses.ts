import { db } from '../db'
import { monthFromDate, newId, todayISO } from '../helpers'
import type { Expense } from '../types'

export async function listExpensesByMonth(month: string) {
  return db.expenses.where('month').equals(month).reverse().sortBy('date')
}

export async function listExpensesByMonthAndCategory(month: string, categoryId: string) {
  return db.expenses.where('[month+categoryId]').equals([month, categoryId]).reverse().sortBy('date')
}

export async function addExpense(input: {
  amountCents: number
  categoryId: string
  date?: string
  note?: string
}) {
  const now = Date.now()
  const date = input.date ?? todayISO()
  const expense: Expense = {
    id: newId(),
    amountCents: input.amountCents,
    categoryId: input.categoryId,
    date,
    month: monthFromDate(date),
    note: input.note?.trim() ? input.note.trim() : undefined,
    createdAt: now,
    updatedAt: now,
  }

  if (!Number.isFinite(expense.amountCents) || expense.amountCents <= 0) {
    throw new Error('Belopp måste vara större än 0')
  }
  if (!expense.categoryId) throw new Error('Kategori krävs')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense.date)) throw new Error('Ogiltigt datum')

  await db.expenses.add(expense)
  return expense
}

export async function updateExpense(
  id: string,
  patch: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'date' | 'note'>>,
) {
  const updates: Partial<Expense> = { ...patch, updatedAt: Date.now() }

  if (updates.note !== undefined) updates.note = updates.note?.trim() || undefined
  if (updates.date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.date)) throw new Error('Ogiltigt datum')
    updates.month = monthFromDate(updates.date)
  }
  if (updates.amountCents !== undefined) {
    if (!Number.isFinite(updates.amountCents) || updates.amountCents <= 0) {
      throw new Error('Belopp måste vara större än 0')
    }
  }
  if (updates.categoryId !== undefined && !updates.categoryId) throw new Error('Kategori krävs')

  await db.expenses.update(id, updates)
}

export async function deleteExpense(id: string) {
  await db.expenses.delete(id)
}


