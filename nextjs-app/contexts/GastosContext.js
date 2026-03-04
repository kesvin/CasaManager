'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { loadData, saveData, nextId, defaultData } from '../lib/data'

const GastosContext = createContext(null)

export function GastosProvider({ children }){
  const [state, setState] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(()=>{
    const loaded = loadData()
    const defaults = defaultData()
    // ensure owners has icons if missing
    if(!loaded.owners || loaded.owners.length === 0){
      loaded.owners = defaults.owners
    }else{
      loaded.owners = loaded.owners.map(owner => ({
        ...owner,
        icon: owner.icon || 'male',
        monthly_income: Number(owner.monthly_income || 0)
      }))
    }
    if(!loaded.budgets || loaded.budgets.length === 0){
      loaded.budgets = defaults.budgets
    }
    if(!loaded.fixedExpenses || loaded.fixedExpenses.length === 0){
      loaded.fixedExpenses = defaults.fixedExpenses
    }
    if(!loaded.improvements || !Array.isArray(loaded.improvements)){
      loaded.improvements = defaults.improvements || []
    }
    if(!loaded.houseDocuments || !Array.isArray(loaded.houseDocuments) || loaded.houseDocuments.length === 0){
      loaded.houseDocuments = defaults.houseDocuments || []
    }
    if(!loaded.houseContacts || !Array.isArray(loaded.houseContacts) || loaded.houseContacts.length === 0){
      loaded.houseContacts = defaults.houseContacts || []
    }
    setState(loaded)
  }, [])

  const updateState = (newState) => {
    setState(newState)
    saveData(newState)
  }

  // Actions
  const addExpense = (expense) => {
    if(!state) return
    const id = nextId(state.expenses)
    const newExpense = { id, ...expense }
    updateState({ ...state, expenses: [...state.expenses, newExpense] })
  }

  const deleteExpense = (id) => {
    if(!state) return
    updateState({ ...state, expenses: state.expenses.filter(e=>e.id!==id) })
  }

  const addAccount = (name) => {
    if(!state) return
    const id = nextId(state.accounts)
    updateState({ ...state, accounts: [...state.accounts, { id, name }] })
  }

  const addCategory = (name) => {
    if(!state) return
    const id = nextId(state.categories)
    const nextName = String(name || '').trim()
    updateState({ ...state, categories: [...state.categories, { id, name: nextName }] })
    return id
  }

  const deleteCategory = (categoryId) => {
    if(!state) return { ok: false, reason: 'invalid-state' }
    const id = Number(categoryId)
    if(!id) return { ok: false, reason: 'invalid-category' }

    const inExpenses = (state.expenses || []).some(expense => Number(expense.category_id) === id)
    const inFixedExpenses = (state.fixedExpenses || []).some(expense => Number(expense.category_id) === id)

    if(inExpenses || inFixedExpenses){
      return { ok: false, reason: 'in-use' }
    }

    const nextCategories = (state.categories || []).filter(category => Number(category.id) !== id)
    updateState({ ...state, categories: nextCategories })
    return { ok: true }
  }

  const addOwner = (name, icon='male', monthlyBudget=500, monthlyIncome=0) => {
    if(!state) return
    const id = nextId(state.owners)
    const nextOwners = [...state.owners, { id, name, icon, monthly_income: Number(monthlyIncome || 0) }]
    const hasBudget = (state.budgets || []).some(b => b.owner_id === id)
    const nextBudgets = hasBudget
      ? state.budgets
      : [...(state.budgets || []), { owner_id: id, amount: Number(monthlyBudget || 0) }]

    updateState({ ...state, owners: nextOwners, budgets: nextBudgets })
    return id
  }

  const updateOwner = (id, updates) => {
    if(!state) return
    const updated = state.owners.map(o => o.id===id ? {...o, ...updates} : o)
    updateState({ ...state, owners: updated })
  }

  const deleteOwner = (ownerId, reassignToOwnerId) => {
    if(!state) return
    const expenses = reassignToOwnerId 
      ? state.expenses.map(e => e.owner_id===ownerId ? {...e, owner_id:reassignToOwnerId} : e)
      : state.expenses
    const owners = state.owners.filter(o=>o.id!==ownerId)
    const budgets = (state.budgets || []).filter(b => b.owner_id !== ownerId)
    updateState({ ...state, owners, expenses, budgets })
  }

  const updateBudget = (ownerId, amount) => {
    if(!state) return
    let budget = state.budgets.find(b=>b.owner_id===ownerId)
    if(!budget){
      budget = { owner_id:ownerId, amount }
      updateState({ ...state, budgets: [...state.budgets, budget] })
    }else{
      const updated = state.budgets.map(b=>b.owner_id===ownerId ? {...b, amount} : b)
      updateState({ ...state, budgets: updated })
    }
  }

  const addFixedExpense = (fixedExpense) => {
    if(!state) return
    const id = nextId(state.fixedExpenses || [])
    const nextFixed = {
      id,
      name: String(fixedExpense.name || '').trim(),
      amount: Number(fixedExpense.amount || 0),
      day: Number(fixedExpense.day || 1),
      account_id: Number(fixedExpense.account_id),
      owner_id: Number(fixedExpense.owner_id),
      category_id: fixedExpense.category_id ? Number(fixedExpense.category_id) : null,
      active: fixedExpense.active !== false
    }
    updateState({ ...state, fixedExpenses: [...(state.fixedExpenses || []), nextFixed] })
  }

  const updateFixedExpense = (id, updates) => {
    if(!state) return
    const nextFixed = (state.fixedExpenses || []).map(item => item.id === id ? { ...item, ...updates } : item)
    updateState({ ...state, fixedExpenses: nextFixed })
  }

  const deleteFixedExpense = (id) => {
    if(!state) return
    const nextFixed = (state.fixedExpenses || []).filter(item => item.id !== id)
    updateState({ ...state, fixedExpenses: nextFixed })
  }

  const applyFixedExpensesForMonth = (monthValue) => {
    if(!state) return { added: 0, skipped: 0 }

    const targetMonth = /^\d{4}-\d{2}$/.test(String(monthValue || ''))
      ? String(monthValue)
      : new Date().toISOString().slice(0, 7)

    const [yearText, monthText] = targetMonth.split('-')
    const year = Number(yearText)
    const month = Number(monthText)
    const daysInMonth = new Date(year, month, 0).getDate
    const fixedExpenses = (state.fixedExpenses || []).filter(item => item.active)

    let nextExpenseId = nextId(state.expenses)
    let added = 0
    let skipped = 0
    const newExpenses = []

    fixedExpenses.forEach(item => {
      const exists = state.expenses.some(expense =>
        Number(expense.fixed_expense_id) === Number(item.id) &&
        String(expense.date || '').slice(0, 7) === targetMonth
      ) || newExpenses.some(expense =>
        Number(expense.fixed_expense_id) === Number(item.id) &&
        String(expense.date || '').slice(0, 7) === targetMonth
      )

      if(exists){
        skipped += 1
        return
      }

      const safeDay = Math.min(Math.max(Number(item.day || 1), 1), daysInMonth)
      const date = `${targetMonth}-${String(safeDay).padStart(2, '0')}`

      newExpenses.push({
        id: nextExpenseId,
        account_id: Number(item.account_id),
        owner_id: Number(item.owner_id),
        category_id: item.category_id ? Number(item.category_id) : null,
        amount: Number(item.amount || 0),
        date,
        description: String(item.name || 'Gasto fijo mensual'),
        fixed_expense_id: item.id
      })
      nextExpenseId += 1
      added += 1
    })

    if(newExpenses.length){
      updateState({ ...state, expenses: [...state.expenses, ...newExpenses] })
    }

    return { added, skipped }
  }

  const addImprovement = (improvement) => {
    if(!state) return
    const id = nextId(state.improvements || [])
    const nextItem = {
      id,
      title: String(improvement.title || '').trim(),
      estimated_cost: Number(improvement.estimated_cost || 0)
    }
    updateState({ ...state, improvements: [...(state.improvements || []), nextItem] })
  }

  const updateImprovement = (id, updates) => {
    if(!state) return
    const nextItems = (state.improvements || []).map(item => item.id === id ? { ...item, ...updates } : item)
    updateState({ ...state, improvements: nextItems })
  }

  const deleteImprovement = (id) => {
    if(!state) return
    const nextItems = (state.improvements || []).filter(item => item.id !== id)
    updateState({ ...state, improvements: nextItems })
  }

  const addHouseDocument = (document) => {
    if(!state) return
    const id = nextId(state.houseDocuments || [])
    const nextItem = {
      id,
      title: String(document.title || '').trim(),
      kind: String(document.kind || 'Otro').trim(),
      estimated_cost: Number(document.estimated_cost || 0),
      contact_name: String(document.contact_name || '').trim(),
      contact_phone: String(document.contact_phone || '').trim(),
      company: String(document.company || '').trim(),
      notes: String(document.notes || '').trim(),
      file_name: String(document.file_name || '').trim(),
      file_type: String(document.file_type || '').trim(),
      file_size: Number(document.file_size || 0),
      file_data_url: String(document.file_data_url || ''),
      created_at: document.created_at || new Date().toISOString()
    }

    updateState({ ...state, houseDocuments: [...(state.houseDocuments || []), nextItem] })
  }

  const updateHouseDocument = (id, updates) => {
    if(!state) return
    const nextItems = (state.houseDocuments || []).map(item => item.id === id ? { ...item, ...updates } : item)
    updateState({ ...state, houseDocuments: nextItems })
  }

  const deleteHouseDocument = (id) => {
    if(!state) return
    const nextItems = (state.houseDocuments || []).filter(item => item.id !== id)
    updateState({ ...state, houseDocuments: nextItems })
  }

  const addHouseContact = (contact) => {
    if(!state) return
    const id = nextId(state.houseContacts || [])
    const nextItem = {
      id,
      name: String(contact.name || '').trim(),
      company: String(contact.company || '').trim(),
      phone: String(contact.phone || '').trim(),
      description: String(contact.description || '').trim(),
      created_at: contact.created_at || new Date().toISOString()
    }
    updateState({ ...state, houseContacts: [...(state.houseContacts || []), nextItem] })
  }

  const updateHouseContact = (id, updates) => {
    if(!state) return
    const nextItems = (state.houseContacts || []).map(item => item.id === id ? { ...item, ...updates } : item)
    updateState({ ...state, houseContacts: nextItems })
  }

  const deleteHouseContact = (id) => {
    if(!state) return
    const nextItems = (state.houseContacts || []).filter(item => item.id !== id)
    updateState({ ...state, houseContacts: nextItems })
  }

  const value = {
    state: state || defaultData(),
    addExpense,
    deleteExpense,
    addAccount,
    addCategory,
    deleteCategory,
    addOwner,
    updateOwner,
    deleteOwner,
    updateBudget,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    applyFixedExpensesForMonth
    , addImprovement,
    updateImprovement,
    deleteImprovement
    , addHouseDocument,
    updateHouseDocument,
    deleteHouseDocument
    , addHouseContact,
    updateHouseContact,
    deleteHouseContact
    , searchTerm, setSearchTerm
  }

  return (
    <GastosContext.Provider value={value}>
      {children}
    </GastosContext.Provider>
  )
}

export function useGastos(){
  const ctx = useContext(GastosContext)
  if(!ctx) throw new Error('useGastos must be used within GastosProvider')
  return ctx
}
