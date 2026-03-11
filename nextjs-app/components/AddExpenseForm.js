'use client'

import { useState } from 'react'
import { toast } from "sonner"
import { useGastos } from '../contexts/GastosContext'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { DatePickerField } from './ui/date-picker-field'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'

export default function AddExpenseForm(){
  const { state, addExpense, addCategory, deleteCategory, addAccount } = useGastos()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('🏷️')
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountIcon, setNewAccountIcon] = useState('💶')
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null)
  const [form, setForm] = useState({
    account_id: state.accounts[0]?.id || 1,
    owner_id: state.owners[0]?.id || 1,
    category_id: '',
    amount: '',
    date: new Date().toISOString().slice(0,10),
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!form.account_id || !form.owner_id || !form.amount) {
      alert('Por favor completa los campos requeridos')
      toast.error('Por favor completa los campos Cuenta, Persona e Importe.')
      return
    }
    addExpense({
      account_id: Number(form.account_id),
      owner_id: Number(form.owner_id),
      category_id: form.category_id ? Number(form.category_id) : null,
      amount: Number(form.amount),
      date: form.date,
      description: form.description
    })
    setForm({...form, amount: '', description: ''})
    toast.success('Gasto añadido correctamente.')
  }

  const handleCreateCategory = () => {
    const categoryName = String(newCategoryName || '').trim()
    if(!categoryName){
      toast.error('Escribe un nombre para la categoría.')
      return
    }

    const existing = state.categories.find(c => String(c.name || '').toLowerCase() === categoryName.toLowerCase())
    if(existing){
      setForm(current => ({ ...current, category_id: String(existing.id) }))
      setNewCategoryName('')
      toast.success('La categoría ya existía y quedó seleccionada.')
      return
    }

    const createdId = addCategory(categoryName, newCategoryIcon)
    if(createdId){
      setForm(current => ({ ...current, category_id: String(createdId) }))
      setNewCategoryName('')
      setNewCategoryIcon('🏷️')
      toast.success('Categoría creada y seleccionada.')
    }
  }

  const handleDeleteCategory = () => {
    if(!form.category_id){
      toast.error('Selecciona una categoría para eliminar.')
      return
    }

    const selectedId = Number(form.category_id)
    const selectedCategory = state.categories.find(c => Number(c.id) === selectedId)
    if(!selectedCategory){
      toast.error('Categoría no válida.')
      return
    }

    setPendingDeleteCategory({ id: selectedId, name: selectedCategory.name })
  }

  const confirmDeleteCategory = () => {
    if(!pendingDeleteCategory?.id) return

    const result = deleteCategory(pendingDeleteCategory.id)
    if(result?.ok){
      setForm(current => ({ ...current, category_id: '' }))
      setPendingDeleteCategory(null)
      toast.success('Categoría eliminada correctamente.')
      return
    }

    if(result?.reason === 'in-use'){
      setPendingDeleteCategory(null)
      toast.error('No se puede eliminar: la categoría está en uso en gastos o gastos fijos.')
      return
    }

    setPendingDeleteCategory(null)
    toast.error('No se pudo eliminar la categoría.')
  }

  return (
    <Card variant="form">
      <CardHeader>
        <CardTitle>💰 Añadir gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
          <div className="lg:col-span-4">
            <Label className="block mb-2">Cuenta</Label>
            <Select 
              value={form.account_id}
              onChange={(e) => setForm({...form, account_id: e.target.value})}
              className="w-full"
            >
              {state.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_56px_auto] gap-2 items-stretch">
              <Input
                type="text"
                placeholder="Nueva cuenta"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="w-full h-9"
              />
              <Select value={newAccountIcon} onChange={(e)=>setNewAccountIcon(e.target.value)} className="h-9">
                <option value="💶">💶</option>
                <option value="💳">💳</option>
                <option value="🏦">🏦</option>
                <option value="🪙">🪙</option>
                <option value="💰">💰</option>
                <option value="🏧">🏧</option>
              </Select>
              <Button type="button" variant="success" onClick={() => {
                const name = String(newAccountName||'').trim()
                if(!name){ toast.error('Escribe un nombre para la cuenta.'); return }
                const exists = state.accounts.find(c => String(c.name||'').toLowerCase() === name.toLowerCase())
                if(exists){ setForm(current => ({ ...current, account_id: exists.id })); setNewAccountName(''); toast.success('La cuenta ya existía y quedó seleccionada.'); return }
                const newId = addAccount(name, newAccountIcon)
                if(newId) setForm(current => ({ ...current, account_id: newId }))
                setNewAccountName('')
                setNewAccountIcon('💶')
                toast.success('Cuenta creada y seleccionada.')
              }} className="h-9 px-3">Crear</Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Label className="block mb-2">Persona</Label>
            <Select 
              value={form.owner_id}
              onChange={(e) => setForm({...form, owner_id: e.target.value})}
              className="w-full"
            >
              {state.owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Label className="block mb-2">Importe (€)</Label>
            <Input 
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              className="w-full"
            />
          </div>

          <div className="lg:col-span-4">
            <Label className="block mb-2">Categoría</Label>
            <Select 
              value={form.category_id}
              onChange={(e) => setForm({...form, category_id: e.target.value})}
              className="w-full"
            >
              <option value="">(sin categoría)</option>
              {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_56px_auto_auto] gap-2 items-stretch">
              <Input
                type="text"
                placeholder="Nueva categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full h-9"
              />
              <Select value={newCategoryIcon} onChange={(e)=>setNewCategoryIcon(e.target.value)} className="h-9">
                <option value="🏷️">🏷️</option>
                <option value="🧾">🧾</option>
                <option value="🍽️">🍽️</option>
                <option value="🛒">🛒</option>
                <option value="🚗">🚗</option>
                <option value="🏠">🏠</option>
              </Select>
              <Button type="button" variant="success" onClick={handleCreateCategory} className="h-9 px-3">
                Crear
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteCategory} className="h-9 px-3">
                Eliminar
              </Button>
            </div>
          </div>

          <div className="w-full min-w-0 sm:col-span-2 lg:col-span-6">
            <Label className="block mb-2">Fecha</Label>
            <DatePickerField
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
              className="w-full min-w-0 max-w-full"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-6">
            <Label className="block mb-2">Descripción</Label>
            <Input 
              type="text"
              placeholder="Ej: Compra en supermercado"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full"
            />
          </div>

          <Button type="submit" variant="success" className="sm:col-span-2 lg:col-span-12 w-full h-10 text-base font-semibold">
            Crear gasto
          </Button>
        </form>

        <Dialog open={!!pendingDeleteCategory} onOpenChange={() => setPendingDeleteCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar categoría</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--muted)] mt-4">
              ¿Seguro que quieres eliminar la categoría "{pendingDeleteCategory?.name}"?
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPendingDeleteCategory(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={confirmDeleteCategory}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
