import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Card, CardPad } from '../../components/Card'
import { Field, Select, TextInput } from '../../components/Field'
import { Modal } from '../../components/Modal'
import { Notice } from '../../components/Notice'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { addExpense, deleteExpense, updateExpense } from '../../db/repositories/expenses'
import { formatCents, parseMoneyToCents } from '../../utils/money'
import { todayISO } from '../../db/helpers'
import type { Expense } from '../../db/types'
import type { RecurringExpense } from '../../db/types'
import {
  addRecurringExpense,
  deleteRecurringExpense,
  generateRecurringForMonth,
  listRecurringExpenses,
  updateRecurringExpense,
} from '../../db/repositories/recurring'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth())
  const [categoryFilter, setCategoryFilter] = useState<string>('') // '' = all
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [recurringOpen, setRecurringOpen] = useState(false)
  const [recurringEditing, setRecurringEditing] = useState<RecurringExpense | null>(null)
  const [recName, setRecName] = useState('')
  const [recAmount, setRecAmount] = useState('')
  const [recCategoryId, setRecCategoryId] = useState('')
  const [recDay, setRecDay] = useState('1')
  const [recStartMonth, setRecStartMonth] = useState(currentMonth())
  const [recEndMonth, setRecEndMonth] = useState('')
  const [recActive, setRecActive] = useState<0 | 1>(1)
  const [recMessage, setRecMessage] = useState<string | null>(null)

  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray(), [])
  const recurring = useLiveQuery(() => listRecurringExpenses(), [])

  const expenses = useLiveQuery(async () => {
    if (!month) return []
    if (categoryFilter) {
      const list = await db.expenses
        .where('[month+categoryId]')
        .equals([month, categoryFilter])
        .toArray()
      return list.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
    }
    const list = await db.expenses.where('month').equals(month).toArray()
    return list.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
  }, [month, categoryFilter])

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories ?? []) map.set(c.id, c.name)
    return map
  }, [categories])

  const totalCents = useMemo(() => (expenses ?? []).reduce((sum, e) => sum + e.amountCents, 0), [expenses])

  function resetForm() {
    setEditing(null)
    setAmount('')
    setCategoryId('')
    setDate(todayISO())
    setNote('')
    setError(null)
  }

  function resetRecurringForm() {
    setRecurringEditing(null)
    setRecName('')
    setRecAmount('')
    setRecCategoryId('')
    setRecDay('1')
    setRecStartMonth(currentMonth())
    setRecEndMonth('')
    setRecActive(1)
  }

  function openNewRecurring() {
    resetRecurringForm()
    setRecurringOpen(true)
  }

  function openEditRecurring(t: RecurringExpense) {
    setRecurringEditing(t)
    setRecName(t.name)
    setRecAmount(String(t.amountCents / 100).replace('.', ','))
    setRecCategoryId(t.categoryId)
    setRecDay(String(t.dayOfMonth))
    setRecStartMonth(t.startMonth)
    setRecEndMonth(t.endMonth ?? '')
    setRecActive(t.active)
    setRecurringOpen(true)
  }

  function openNew() {
    resetForm()
    setOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    setAmount(String(expense.amountCents / 100).replace('.', ','))
    setCategoryId(expense.categoryId)
    setDate(expense.date)
    setNote(expense.note ?? '')
    setError(null)
    setOpen(true)
  }

  async function onSave() {
    try {
      setError(null)
      const cents = parseMoneyToCents(amount)
      if (cents <= 0) throw new Error('Belopp måste vara större än 0')
      if (!categoryId) throw new Error('Välj kategori')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Ogiltigt datum')

      if (editing) {
        await updateExpense(editing.id, { amountCents: cents, categoryId, date, note })
      } else {
        await addExpense({ amountCents: cents, categoryId, date, note })
      }
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel')
    }
  }

  async function onSaveRecurring() {
    try {
      setError(null)
      const cents = parseMoneyToCents(recAmount)
      const day = Number(recDay)
      const start = recStartMonth
      const end = recEndMonth.trim() ? recEndMonth.trim() : undefined
      if (cents <= 0) throw new Error('Belopp måste vara större än 0')
      if (!recCategoryId) throw new Error('Välj kategori')
      if (!/^\d{4}-\d{2}$/.test(start)) throw new Error('Ogiltig startmånad')
      if (end !== undefined && !/^\d{4}-\d{2}$/.test(end)) throw new Error('Ogiltig slutmånad')

      if (recurringEditing) {
        await updateRecurringExpense(recurringEditing.id, {
          name: recName,
          amountCents: cents,
          categoryId: recCategoryId,
          dayOfMonth: day,
          startMonth: start,
          endMonth: end,
          active: recActive,
        })
      } else {
        await addRecurringExpense({
          name: recName,
          amountCents: cents,
          categoryId: recCategoryId,
          dayOfMonth: day,
          startMonth: start,
          endMonth: end,
          active: recActive,
        })
      }

      setRecurringOpen(false)
      resetRecurringForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel')
    }
  }

  return (
    <div className="stack">
      <Card>
        <CardPad>
          <div className="rowBetween" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750 }}>Utgifter</div>
            <Button
              variant="primary"
              onClick={openNew}
              disabled={!categories || categories.length === 0}
              title={!categories || categories.length === 0 ? 'Skapa en kategori först' : undefined}
            >
              Lägg till
            </Button>
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <Field label="Månad">
              <TextInput type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </Field>
            <Field label="Kategori (filter)">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Alla</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="divider" style={{ margin: '12px 0' }} />
          <div className="rowBetween">
            <div className="subtle" style={{ fontSize: 13 }}>
              Totalt denna månad
            </div>
            <div style={{ fontWeight: 750 }}>{formatCents(totalCents)}</div>
          </div>
        </CardPad>
      </Card>

      <Card>
        <CardPad>
          <div className="rowBetween" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750 }}>Återkommande</div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button
                className="smallBtn"
                onClick={async () => {
                  try {
                    setError(null)
                    setRecMessage(null)
                    const res = await generateRecurringForMonth(month)
                    setRecMessage(`Skapade ${res.created} av ${res.eligible} möjliga för ${month}.`)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Något gick fel')
                  }
                }}
                disabled={!categories || categories.length === 0 || !month}
                title={!month ? 'Välj månad' : undefined}
              >
                Skapa för {month}
              </Button>
              <Button className="smallBtn" variant="primary" onClick={openNewRecurring}>
                Ny
              </Button>
            </div>
          </div>

          {recMessage && <Notice variant="success">{recMessage}</Notice>}

          {recurring === undefined ? (
            <div className="subtle" style={{ fontSize: 13 }}>
              Laddar…
            </div>
          ) : recurring.length === 0 ? (
            <Notice>
              Inga återkommande utgifter än. Skapa t.ex. <b>Hyra</b> eller <b>Abonnemang</b>.
            </Notice>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {recurring.map((t) => (
                <div key={t.id} className="card" style={{ boxShadow: 'none' }}>
                  <div className="cardPad">
                    <div className="rowBetween">
                      <div className="stack" style={{ gap: 4 }}>
                        <div style={{ fontWeight: 750 }}>
                          {t.name} {t.active === 0 ? <span className="subtle">(pausad)</span> : null}
                        </div>
                        <div className="subtle" style={{ fontSize: 13 }}>
                          {formatCents(t.amountCents)} • dag {t.dayOfMonth} • {t.startMonth}
                          {t.endMonth ? `–${t.endMonth}` : ''}
                        </div>
                      </div>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Button className="smallBtn" onClick={() => openEditRecurring(t)}>
                          Redigera
                        </Button>
                        <Button
                          className="smallBtn"
                          variant="danger"
                          onClick={async () => {
                            const ok = window.confirm(`Ta bort återkommande "${t.name}"?`)
                            if (!ok) return
                            try {
                              setError(null)
                              await deleteRecurringExpense(t.id)
                            } catch (e) {
                              setError(e instanceof Error ? e.message : 'Något gick fel')
                            }
                          }}
                        >
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardPad>
      </Card>

      <Card>
        <CardPad>
          {!categories || categories.length === 0 ? (
            <Notice variant="error">
              Du behöver skapa minst <b>en kategori</b> innan du kan lägga till utgifter.
            </Notice>
          ) : expenses === undefined ? (
            <div className="subtle" style={{ fontSize: 13 }}>
              Laddar…
            </div>
          ) : expenses.length === 0 ? (
            <Notice>Inga utgifter för vald månad/filter.</Notice>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {expenses.map((e) => (
                <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
                  <div className="cardPad">
                    <div className="rowBetween">
                      <div className="stack" style={{ gap: 4 }}>
                        <div style={{ fontWeight: 750 }}>{formatCents(e.amountCents)}</div>
                        <div className="subtle" style={{ fontSize: 13 }}>
                          {categoryMap.get(e.categoryId) ?? 'Okänd kategori'} • {e.date}
                          {e.note ? ` • ${e.note}` : ''}
                        </div>
                      </div>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Button className="smallBtn" onClick={() => openEdit(e)}>
                          Redigera
                        </Button>
                        <Button
                          className="smallBtn"
                          variant="danger"
                          onClick={async () => {
                            const ok = window.confirm('Ta bort utgift?')
                            if (!ok) return
                            try {
                              setError(null)
                              await deleteExpense(e.id)
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Något gick fel')
                            }
                          }}
                        >
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12 }}>
              <Notice variant="error">{error}</Notice>
            </div>
          )}
        </CardPad>
      </Card>

      <Modal
        open={open}
        title={editing ? 'Redigera utgift' : 'Ny utgift'}
        onClose={() => setOpen(false)}
      >
        <div className="stack">
          {error && <Notice variant="error">{error}</Notice>}
          <Field label="Belopp (kr)">
            <TextInput
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="t.ex. 149,90"
              autoFocus
            />
          </Field>
          <Field label="Kategori">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Välj…</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Datum">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Anteckning (valfritt)">
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="t.ex. ICA" />
          </Field>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <Button onClick={() => setOpen(false)}>Avbryt</Button>
            <Button variant="primary" onClick={onSave}>
              Spara
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={recurringOpen}
        title={recurringEditing ? 'Redigera återkommande' : 'Ny återkommande'}
        onClose={() => setRecurringOpen(false)}
      >
        <div className="stack">
          {error && <Notice variant="error">{error}</Notice>}
          <Field label="Namn">
            <TextInput value={recName} onChange={(e) => setRecName(e.target.value)} placeholder="t.ex. Hyra" autoFocus />
          </Field>
          <Field label="Belopp (kr)">
            <TextInput inputMode="decimal" value={recAmount} onChange={(e) => setRecAmount(e.target.value)} placeholder="t.ex. 8500" />
          </Field>
          <Field label="Kategori">
            <Select value={recCategoryId} onChange={(e) => setRecCategoryId(e.target.value)}>
              <option value="">Välj…</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dag i månaden (1–31)">
            <TextInput inputMode="numeric" value={recDay} onChange={(e) => setRecDay(e.target.value)} />
          </Field>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Startmånad">
                <TextInput type="month" value={recStartMonth} onChange={(e) => setRecStartMonth(e.target.value)} />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Slutmånad (valfritt)">
                <TextInput type="month" value={recEndMonth} onChange={(e) => setRecEndMonth(e.target.value)} />
              </Field>
            </div>
          </div>
          <label className="row" style={{ gap: 10 }}>
            <input
              type="checkbox"
              checked={recActive === 1}
              onChange={(e) => setRecActive(e.target.checked ? 1 : 0)}
            />
            <span className="subtle" style={{ fontSize: 13 }}>
              Aktiv
            </span>
          </label>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <Button onClick={() => setRecurringOpen(false)}>Avbryt</Button>
            <Button variant="primary" onClick={onSaveRecurring}>
              Spara
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


