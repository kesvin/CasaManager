'use client'

import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function AccountsPage(){
  const { state } = useGastos()

  const balances = {}
  state.accounts.forEach(a => balances[a.id] = 0)
  state.expenses.forEach(e => { if(balances[e.account_id]!==undefined) balances[e.account_id]+=Number(e.amount) })

  return (
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.accounts.map(a => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{`${a.name === 'Efectivo' ? '💵 ' : a.name === 'Tarjeta' ? '💳 ' : '🏦 '}${a.name}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{formatMoney(balances[a.id]||0)}</div>
              <div className="text-sm text-[var(--muted)] mt-2">Movimientos recientes y detalles disponibles en Gastos.</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
