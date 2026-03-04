'use client'

import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { CardDescription } from './ui/card'

function daysUntilNextCharge(targetDay){
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const safeCurrentDay = Math.min(Math.max(Number(targetDay || 1), 1), currentMonthDays)
  let nextCharge = new Date(now.getFullYear(), now.getMonth(), safeCurrentDay)

  if(nextCharge < today){
    const nextMonthDays = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
    const safeNextDay = Math.min(Math.max(Number(targetDay || 1), 1), nextMonthDays)
    nextCharge = new Date(now.getFullYear(), now.getMonth() + 1, safeNextDay)
  }

  const diffMs = nextCharge.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

function daysTrafficClass(days){
  if(Number(days) < 3) return 'text-red-300'
  if(Number(days) >= 7) return 'text-emerald-300'
  return 'text-amber-300'
}

export default function FixedExpensesPanel(){
  const { state } = useGastos()

  const activeFixed = (state.fixedExpenses || []).filter(item => item.active)
  const totalMonthly = activeFixed.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const nextChargeDays = activeFixed.length
    ? Math.min(...activeFixed.map(item => daysUntilNextCharge(item.day)))
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos fijos mensuales</CardTitle>
        <CardDescription>Lista de pagos recurrentes y próximos cargos.</CardDescription>
      </CardHeader>
      <CardContent style={{ maxHeight: 340, overflowY: 'auto' }} className="space-y-3">
        <div className="grid grid-cols-3 gap-x-1.5 gap-y-1 pb-1">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Activos
            </div>
            <div className="mt-0.5 text-xs sm:text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {activeFixed.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              <span className="sm:hidden">Total</span>
              <span className="hidden sm:inline">Total mensual</span>
            </div>
            <div className="mt-0.5 text-[11px] sm:text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {formatMoney(totalMonthly)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              <span className="sm:hidden">Próximo</span>
              <span className="hidden sm:inline">Próximo cargo</span>
            </div>
            <div className="mt-0.5 text-[11px] sm:text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {nextChargeDays === null ? '—' : `${nextChargeDays} días`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {activeFixed.slice(0, 8).map(item => {
            const pendingDays = daysUntilNextCharge(item.day)

            return (
            <div key={item.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-center">
              <div className="text-xs sm:text-sm font-semibold break-words leading-tight" style={{ color: 'var(--text)' }}>
                {item.name}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: 'var(--muted)' }}>
                Día {item.day}
              </div>
              <div className={`text-[11px] ${daysTrafficClass(pendingDays)}`}>
                Faltan {pendingDays} días
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {formatMoney(item.amount)}
              </div>
            </div>
          )})}
          {activeFixed.length === 0 && (
            <div className="text-xs text-center col-span-full" style={{ color: 'var(--muted)' }}>
              No hay gastos fijos activos.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
