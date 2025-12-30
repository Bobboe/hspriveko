import { db } from '../db'
import { newId } from '../helpers'
import type { Category } from '../types'

export async function listCategories() {
  return db.categories.orderBy('name').toArray()
}

export async function addCategory(input: { name: string; monthlyBudgetCents: number }) {
  const now = Date.now()
  const category: Category = {
    id: newId(),
    name: input.name.trim(),
    monthlyBudgetCents: input.monthlyBudgetCents,
    createdAt: now,
    updatedAt: now,
  }

  if (!category.name) throw new Error('Namn krävs')
  if (!Number.isFinite(category.monthlyBudgetCents) || category.monthlyBudgetCents < 0) {
    throw new Error('Budget måste vara 0 eller mer')
  }

  await db.categories.add(category)
  return category
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'monthlyBudgetCents'>>,
) {
  const updates: Partial<Category> = { ...patch, updatedAt: Date.now() }

  if (typeof updates.name === 'string') updates.name = updates.name.trim()
  if (updates.name !== undefined && !updates.name) throw new Error('Namn krävs')
  if (updates.monthlyBudgetCents !== undefined) {
    if (!Number.isFinite(updates.monthlyBudgetCents) || updates.monthlyBudgetCents < 0) {
      throw new Error('Budget måste vara 0 eller mer')
    }
  }

  await db.categories.update(id, updates)
}

export async function deleteCategory(id: string) {
  const count = await db.expenses.where('categoryId').equals(id).count()
  if (count > 0) {
    throw new Error('Kan inte ta bort kategori som har utgifter. Flytta utgifterna först.')
  }
  const recurringCount = await db.recurringExpenses.where('categoryId').equals(id).count()
  if (recurringCount > 0) {
    throw new Error('Kan inte ta bort kategori som används av återkommande utgifter. Ändra dem först.')
  }
  await db.categories.delete(id)
}


