import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardPad } from '../../components/Card'
import { Field, TextInput } from '../../components/Field'
import { Notice } from '../../components/Notice'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { formatCents } from '../../utils/money'
import { monthsBackFrom } from '../../utils/date'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function OverviewPage() {
  const [month, setMonth] = useState(currentMonth())

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map((x) => Number(x))
    if (!y || !m) return month
    return new Date(y, m - 1, 1).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })
  }, [month])

  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray(), [])
  const expenses = useLiveQuery(() => db.expenses.where('month').equals(month).toArray(), [month])
  const trend = useLiveQuery(async () => {
    const months = monthsBackFrom(month, 6)
    const lists = await Promise.all(months.map((m) => db.expenses.where('month').equals(m).toArray()))
    const totals = months.map((m, i) => ({
      month: m,
      totalCents: lists[i].reduce((sum, e) => sum + e.amountCents, 0),
    }))
    const max = totals.reduce((mx, t) => Math.max(mx, t.totalCents), 0)
    return { totals, max }
  }, [month])

  const { totals, byCategory } = useMemo(() => {
    const spentByCat = new Map<string, number>()
    for (const e of expenses ?? []) {
      spentByCat.set(e.categoryId, (spentByCat.get(e.categoryId) ?? 0) + e.amountCents)
    }

    const cats = categories ?? []
    const list = cats.map((c) => {
      const spent = spentByCat.get(c.id) ?? 0
      const budget = c.monthlyBudgetCents
      const remaining = budget - spent
      const ratio = budget > 0 ? Math.min(1, Math.max(0, spent / budget)) : 0
      const over = budget > 0 && spent > budget
      return { id: c.id, name: c.name, budget, spent, remaining, ratio, over }
    })

    const totalSpent = (expenses ?? []).reduce((sum, e) => sum + e.amountCents, 0)
    const totalBudget = cats.reduce((sum, c) => sum + c.monthlyBudgetCents, 0)
    return {
      totals: { totalSpent, totalBudget, totalRemaining: totalBudget - totalSpent },
      byCategory: list,
    }
  }, [categories, expenses])

  const topCategories = useMemo(() => {
    return [...byCategory].sort((a, b) => b.spent - a.spent).filter((c) => c.spent > 0).slice(0, 5)
  }, [byCategory])

  return (
    <div className="stack">
      <Card>
        <CardPad>
          <div className="rowBetween" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750 }}>Översikt</div>
            <span className="chip">{monthLabel}</span>
          </div>
          <Field label="Månad">
            <TextInput type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </Field>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div className="rowBetween">
            <div className="subtle" style={{ fontSize: 13 }}>
              Spenderat
            </div>
            <div style={{ fontWeight: 750 }}>{formatCents(totals.totalSpent)}</div>
          </div>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <div className="subtle" style={{ fontSize: 13 }}>
              Total budget
            </div>
            <div style={{ fontWeight: 750 }}>{formatCents(totals.totalBudget)}</div>
          </div>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <div className="subtle" style={{ fontSize: 13 }}>
              Kvar
            </div>
            <div style={{ fontWeight: 750 }}>{formatCents(totals.totalRemaining)}</div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btnPrimary" to="/expenses" style={{ flex: 1, textAlign: 'center' }}>
              Lägg till utgift
            </Link>
            <Link className="btn" to="/categories" style={{ flex: 1, textAlign: 'center' }}>
              Kategorier
            </Link>
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
            <Notice variant="error">
              Inga kategorier än. Skapa en under <b>Kategorier</b> för att komma igång.
            </Notice>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {byCategory.map((c) => (
                <div key={c.id} className="card" style={{ boxShadow: 'none' }}>
                  <div className="cardPad">
                    <div className="rowBetween">
                      <div style={{ fontWeight: 750 }}>{c.name}</div>
                      <span className="chip">{formatCents(c.spent)}</span>
                    </div>
                    <div className="subtle" style={{ fontSize: 13, marginTop: 6 }}>
                      Budget: {formatCents(c.budget)} • Kvar: {formatCents(c.remaining)}
                    </div>
                    <div className="progressWrap" style={{ marginTop: 10 }}>
                      <div
                        className={c.over ? 'progressBarOver' : 'progressBar'}
                        style={{ width: `${Math.round(c.ratio * 100)}%` }}
                      />
                    </div>
                    {c.over && (
                      <div style={{ marginTop: 10 }}>
                        <Notice variant="error">Över budget för månaden.</Notice>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardPad>
      </Card>

      <Card>
        <CardPad>
          <div className="rowBetween" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750 }}>Statistik</div>
            <span className="chip">Senaste 6 månader</span>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <div>
              <div className="subtle" style={{ fontSize: 13, marginBottom: 8 }}>
                Toppkategorier ({month})
              </div>
              {topCategories.length === 0 ? (
                <Notice>Inga utgifter i vald månad.</Notice>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {topCategories.map((c) => {
                    const pct = totals.totalSpent > 0 ? Math.round((c.spent / totals.totalSpent) * 100) : 0
                    return (
                      <div key={c.id} className="card" style={{ boxShadow: 'none' }}>
                        <div className="cardPad">
                          <div className="rowBetween">
                            <div style={{ fontWeight: 750 }}>{c.name}</div>
                            <span className="chip">
                              {formatCents(c.spent)} • {pct}%
                            </span>
                          </div>
                          <div className="progressWrap" style={{ marginTop: 10 }}>
                            <div className="progressBar" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="divider" />

            <div>
              <div className="subtle" style={{ fontSize: 13, marginBottom: 8 }}>
                Trend (totalt spenderat)
              </div>
              {trend === undefined ? (
                <div className="subtle" style={{ fontSize: 13 }}>
                  Laddar…
                </div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {trend.totals.map((t) => {
                    const pct = trend.max > 0 ? Math.round((t.totalCents / trend.max) * 100) : 0
                    return (
                      <div key={t.month} className="card" style={{ boxShadow: 'none' }}>
                        <div className="cardPad">
                          <div className="rowBetween">
                            <div className="subtle" style={{ fontSize: 13 }}>
                              {t.month}
                            </div>
                            <div style={{ fontWeight: 750 }}>{formatCents(t.totalCents)}</div>
                          </div>
                          <div className="progressWrap" style={{ marginTop: 10 }}>
                            <div className="progressBar" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardPad>
      </Card>
    </div>
  )
}


