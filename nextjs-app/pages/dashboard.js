import { useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import ExpensesList from '../components/ExpensesList'
import BudgetPanel from '../components/BudgetPanel'
import CategoryChart from '../components/CategoryChart'
import FixedExpensesPanel from '../components/FixedExpensesPanel'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { CardDescription } from '../components/ui/card'

export default function DashboardPage(){
  const { state } = useGastos()
  const [selectedSummaryCategoryId, setSelectedSummaryCategoryId] = useState('all')
  const now = new Date()
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthPrefix = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`

  const currentMonthExpenses = state.expenses.filter(e => String(e.date || '').startsWith(currentMonthPrefix))
  const previousMonthExpenses = state.expenses.filter(e => String(e.date || '').startsWith(previousMonthPrefix))

  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const previousMonthTotal = previousMonthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const monthlyDifference = currentMonthTotal - previousMonthTotal
  const trendPercent = previousMonthTotal > 0
    ? ((monthlyDifference / previousMonthTotal) * 100)
    : null

  const currentMonthByCategory = currentMonthExpenses.reduce((acc, expense) => {
    const category = state.categories.find(c => c.id === expense.category_id)
    const categoryId = String(category?.id || 'uncategorized')
    const categoryName = category?.name || 'Sin categoría'
    if(!acc[categoryId]){
      acc[categoryId] = { categoryId, categoryName, amount: 0 }
    }
    acc[categoryId].amount += Number(expense.amount || 0)
    return acc
  }, {})

  const categoryDistribution = Object.values(currentMonthByCategory)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map(({ categoryId, categoryName, amount }) => {
      const percentage = currentMonthTotal > 0 ? (amount / currentMonthTotal) * 100 : 0
      return {
        categoryId,
        categoryName,
        amount,
        percentage
      }
    })

  const topCategory = categoryDistribution[0] || null
  const selectedSummaryCategoryName = selectedSummaryCategoryId === 'all'
    ? ''
    : (state.categories.find(c => String(c.id) === String(selectedSummaryCategoryId))?.name || 'Sin categoría')

  const monthlyExpensesCount = currentMonthExpenses.length
  const averageExpense = monthlyExpensesCount > 0 ? currentMonthTotal / monthlyExpensesCount : 0
  const totalMonthlyBudget = (state.owners || []).reduce((sum, owner) => {
    const ownerBudget = state.budgets?.find(b => b.owner_id === owner.id)?.amount
    return sum + Number(ownerBudget ?? 500)
  }, 0)
  const isOverMonthlyBudget = currentMonthTotal > totalMonthlyBudget
  const monthlyBudgetOverrun = Math.max(currentMonthTotal - totalMonthlyBudget, 0)

  const trendCopy = monthlyDifference > 0
    ? 'Este mes estás gastando más que el anterior.'
    : monthlyDifference < 0
      ? 'Buen ritmo: este mes vas por debajo del mes anterior.'
      : 'Mismo ritmo de gasto que el mes pasado.'

  return (
    <div className="space-y-6">
          <Card
            style={{
              background: 'rgba(0, 0, 0, 0.82)',
              borderColor: 'var(--border)',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.42)'
            }}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text)', opacity: 0.86 }}>
                    Resumen mensual
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold mt-1">Panorama de tus gastos</h1>
                  <CardDescription className="mt-1">Comparativa y tendencia de tus gastos este mes.</CardDescription>
                  <p className="text-sm mt-1" style={{ color: 'var(--text)', opacity: 0.9 }}>{trendCopy}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[var(--card)] px-4 py-4 text-center flex flex-col items-center justify-center min-h-[92px]" style={{ maxHeight: 120, overflowY: 'auto' }}>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text)', opacity: 0.8 }}>Gasto del mes</div>
                    <div className={`text-base sm:text-lg font-semibold mt-1 text-center ${isOverMonthlyBudget ? 'text-red-400' : ''}`}>
                      {formatMoney(currentMonthTotal)}
                    </div>
                    {isOverMonthlyBudget && (
                      <div className="text-[11px] mt-1 text-center text-red-400">
                        Has superado el presupuesto mensual en +{formatMoney(monthlyBudgetOverrun)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-[var(--card)] px-4 py-4 text-center flex flex-col items-center justify-center min-h-[92px]">
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text)', opacity: 0.8 }}>Variación mensual</div>
                    <div className={`text-base sm:text-lg font-semibold mt-1 text-center ${trendPercent === null ? '' : trendPercent > 0 ? 'text-white' : trendPercent < 0 ? 'text-red-400' : ''}`}>
                      {trendPercent === null ? '—' : `${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%`}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[var(--card)] px-4 py-4 text-center flex flex-col items-center justify-center min-h-[92px]">
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text)', opacity: 0.8 }}>Categoría principal</div>
                    <div className="text-base sm:text-lg font-semibold mt-1 text-center">{topCategory ? topCategory.categoryName : 'Sin datos'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div id="infografia-categorias" className="rounded-xl bg-[var(--card)] px-4 py-3 infografia-categorias" style={{ minHeight: 320, height: '100%', maxHeight: 410 }}>
                      <div className="text-[11px] tracking-wide mt-2 mb-3" style={{ color: 'var(--muted)' }}>Infografía · Distribución por categorías</div>
                      <div className="h-[340px] overflow-y-auto pr-1 space-y-4 pb-2">
                        {categoryDistribution.length === 0 && (
                          <div className="text-sm" style={{ color: 'var(--muted)' }}>
                            Aún no hay gastos este mes para mostrar distribución.
                          </div>
                        )}

                        {categoryDistribution.slice(0,6).map((item, index) => {
                          const isActiveCategory = String(selectedSummaryCategoryId) === String(item.categoryId)
                          return (
                            <button
                              type="button"
                              key={`category-distribution-${item.categoryId}`}
                              className={`w-full text-left rounded-md px-2 py-2 transition-colors ${isActiveCategory ? 'bg-red-700/40' : 'hover:bg-red-700/25'}`}
                              onClick={() => setSelectedSummaryCategoryId(prev => String(prev) === String(item.categoryId) ? 'all' : item.categoryId)}
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate" title={item.categoryName}>{item.categoryName}</span>
                                <span className="font-semibold">{item.percentage.toFixed(1)}%</span>
                              </div>
                              <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgb(227 20 103 / 42%)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.max(item.percentage, 4)}%`,
                                    backgroundColor: 'var(--text)',
                                    opacity: Math.max(0.35, 1 - index * 0.12)
                                  }}
                                />
                              </div>
                              <div className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                                {formatMoney(item.amount)}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div id="infografia-composicion" className="rounded-xl bg-[var(--card)] px-4 py-3 infografia-composicion" style={{ minHeight: 220, height: 'auto', maxHeight: 'none' }}>
                    <div className="text-[11px] tracking-wide" style={{ color: 'var(--muted)' }}>Infografía · Composición del mes</div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded-lg bg-[var(--card)] px-4 py-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Total de movimientos</div>
                        <div className="text-base font-semibold mt-1 text-center">{monthlyExpensesCount}</div>
                      </div>
                      <div className="rounded-lg bg-[var(--card)] px-4 py-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Gasto promedio</div>
                        <div className="text-base font-semibold mt-1 text-center">{formatMoney(averageExpense)}</div>
                      </div>
                      <div className="rounded-lg bg-[var(--card)] px-4 py-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Mes comparado</div>
                        <div className={`text-base font-semibold mt-1 text-center ${monthlyDifference > 0 ? 'text-white' : monthlyDifference < 0 ? 'text-red-400' : ''}`}>
                          {monthlyDifference > 0 ? '+' : ''}{formatMoney(monthlyDifference)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-[var(--card)] px-3 py-3">
                      <div className="text-[11px] tracking-wide" style={{ color: 'var(--muted)' }}>
                        Gráfica STONKS · composición por categoría
                      </div>

                      {categoryDistribution.length === 0 ? (
                        <div className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                          Sin datos suficientes para dibujar la gráfica.
                        </div>
                      ) : (() => {
                        const chartWidth = 560
                        const chartHeight = 170
                        const padX = 18
                        const padY = 16
                        const values = categoryDistribution.map(item => item.percentage)
                        const maxValue = Math.max(...values, 1)
                        const minValue = Math.min(...values, 0)
                        const valueRange = Math.max(maxValue - minValue, 1)

                        const points = categoryDistribution.map((item, index) => {
                          const x = padX + ((chartWidth - padX * 2) * index) / Math.max(categoryDistribution.length - 1, 1)
                          const y = chartHeight - padY - ((item.percentage - minValue) / valueRange) * (chartHeight - padY * 2)
                          return {
                            x,
                            y,
                            name: item.categoryName,
                            value: item.percentage
                          }
                        })

                        const buildSmoothPath = (chartPoints) => {
                          if (chartPoints.length <= 1) {
                            return `M ${chartPoints[0].x} ${chartPoints[0].y}`
                          }

                          let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`
                          for (let index = 0; index < chartPoints.length - 1; index += 1) {
                            const current = chartPoints[index]
                            const next = chartPoints[index + 1]
                            const controlX = (current.x + next.x) / 2
                            path += ` Q ${controlX} ${current.y}, ${next.x} ${next.y}`
                          }
                          return path
                        }

                        const linePath = buildSmoothPath(points)
                        const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padY} L ${points[0].x} ${chartHeight - padY} Z`
                        const highlightedPoint = points.reduce((prev, current) => current.value > prev.value ? current : prev, points[0])

                        return (
                          <>
                            <div className="mt-2 rounded-md overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.45)' }}>
                              <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="xMidYMid meet"
                                role="img"
                                aria-label="Composición mensual por categoría"
                                style={{ width: '100%', height: 'auto', maxWidth: '100%', display: 'block' }}
                              >
                                <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke="rgb(227 20 103 / 22%)" strokeWidth="1" />
                                <line x1={padX} y1={(chartHeight - padY + padY) / 2} x2={chartWidth - padX} y2={(chartHeight - padY + padY) / 2} stroke="rgb(227 20 103 / 16%)" strokeWidth="1" />
                                <path d={areaPath} fill="rgb(227 20 103 / 22%)" opacity="0">
                                  <animate attributeName="opacity" from="0" to="1" dur="0.7s" fill="freeze" />
                                </path>
                                <path
                                  d={linePath}
                                  fill="none"
                                  stroke="rgb(227 20 103 / 28%)"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  pathLength="100"
                                  strokeDasharray="100"
                                  strokeDashoffset="100"
                                >
                                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.9s" fill="freeze" />
                                </path>
                                <path
                                  d={linePath}
                                  fill="none"
                                  stroke="rgb(227 20 103 / 42%)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  pathLength="100"
                                  strokeDasharray="100"
                                  strokeDashoffset="100"
                                >
                                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.9s" fill="freeze" />
                                </path>

                                {points.map((point, index) => (
                                  <circle
                                    key={`composition-point-${index}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.name === highlightedPoint.name ? 5 : 3.5}
                                    fill="var(--text)"
                                    opacity={point.name === highlightedPoint.name ? 1 : 0.85}
                                    style={point.name === highlightedPoint.name ? { filter: 'drop-shadow(0 0 6px rgb(227 20 103 / 60%))' } : undefined}
                                  />
                                ))}

                                <text
                                  x={highlightedPoint.x}
                                  y={Math.max(highlightedPoint.y - 10, 12)}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill="var(--text)"
                                  style={{ fontWeight: 700 }}
                                >
                                  {highlightedPoint.value.toFixed(1)}%
                                </text>
                              </svg>
                            </div>

                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                              {categoryDistribution.map(item => (
                                <div key={`composition-label-${item.categoryId}`} className="truncate" title={`${item.categoryName}: ${item.percentage.toFixed(1)}%`}>
                                  {item.categoryName} · {item.percentage.toFixed(1)}%
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="text-xs tracking-wide" style={{ color: 'var(--muted)' }}>
              Movimiento reciente
            </div>
            <ExpensesList
              title="Todos los gastos"
              showAll
              colorOwnerByGender
              scrollable
              scrollHeightClass="max-h-96"
              showInlineFilters
              externalCategoryId={selectedSummaryCategoryId}
              externalCategoryLabel={selectedSummaryCategoryName}
              onClearExternalCategory={() => setSelectedSummaryCategoryId('all')}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs tracking-wide" style={{ color: 'var(--muted)' }}>
              Visión complementaria
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <BudgetPanel />
                <FixedExpensesPanel />
              </div>

              <div className="space-y-6">
                <Card
                  style={{
                    background: 'rgba(0, 0, 0, 0.82)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 8px 26px rgba(0, 0, 0, 0.42)'
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-base">Balances por cuenta</CardTitle>
                    <CardDescription>Saldo actual por cada cuenta registrada.</CardDescription>
                                        <CardDescription className="mb-2">Visualiza la distribución de gastos por categoría.</CardDescription>
                                        <CardDescription className="mb-2">Gráfica STONKS: composición mensual por categoría.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {state.accounts.map(a => {
                      const balance = state.expenses
                        .filter(e => e.account_id === a.id)
                        .reduce((sum, e) => sum + Number(e.amount), 0)
                      const accountLabel = `${a.name === 'Efectivo' ? '💵 ' : a.name === 'Tarjeta' ? '💳 ' : '🏦 '}${a.name}`
                      return (
                        <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="text-sm">{accountLabel}</span>
                          <span className="font-semibold text-sm">{formatMoney(balance)}</span>
                        </div>
                      )
                    })}

                    <div className="pt-2 border-t mt-3">
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Por persona</div>
                      {state.owners.map(o => {
                        const ownerSum = state.expenses
                          .filter(e => e.owner_id === o.id)
                          .reduce((sum, e) => sum + Number(e.amount), 0)
                        return (
                          <div key={o.id} className="flex justify-between items-center py-1">
                            <span className="text-xs">{o.name}</span>
                            <span className="text-xs font-semibold">{formatMoney(ownerSum)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <CategoryChart />
              </div>
            </div>
          </div>
    </div>
  )
}
