import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Card, CardPad } from '../../components/Card'
import { Field, TextInput } from '../../components/Field'
import { Modal } from '../../components/Modal'
import { Notice } from '../../components/Notice'
import { deleteCategory, listCategories, addCategory, updateCategory } from '../../db/repositories/categories'
import { useLiveQuery } from 'dexie-react-hooks'
import { formatCents, parseMoneyToCents } from '../../utils/money'

export function CategoriesPage() {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('0')
  const [error, setError] = useState<string | null>(null)

  const categories = useLiveQuery(() => listCategories(), [])

  const editing = useMemo(
    () => categories?.find((c) => c.id === editingId) ?? null,
    [categories, editingId],
  )

  function resetForm() {
    setName('')
    setBudget('0')
    setEditingId(null)
    setError(null)
  }

  function openNew() {
    resetForm()
    setOpen(true)
  }

  function openEdit(id: string) {
    const c = categories?.find((x) => x.id === id)
    if (!c) return
    setEditingId(c.id)
    setName(c.name)
    setBudget(String(c.monthlyBudgetCents / 100).replace('.', ','))
    setError(null)
    setOpen(true)
  }

  async function onSave() {
    try {
      setError(null)
      const cents = parseMoneyToCents(budget)
      if (cents < 0) throw new Error('Budget måste vara 0 eller mer')

      if (editing) {
        await updateCategory(editing.id, { name, monthlyBudgetCents: cents })
      } else {
        await addCategory({ name, monthlyBudgetCents: cents })
      }
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel')
    }
  }

  return (
    <div className="stack">
      <Card>
        <CardPad>
          <div className="rowBetween" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750 }}>Kategorier & Budget</div>
            <Button variant="primary" onClick={openNew}>
              Ny kategori
            </Button>
          </div>
          <div className="subtle" style={{ fontSize: 13 }}>
            Tips: du kan inte ta bort en kategori som har utgifter — flytta utgifterna först.
          </div>
        </CardPad>
      </Card>

      <Card>
        <CardPad>
          {categories === undefined ? (
            <div className="subtle" style={{ fontSize: 13 }}>
              Laddar…
            </div>
          ) : categories.length === 0 ? (
            <Notice>
              Inga kategorier än. Skapa en med <b>Ny kategori</b>.
            </Notice>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {categories.map((c) => (
                <div key={c.id} className="card" style={{ boxShadow: 'none' }}>
                  <div className="cardPad">
                    <div className="rowBetween">
                      <div className="stack" style={{ gap: 4 }}>
                        <div style={{ fontWeight: 750 }}>{c.name}</div>
                        <div className="subtle" style={{ fontSize: 13 }}>
                          Budget: {formatCents(c.monthlyBudgetCents)}
                        </div>
                      </div>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Button className="smallBtn" onClick={() => openEdit(c.id)}>
                          Redigera
                        </Button>
                        <Button
                          className="smallBtn"
                          variant="danger"
                          onClick={async () => {
                            const ok = window.confirm(`Ta bort kategori "${c.name}"?`)
                            if (!ok) return
                            try {
                              setError(null)
                              await deleteCategory(c.id)
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

          {error && (
            <div style={{ marginTop: 12 }}>
              <Notice variant="error">{error}</Notice>
            </div>
          )}
        </CardPad>
      </Card>

      <Modal
        open={open}
        title={editing ? 'Redigera kategori' : 'Ny kategori'}
        onClose={() => setOpen(false)}
      >
        <div className="stack">
          {error && <Notice variant="error">{error}</Notice>}
          <Field label="Namn">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="t.ex. Mat"
              autoFocus
            />
          </Field>
          <Field label="Månadsbudget (kr)">
            <TextInput
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
            />
          </Field>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <Button onClick={() => setOpen(false)}>Avbryt</Button>
            <Button variant="primary" onClick={onSave}>
              Spara
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


