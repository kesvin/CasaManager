'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'

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

export default function FixedExpensesManager(){
  const { state, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useGastos()

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    amount: '',
    day: 1,
    account_id: state.accounts[0]?.id || 1,
    owner_id: state.owners[0]?.id || 1,
    category_id: ''
  })
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    day: 1,
    account_id: state.accounts[0]?.id || 1,
    owner_id: state.owners[0]?.id || 1,
    category_id: '',
    active: true
  })

  const monthlyTotal = useMemo(() => {
    return (state.fixedExpenses || [])
      .filter(item => item.active)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [state.fixedExpenses])
  const activeCount = (state.fixedExpenses || []).filter(item => item.active).length
  const inactiveCount = Math.max((state.fixedExpenses || []).length - activeCount, 0)

  const handleAdd = () => {
    if(!form.name.trim() || !form.amount){
      toast.error('Completa Nombre e Importe para añadir el gasto fijo.')
      return
    }

    addFixedExpense({
      name: form.name,
      amount: Number(form.amount),
      day: Number(form.day || 1),
      account_id: Number(form.account_id),
      owner_id: Number(form.owner_id),
      category_id: form.category_id ? Number(form.category_id) : null,
      active: true
    })

    setForm(prev => ({
      ...prev,
      name: '',
      amount: '',
      day: 1,
      category_id: ''
    }))
    toast.success('Gasto fijo mensual añadido.')
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      name: String(item.name || ''),
      amount: String(item.amount || ''),
      day: Number(item.day || 1),
      account_id: Number(item.account_id || state.accounts[0]?.id || 1),
      owner_id: Number(item.owner_id || state.owners[0]?.id || 1),
      category_id: item.category_id ? String(item.category_id) : '',
      active: item.active !== false
    })
  }

  const handleSaveEdit = () => {
    if(!editingId) return
    if(!editForm.name.trim() || !editForm.amount){
      toast.error('Completa Nombre e Importe para guardar el gasto fijo.')
      return
    }

    updateFixedExpense(editingId, {
      name: editForm.name.trim(),
      amount: Number(editForm.amount),
      day: Number(editForm.day || 1),
      account_id: Number(editForm.account_id),
      owner_id: Number(editForm.owner_id),
      category_id: editForm.category_id ? Number(editForm.category_id) : null,
      active: editForm.active
    })

    setEditingId(null)
    toast.success('Gasto fijo actualizado.')
  }

  return (
    <Card variant="form">
      <CardHeader>
        <CardTitle>➕ Añadir gastos mensuales fijos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="block mb-1.5">Nombre</Label>
            <Input
              type="text"
              placeholder="Ej: Alquiler"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="h-9"
            />
          </div>
          <div>
            <Label className="block mb-1.5">Importe (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
              className="h-9"
            />
          </div>
          <div>
            <Label className="block mb-1.5">Día del mes</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={form.day}
              onChange={(e) => setForm(prev => ({ ...prev, day: e.target.value }))}
              className="h-9"
            />
          </div>
          <div>
            <Label className="block mb-1.5">Cuenta</Label>
            <Select className="h-9 py-2" value={form.account_id} onChange={(e) => setForm(prev => ({ ...prev, account_id: e.target.value }))}>
              {state.accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="block mb-1.5">Persona</Label>
            <Select className="h-9 py-2" value={form.owner_id} onChange={(e) => setForm(prev => ({ ...prev, owner_id: e.target.value }))}>
              {state.owners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="block mb-1.5">Categoría</Label>
            <Select className="h-9 py-2" value={form.category_id} onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}>
              <option value="">(sin categoría)</option>
              {state.categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="success" onClick={handleAdd}>Añadir gasto fijo</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl p-3 bg-[var(--card)]">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Fijos activos</div>
            <div className="mt-1 text-base font-semibold text-[var(--text)]">{activeCount}</div>
          </div>
          <div className="rounded-xl p-3 bg-[var(--card)]">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Inactivos</div>
            <div className="mt-1 text-base font-semibold text-[var(--text)]">{inactiveCount}</div>
          </div>
          <div className="rounded-xl p-3 bg-[var(--card)]">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Total mensual estimado</div>
            <div className="mt-1 text-base font-semibold text-[var(--text)]">{formatMoney(monthlyTotal)}</div>
          </div>
        </div>

        <div className="space-y-2">
          {(state.fixedExpenses || []).map(item => {
            const owner = state.owners.find(ownerItem => ownerItem.id === item.owner_id)
            const account = state.accounts.find(accountItem => accountItem.id === item.account_id)
            const category = state.categories.find(categoryItem => categoryItem.id === item.category_id)
            const remainingDays = daysUntilNextCharge(item.day)

            return (
              <div
                key={item.id}
                className={`grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-2.5 p-2.5 rounded-lg border ${item.active ? 'bg-[var(--card)] border-[var(--border)]' : 'bg-[var(--card)] border-[var(--border)] opacity-70'}`}
              >
                <div className="min-w-0">
                  <div className={`font-semibold truncate ${item.active ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>{item.name}</div>
                  <div className={`grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-1 text-xs mt-1 ${item.active ? 'text-[var(--muted)]' : 'text-[var(--muted)] opacity-80'}`}>
                    <span>Día: {item.day}</span>
                    <span>Persona: {owner?.name || '—'}</span>
                    <span>Cuenta: {account?.name || '—'}</span>
                    <span>Categoría: {category?.name || 'Sin categoría'}</span>
                    <span>Importe: <span className={`font-semibold ${item.active ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>{formatMoney(item.amount)}</span></span>
                  </div>
                  <div className={`text-xs mt-1 ${item.active ? 'text-[var(--purple)]' : 'text-[var(--muted)] opacity-80'}`}>Cobro en: {remainingDays} días</div>
                </div>
                <div className="flex gap-2 lg:justify-end">
                  <Button size="xs" variant="actionBlue" onClick={() => openEdit(item)}>Editar</Button>
                  <Button
                    size="xs"
                    variant={item.active ? 'statusActive' : 'edit'}
                    onClick={() => updateFixedExpense(item.id, { active: !item.active })}
                  >
                    {item.active ? 'Activo' : 'Inactivo'}
                  </Button>
                  <Button size="xs" variant="danger" onClick={() => deleteFixedExpense(item.id)}>Eliminar</Button>
                </div>
              </div>
            )
          })}

          {(!state.fixedExpenses || state.fixedExpenses.length === 0) && (
            <div className="text-sm text-[var(--muted)]">No hay gastos fijos creados todavía.</div>
          )}
        </div>

        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar gasto fijo</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div>
                <Label className="block mb-1">Nombre</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block mb-1">Importe (€)</Label>
                  <Input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <Label className="block mb-1">Día del mes</Label>
                  <Input type="number" min="1" max="31" value={editForm.day} onChange={(e) => setEditForm(prev => ({ ...prev, day: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block mb-1">Cuenta</Label>
                  <Select value={editForm.account_id} onChange={(e) => setEditForm(prev => ({ ...prev, account_id: e.target.value }))}>
                    {state.accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="block mb-1">Persona</Label>
                  <Select value={editForm.owner_id} onChange={(e) => setEditForm(prev => ({ ...prev, owner_id: e.target.value }))}>
                    {state.owners.map(owner => (
                      <option key={owner.id} value={owner.id}>{owner.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block mb-1">Categoría</Label>
                  <Select value={editForm.category_id} onChange={(e) => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}>
                    <option value="">(sin categoría)</option>
                    {state.categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="block mb-1">Estado</Label>
                  <Select value={editForm.active ? 'active' : 'inactive'} onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.value === 'active' }))}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
              <Button variant="interactive" onClick={handleSaveEdit}>Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
