import Dexie, { type Table } from 'dexie'
import type { Category, Expense, RecurringExpense } from './types'

export class BudgetDB extends Dexie {
  categories!: Table<Category, string>
  expenses!: Table<Expense, string>
  recurringExpenses!: Table<RecurringExpense, string>

  constructor() {
    super('hspriveko-budget-db')

    this.version(1).stores({
      categories: 'id, name, createdAt, updatedAt',
      expenses: 'id, month, categoryId, [month+categoryId], date, createdAt, updatedAt',
    })

    this.version(2).stores({
      categories: 'id, name, createdAt, updatedAt',
      expenses:
        'id, month, categoryId, recurringId, [month+categoryId], [month+recurringId], date, createdAt, updatedAt',
      recurringExpenses: 'id, active, startMonth, endMonth, categoryId, createdAt, updatedAt',
    })
  }
}

export const db = new BudgetDB()


