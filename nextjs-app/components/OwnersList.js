'use client'

import { useEffect, useRef, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'

export default function OwnersList(){
  const { state, updateOwner, updateBudget, deleteOwner, addOwner } = useGastos()
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerGender, setNewOwnerGender] = useState('male')
  const [newOwnerBudget, setNewOwnerBudget] = useState('500')
  const [newOwnerIncome, setNewOwnerIncome] = useState('0')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editGender, setEditGender] = useState('male')
  const [editBudget, setEditBudget] = useState('500')
  const [editIncome, setEditIncome] = useState('0')
  const [reassignTarget, setReassignTarget] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [showAddOwnerWarning, setShowAddOwnerWarning] = useState(false)
  const addOwnerWarningTimeoutRef = useRef(null)
  const [ownersPage, setOwnersPage] = useState(0)

  const ownersPageSize = 10
  const ownersPagesCount = Math.ceil((state.owners || []).length / ownersPageSize)
  const activeOwnersPage = Math.min(ownersPage, Math.max(ownersPagesCount - 1, 0))
  const visibleOwners = (state.owners || []).slice(
    activeOwnersPage * ownersPageSize,
    activeOwnersPage * ownersPageSize + ownersPageSize
  )
  const ownersStartItem = (state.owners || []).length > 0 ? activeOwnersPage * ownersPageSize + 1 : 0
  const ownersEndItem = Math.min(ownersStartItem + visibleOwners.length - 1, (state.owners || []).length)

  useEffect(() => {
    setOwnersPage(0)
  }, [state.owners.length])

  const triggerAddOwnerWarning = () => {
    if (addOwnerWarningTimeoutRef.current) {
      clearTimeout(addOwnerWarningTimeoutRef.current)
    }
    setShowAddOwnerWarning(true)
    addOwnerWarningTimeoutRef.current = setTimeout(() => {
      setShowAddOwnerWarning(false)
      addOwnerWarningTimeoutRef.current = null
    }, 2200)
  }

  const handleDelete = (ownerId) => {
    const hasExpenses = state.expenses.some(e=>e.owner_id===ownerId)
    if(hasExpenses){
      setPendingDeleteId(ownerId)
      setReassignTarget(state.owners.find(o=>o.id!==ownerId)?.id || null)
    }else{
      deleteOwner(ownerId)
    }
  }

  const handleConfirmDelete = () => {
    if(pendingDeleteId && reassignTarget){
      deleteOwner(pendingDeleteId, reassignTarget)
      setPendingDeleteId(null)
      setReassignTarget(null)
    }
  }

  return (
    <Card variant="form">
      <CardHeader>
        <CardTitle>Gestionar personas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 pb-4 border-b grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div>
            <Label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Nombre</Label>
            <Input
              type="text"
              placeholder="Nuevo nombre"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Género</Label>
            <select
              value={newOwnerGender}
              onChange={(e) => setNewOwnerGender(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--text)]"
              aria-label="Género"
            >
              <option value="male">Hombre 👨</option>
              <option value="female">Mujer 👩</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Tope mensual (€)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Presupuesto mensual"
              value={newOwnerBudget}
              onChange={(e) => setNewOwnerBudget(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Ingresos mensuales (€)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ingresos mensuales"
              value={newOwnerIncome}
              onChange={(e) => setNewOwnerIncome(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="relative w-full">
              <div
                className={`pointer-events-none absolute left-1/2 z-20 w-max max-w-[260px] -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11px] font-medium text-[var(--text)] shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition-all duration-200 ${showAddOwnerWarning ? 'bottom-[calc(100%+10px)] opacity-100' : 'bottom-[calc(100%-2px)] opacity-0'}`}
                aria-hidden="true"
              >
                Completa los campos obligatorios
              </div>
              <Button 
                onClick={() => {
                  if(newOwnerName.trim()){
                    addOwner(
                      newOwnerName.trim(),
                      newOwnerGender,
                      Number(newOwnerBudget || 0),
                      Number(newOwnerIncome || 0)
                    )
                    setNewOwnerName('')
                    setNewOwnerGender('male')
                    setNewOwnerBudget('500')
                    setNewOwnerIncome('0')
                    setShowAddOwnerWarning(false)
                  } else {
                    triggerAddOwnerWarning()
                  }
                }}
                variant="interactive"
                className="w-full"
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {visibleOwners.map(o => {
            const ownerBudget = Number(state.budgets?.find(b => b.owner_id === o.id)?.amount || 0)
            const ownerIncome = Number(o.monthly_income || 0)
            const estimatedSavings = ownerIncome - ownerBudget
            const estimatedSavingsClass = estimatedSavings >= 0 ? 'text-[var(--muted)]' : 'text-[var(--purple)]'

            return (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-[var(--border)] bg-[var(--card)] rounded-lg hover:bg-[rgba(227,20,103,0.22)] hover:border-[rgba(227,20,103,0.22)] transition-colors gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg leading-none shrink-0" aria-hidden>{o.icon === 'female' ? '👩' : '👨'}</span>
                <div className="min-w-0">
                  <div className="font-medium text-[var(--text)] truncate">{o.name}</div>
                  <div className="text-xs text-[var(--muted)]">Tope mensual: {formatMoney(ownerBudget)} • Ingresos: {formatMoney(ownerIncome)}</div>
                  <div className={`text-xs ${estimatedSavingsClass}`}>Ahorro estimado mensual: {formatMoney(estimatedSavings)}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => {
                    setEditingId(o.id)
                    setEditName(o.name)
                    setEditGender(o.icon || 'male')
                    setEditBudget(String(ownerBudget))
                    setEditIncome(String(ownerIncome))
                  }}
                  variant="edit"
                  size="xs"
                >
                  Editar
                </Button>
                <Button 
                  onClick={() => handleDelete(o.id)}
                  variant="danger"
                  size="xs"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )})}
        </div>

        {(state.owners || []).length > 0 && (
          <div className="mt-2 z-10 rounded-md bg-[var(--card)]/95 backdrop-blur-sm px-2 py-2 shadow-[0_-6px_16px_rgba(0,0,0,0.08)] md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:shadow-none">
            <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
              Mostrando {ownersStartItem}-{ownersEndItem} de {state.owners.length}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOwnersPage(prev => Math.max(prev - 1, 0))}
                disabled={ownersPagesCount === 0 || activeOwnersPage === 0}
              >
                Anterior
              </Button>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                Página {activeOwnersPage + 1} de {Math.max(ownersPagesCount, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOwnersPage(prev => Math.min(prev + 1, ownersPagesCount - 1))}
                disabled={ownersPagesCount === 0 || activeOwnersPage === ownersPagesCount - 1}
              >
                Siguiente
              </Button>
            </div>
            <select
              value={String(activeOwnersPage)}
              onChange={(e) => setOwnersPage(Number(e.target.value))}
              disabled={ownersPagesCount === 0}
              className="mt-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[11px] text-[var(--text)] w-full"
            >
              {ownersPagesCount > 0
                ? Array.from({ length: ownersPagesCount }, (_, pageIndex) => {
                    const start = pageIndex * ownersPageSize + 1
                    const end = Math.min(start + ownersPageSize - 1, state.owners.length)
                    return (
                      <option key={`owners-page-${start}-${end}`} value={String(pageIndex)}>
                        Personas {start}-{end}
                      </option>
                    )
                  })
                : <option value="0">Solo primeras 10</option>
              }
            </select>
          </div>
        )}

        {/* Edit dialog */}
        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar persona</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <Label>Nuevo nombre</Label>
              <Input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-2"
              />
              <div>
                <Label>Género</Label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--text)]"
                >
                  <option value="male">Hombre 👨</option>
                  <option value="female">Mujer 👩</option>
                </select>
              </div>
              <div>
                <Label>Tope o presupuesto mensual (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Ingresos mensuales (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editIncome}
                  onChange={(e) => setEditIncome(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => setEditingId(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="interactive"
                onClick={() => {
                  updateOwner(editingId, {
                    name: editName,
                    icon: editGender,
                    monthly_income: Number(editIncome || 0)
                  })
                  updateBudget(editingId, Number(editBudget || 0))
                  setEditingId(null)
                }}
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reassign dialog */}
        <Dialog open={!!pendingDeleteId} onOpenChange={() => {
          setPendingDeleteId(null)
          setReassignTarget(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reasignar gastos</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-[var(--muted)] mb-4">
                Esta persona tiene gastos. ¿A quién quieres reasignarlos?
              </p>
              <Label>Selecciona persona</Label>
              <select 
                value={reassignTarget || ''}
                onChange={(e) => setReassignTarget(Number(e.target.value))}
                className="w-full mt-2 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--text)]"
              >
                {state.owners.filter(o=>o.id!==pendingDeleteId).map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  setPendingDeleteId(null)
                  setReassignTarget(null)
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="interactive"
                onClick={handleConfirmDelete}
              >
                Confirmar eliminación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
