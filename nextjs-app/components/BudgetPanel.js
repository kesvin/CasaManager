'use client'

import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { CardDescription } from './ui/card'
import { Badge } from './ui/badge'

export default function BudgetPanel(){
  const { state } = useGastos()
  
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const [year, month] = currentMonth.split('-')
  const start = `${year}-${month}-01`
  const end = `${year}-${month}-31`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuestos mensuales</CardTitle>
        <CardDescription>Controla el gasto de cada persona respecto a su presupuesto.</CardDescription>
      </CardHeader>
      <CardContent style={{ maxHeight: 340, overflowY: 'auto' }} className="space-y-4">
        {state.owners.map(o => {
          const budget = state.budgets?.find(b=>b.owner_id===o.id)?.amount || 500
          const spent = state.expenses
            .filter(e => e.owner_id===o.id && e.date>=start && e.date<=end)
            .reduce((s,e) => s+Number(e.amount), 0)
          const pct = budget>0 ? (spent/budget*100) : 0
          const isOver = spent > budget
          const overAmount = Math.max(spent - budget, 0)
          const progressFillColor = isOver
            ? 'var(--purple)'
            : 'var(--green)'

          return (
            <div key={o.id} className="pb-4 border-b last:border-b-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg leading-none" aria-hidden>{o.icon === 'female' ? '👩' : '👨'}</span>
                  <span className="font-medium text-sm truncate">{o.name}</span>
                  {isOver && <Badge variant="destructive">Excedido</Badge>}
                </div>
                <div className="text-sm sm:w-24 sm:text-right font-medium" style={{color: 'var(--text)'}}>
                  {formatMoney(budget)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatMoney(spent)} / {formatMoney(budget)}</span>
                {isOver && <span className="text-xs font-bold" style={{ color: 'var(--purple)' }}>+{formatMoney(overAmount)}</span>}
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden border border-[var(--border)]" style={{ background: 'rgba(0, 0, 0, 0.82)' }}>
                <div 
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: progressFillColor
                  }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
