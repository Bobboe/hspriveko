export type Category = {
  id: string
  name: string
  monthlyBudgetCents: number
  createdAt: number
  updatedAt: number
}

export type Expense = {
  id: string
  amountCents: number
  categoryId: string
  date: string // YYYY-MM-DD
  month: string // YYYY-MM
  recurringId?: string // set when generated from a recurring template
  note?: string
  createdAt: number
  updatedAt: number
}

export type RecurringExpense = {
  id: string
  name: string
  amountCents: number
  categoryId: string
  dayOfMonth: number // 1-31
  startMonth: string // YYYY-MM
  endMonth?: string // YYYY-MM
  active: 0 | 1
  createdAt: number
  updatedAt: number
}


