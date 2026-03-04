'use client'

import { useEffect, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney, getOwnerIconSvg } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function ExpensesList({
  title = 'Gastos recientes',
  showAll = false,
  limit = 200,
  showOwnerIcon = false,
  ownerIconEmoji = false,
  colorOwnerByGender = false,
  onlyPreviousMonth = false,
  scrollable = false,
  scrollHeightClass = 'max-h-80',
  searchTermOverride,
  periodFilter = 'all',
  showInlineFilters = false,
  externalCategoryId = 'all',
  externalCategoryLabel = '',
  onClearExternalCategory
}){
  const { state, deleteExpense, searchTerm } = useGastos()
  const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const [inlineSearchTerm, setInlineSearchTerm] = useState('')
  const [inlineFromMonthFilter, setInlineFromMonthFilter] = useState('')
  const [inlineToMonthFilter, setInlineToMonthFilter] = useState('')
  const [inlineOwnerFilter, setInlineOwnerFilter] = useState('all')
  const [inlineSortFilter, setInlineSortFilter] = useState('date-desc')
  const [mobilePage, setMobilePage] = useState(0)

  const now = new Date()
  const currentYear = now.getFullYear()
  const yearsFromExpenses = (state.expenses || [])
    .map(expense => Number(String(expense.date || '').slice(0, 4)))
    .filter(year => Number.isFinite(year) && year > 2000)
  const yearOptions = Array.from(new Set([currentYear - 1, currentYear, currentYear + 1, ...yearsFromExpenses]))
    .sort((a, b) => b - a)

  const parseMonthValue = (value) => {
    const [yearRaw, monthRaw] = String(value || '').split('-')
    const parsedYear = Number(yearRaw)
    const parsedMonth = Number(monthRaw)

    return {
      year: Number.isFinite(parsedYear) && parsedYear > 2000 ? parsedYear : currentYear,
      month: Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : (now.getMonth() + 1)
    }
  }

  const updateMonthFilterPart = (currentValue, part, nextValue) => {
    const current = parseMonthValue(currentValue)
    const nextYear = part === 'year' ? Number(nextValue) : current.year
    const nextMonth = part === 'month' ? Number(nextValue) : current.month
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`
  }

  const getOwnerTextClass = (ownerIcon) => {
    if(!colorOwnerByGender) return ''
    return 'text-white'
  }
  
  const activeSearchTerm = showInlineFilters
    ? inlineSearchTerm
    : (typeof searchTermOverride === 'string' ? searchTermOverride : searchTerm)
  const normalizedQuery = (activeSearchTerm || '').trim().toLowerCase()
  const sortedAll = [...state.expenses].sort((a,b) => b.date.localeCompare(a.date))
  let filtered = sortedAll
  const effectivePeriodFilter = showInlineFilters ? 'all' : (onlyPreviousMonth ? 'previous-month' : periodFilter)
  const effectiveFromMonthFilter = showInlineFilters ? inlineFromMonthFilter : ''
  const effectiveToMonthFilter = showInlineFilters ? inlineToMonthFilter : ''
  const effectiveOwnerFilter = showInlineFilters ? inlineOwnerFilter : 'all'
  const effectiveSortFilter = showInlineFilters ? inlineSortFilter : 'date-desc'
  const effectiveCategoryFilter = externalCategoryId && String(externalCategoryId) !== 'all'
    ? String(externalCategoryId)
    : 'all'

  const normalizedFromMonth = effectiveFromMonthFilter && effectiveToMonthFilter
    ? (effectiveFromMonthFilter <= effectiveToMonthFilter ? effectiveFromMonthFilter : effectiveToMonthFilter)
    : (effectiveFromMonthFilter || effectiveToMonthFilter || '')
  const normalizedToMonth = effectiveFromMonthFilter && effectiveToMonthFilter
    ? (effectiveFromMonthFilter <= effectiveToMonthFilter ? effectiveToMonthFilter : effectiveFromMonthFilter)
    : (effectiveToMonthFilter || effectiveFromMonthFilter || '')
  const hasMonthRange = Boolean(normalizedFromMonth || normalizedToMonth)

  if(!hasMonthRange && effectivePeriodFilter === 'current-month'){
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    filtered = filtered.filter(e => String(e.date || '').startsWith(currentMonthPrefix))
  }
  if(!hasMonthRange && effectivePeriodFilter === 'previous-month'){
    const now = new Date()
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthPrefix = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`
    filtered = filtered.filter(e => String(e.date || '').startsWith(previousMonthPrefix))
  }
  if(normalizedFromMonth || normalizedToMonth){
    filtered = filtered.filter(e => {
      const expenseMonth = String(e.date || '').slice(0, 7)
      if(normalizedFromMonth && expenseMonth < normalizedFromMonth) return false
      if(normalizedToMonth && expenseMonth > normalizedToMonth) return false
      return true
    })
  }
  if(effectiveOwnerFilter !== 'all'){
    filtered = filtered.filter(e => String(e.owner_id) === String(effectiveOwnerFilter))
  }
  if(effectiveCategoryFilter !== 'all'){
    filtered = filtered.filter(e => String(e.category_id) === String(effectiveCategoryFilter))
  }
  if(normalizedQuery){
    filtered = sortedAll.filter(e => {
      const acc = state.accounts.find(a=>a.id===e.account_id)?.name||''
      const owner = state.owners.find(o=>o.id===e.owner_id)?.name||''
      const cat = state.categories.find(c=>c.id===e.category_id)?.name||''
      return (
        String(e.description||'').toLowerCase().includes(normalizedQuery) ||
        acc.toLowerCase().includes(normalizedQuery) ||
        owner.toLowerCase().includes(normalizedQuery) ||
        cat.toLowerCase().includes(normalizedQuery) ||
        String(e.amount).toLowerCase().includes(normalizedQuery)
      )
    })
    if(!hasMonthRange && effectivePeriodFilter === 'current-month'){
      const now = new Date()
      const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      filtered = filtered.filter(e => String(e.date || '').startsWith(currentMonthPrefix))
    }
    if(!hasMonthRange && effectivePeriodFilter === 'previous-month'){
      const now = new Date()
      const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthPrefix = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`
      filtered = filtered.filter(e => String(e.date || '').startsWith(previousMonthPrefix))
    }
    if(normalizedFromMonth || normalizedToMonth){
      filtered = filtered.filter(e => {
        const expenseMonth = String(e.date || '').slice(0, 7)
        if(normalizedFromMonth && expenseMonth < normalizedFromMonth) return false
        if(normalizedToMonth && expenseMonth > normalizedToMonth) return false
        return true
      })
    }
    if(effectiveOwnerFilter !== 'all'){
      filtered = filtered.filter(e => String(e.owner_id) === String(effectiveOwnerFilter))
    }
    if(effectiveCategoryFilter !== 'all'){
      filtered = filtered.filter(e => String(e.category_id) === String(effectiveCategoryFilter))
    }
  }

  if(effectiveSortFilter === 'date-asc'){
    filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
  }else if(effectiveSortFilter === 'amount-desc'){
    filtered = [...filtered].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
  }else if(effectiveSortFilter === 'amount-asc'){
    filtered = [...filtered].sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0))
  }else{
    filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  }

  const recent = showAll ? filtered : filtered.slice(0, limit)
  const paginationEnabled = showAll
  const mobilePageSize = 10
  const mobilePagesCount = paginationEnabled ? Math.ceil(recent.length / mobilePageSize) : 1
  const activeMobilePage = Math.min(mobilePage, Math.max(mobilePagesCount - 1, 0))
  const mobileVisibleItems = paginationEnabled
    ? recent.slice(activeMobilePage * mobilePageSize, activeMobilePage * mobilePageSize + mobilePageSize)
    : recent
  const mobileStartItem = recent.length > 0 ? activeMobilePage * mobilePageSize + 1 : 0
  const mobileEndItem = Math.min(mobileStartItem + mobileVisibleItems.length - 1, recent.length)

  useEffect(() => {
    setMobilePage(0)
  }, [
    activeSearchTerm,
    effectivePeriodFilter,
    normalizedFromMonth,
    normalizedToMonth,
    effectiveOwnerFilter,
    effectiveCategoryFilter,
    effectiveSortFilter,
    showAll,
    limit,
    state.expenses.length
  ])

  const scrollHeightByClass = {
    'max-h-72': '18rem',
    'max-h-80': '20rem',
    'max-h-96': '24rem'
  }
  const desktopScrollMaxHeight = scrollHeightByClass[scrollHeightClass] || '24rem'

  const categoryIconMap = {
    comida: '🍽️',
    transporte: '🚗',
    hogar: '🏠',
    ocio: '🎬',
    salud: '💊',
    compras: '🛍️',
    suscripciones: '📺',
    educacion: '📚',
    educación: '📚'
  }

  const normalizeLabel = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const getCategoryIcon = (categoryName) => {
    const normalizedCategory = normalizeLabel(categoryName)
    return categoryIconMap[normalizedCategory] || '🧾'
  }

  const getDateSectionLabel = (dateValue) => {
    const parsedDate = new Date(`${dateValue}T00:00:00`)
    if(Number.isNaN(parsedDate.getTime())) return 'Otros'

    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfExpenseDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
    const diffDays = Math.floor((startOfToday - startOfExpenseDay) / 86400000)

    if(diffDays === 0) return 'Hoy'
    if(diffDays === 1) return 'Ayer'
    if(diffDays <= 7) return 'Esta semana'

    return parsedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  const formatShortDate = (dateValue) => {
    const parsedDate = new Date(`${dateValue}T00:00:00`)
    if(Number.isNaN(parsedDate.getTime())) return dateValue
    return parsedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const mobileGroupedItems = mobileVisibleItems.map((expense, index) => {
    const currentLabel = getDateSectionLabel(expense.date)
    const previousLabel = index > 0 ? getDateSectionLabel(mobileVisibleItems[index - 1].date) : ''
    return {
      expense,
      sectionLabel: currentLabel !== previousLabel ? currentLabel : ''
    }
  })

  const handleDelete = (id) => {
    if(confirm('¿Eliminar este gasto?')){
      deleteExpense(id)
    }
  }

  const renderMobileExpenseCard = (e) => {
    const account = state.accounts.find(a => a.id === e.account_id)?.name || '—'
    const owner = state.owners.find(o => o.id === e.owner_id) || { name: '—' }
    const cat = state.categories.find(c => c.id === e.category_id)?.name || '—'
    const categoryIcon = getCategoryIcon(cat)

    return (
      <div key={e.id} className="rounded-xl bg-[var(--card)] px-3 py-2.5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm leading-none" aria-hidden>{categoryIcon}</span>
              <span className="text-[10px] rounded-full border border-[var(--border)] px-2 py-0.5" style={{ color: 'var(--muted)' }}>
                {cat}
              </span>
            </div>
            <div className="mt-1 text-[12px] font-semibold leading-tight break-words" style={{ color: 'var(--text)' }}>
              {e.description || '—'}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatMoney(e.amount)}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{formatShortDate(e.date)}</div>
          </div>
        </div>

        <div className="mt-1 text-[10px] leading-tight break-words" style={{ color: 'var(--muted)' }}>
          {cat} · {owner.name} · {account}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => handleDelete(e.id)}
            variant="danger"
            className="h-8 px-2.5 text-xs"
          >
            Eliminar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {effectiveCategoryFilter !== 'all' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)]" style={{ color: 'var(--muted)' }}>
              Categoría: {externalCategoryLabel || 'Seleccionada'}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                if(typeof onClearExternalCategory === 'function') onClearExternalCategory()
              }}
            >
              Quitar filtro
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showInlineFilters && (
          <div className="inline-filters-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-4">
            <div className="col-span-2 md:col-span-3 xl:col-span-2 min-w-0">
              <label className="filter-label text-xs font-semibold text-[var(--muted)] mb-1 block">Buscar en gastos</label>
              <Input
                value={inlineSearchTerm}
                onChange={(e) => setInlineSearchTerm(e.target.value)}
                placeholder="Descripción, cuenta, persona, categoría..."
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
            <div className="min-w-0 month-range-col">
              <label className="filter-label text-xs font-semibold text-[var(--muted)] mb-1 block">Desde (mes)</label>
              <div className="month-compact-grid">
                <select
                  value={String(parseMonthValue(inlineFromMonthFilter).month)}
                  onChange={(e) => setInlineFromMonthFilter(updateMonthFilterPart(inlineFromMonthFilter, 'month', e.target.value))}
                  className="month-part-select"
                >
                  {MONTHS_ES.map((monthLabel, index) => (
                    <option key={monthLabel} value={String(index + 1)}>{monthLabel}</option>
                  ))}
                </select>
                <select
                  value={String(parseMonthValue(inlineFromMonthFilter).year)}
                  onChange={(e) => setInlineFromMonthFilter(updateMonthFilterPart(inlineFromMonthFilter, 'year', e.target.value))}
                  className="month-part-select"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="min-w-0 month-range-col">
              <label className="filter-label text-xs font-semibold text-[var(--muted)] mb-1 block">Hasta (mes)</label>
              <div className="month-compact-grid">
                <select
                  value={String(parseMonthValue(inlineToMonthFilter).month)}
                  onChange={(e) => setInlineToMonthFilter(updateMonthFilterPart(inlineToMonthFilter, 'month', e.target.value))}
                  className="month-part-select"
                >
                  {MONTHS_ES.map((monthLabel, index) => (
                    <option key={monthLabel} value={String(index + 1)}>{monthLabel}</option>
                  ))}
                </select>
                <select
                  value={String(parseMonthValue(inlineToMonthFilter).year)}
                  onChange={(e) => setInlineToMonthFilter(updateMonthFilterPart(inlineToMonthFilter, 'year', e.target.value))}
                  className="month-part-select"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="min-w-0">
              <label className="filter-label text-xs font-semibold text-[var(--muted)] mb-1 block">Persona</label>
              <select
                value={inlineOwnerFilter}
                onChange={(e) => setInlineOwnerFilter(e.target.value)}
                className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--text)] w-full h-8 sm:h-9"
              >
                <option value="all">Todas</option>
                {state.owners.map(owner => (
                  <option key={owner.id} value={String(owner.id)}>{owner.name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="filter-label text-xs font-semibold text-[var(--muted)] mb-1 block">Ordenar</label>
              <div className="flex flex-col gap-2 min-w-0">
                <select
                  value={inlineSortFilter}
                  onChange={(e) => setInlineSortFilter(e.target.value)}
                  className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--text)] w-full h-8 sm:h-9"
                >
                  <option value="date-desc">Fecha: más reciente</option>
                  <option value="date-asc">Fecha: más antigua</option>
                  <option value="amount-desc">Importe: mayor a menor</option>
                  <option value="amount-asc">Importe: menor a mayor</option>
                </select>
                <Button
                  type="button"
                  variant="danger"
                  className="w-full h-8 px-2 text-xs"
                  onClick={() => {
                    setInlineSearchTerm('')
                    setInlineFromMonthFilter('')
                    setInlineToMonthFilter('')
                    setInlineOwnerFilter('all')
                    setInlineSortFilter('date-desc')
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        )}
        <div
          className={scrollable ? 'expenses-scroll-wrap' : ''}
          style={scrollable ? { '--desktop-max-height': desktopScrollMaxHeight } : undefined}
        >
          <div className="md:hidden space-y-1.5">
            {recent.length > 0 && paginationEnabled && (
              <div className="rounded-md bg-[var(--card)] px-2 py-1.5 md:mb-2">
                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Mostrando {mobileStartItem}-{mobileEndItem} de {recent.length}
                </div>
              </div>
            )}

            {recent.length === 0 && (
              <div className="rounded-lg bg-[var(--card)] px-4 py-5 text-center">
                <div className="text-sm font-semibold">Sin gastos para mostrar</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Ajusta filtros o registra un nuevo gasto para empezar.
                </div>
              </div>
            )}

            {mobileGroupedItems.map(({ expense, sectionLabel }) => (
              <div key={`group-${expense.id}`} className="space-y-1.5">
                {sectionLabel && (
                  <div className="pt-1">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                      {sectionLabel}
                    </span>
                  </div>
                )}
                {renderMobileExpenseCard(expense)}
              </div>
            ))}
          </div>

          <table className="hidden md:table w-full text-xs md:text-sm table-auto">
            <thead>
              <tr className="border-b bg-transparent">
                <th className="text-left py-2 px-3 font-medium">Fecha</th>
                <th className="hidden md:table-cell text-left py-2 px-3 font-medium">Cuenta</th>
                <th className="hidden md:table-cell text-left py-2 px-3 font-medium">Persona</th>
                <th className="hidden md:table-cell text-left py-2 px-3 font-medium">Categoría</th>
                <th className="text-left py-2 px-3 font-medium">Descripción</th>
                <th className="text-right py-2 px-3 font-medium">Importe</th>
                <th className="text-center py-2 px-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    Sin gastos para mostrar con los filtros actuales.
                  </td>
                </tr>
              )}
              {mobileVisibleItems.map(e => {
                const account = state.accounts.find(a=>a.id===e.account_id)?.name || '—'
                const owner = state.owners.find(o=>o.id===e.owner_id) || {name:'—'}
                const cat = state.categories.find(c=>c.id===e.category_id)?.name || '—'
                
                return (
                  <tr key={e.id} className="border-b hover:bg-[rgba(227,20,103,0.22)] transition-colors">
                    <td className="py-2 px-3 align-top">{e.date}</td>
                    <td className="hidden md:table-cell py-2 px-3 align-top">{account}</td>
                    <td className={`hidden md:table-cell py-2 px-3 align-top ${showOwnerIcon ? 'flex items-center gap-2' : ''} ${getOwnerTextClass(owner.icon)}`}>
                      {showOwnerIcon && (
                        ownerIconEmoji
                          ? <span className="text-base leading-none" aria-hidden>{owner.icon === 'female' ? '👩' : '👨'}</span>
                          : <div dangerouslySetInnerHTML={{__html: getOwnerIconSvg(owner.icon, 14)}} />
                      )}
                      <span>{owner.name}</span>
                    </td>
                    <td className="hidden md:table-cell py-2 px-3 align-top">{cat}</td>
                    <td className="py-2 px-3 align-top text-[var(--text)] break-words">
                      <div>{e.description || '—'}</div>
                      <div className="md:hidden text-[11px] text-[var(--muted)] mt-1">{cat} · {owner.name} · {account}</div>
                    </td>
                    <td className="text-right py-2 px-3 align-top font-semibold">{formatMoney(e.amount)}</td>
                    <td className="text-center py-2 px-3 align-top">
                      <Button 
                        onClick={() => handleDelete(e.id)}
                        variant="danger"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {recent.length > 0 && paginationEnabled && (
          <div className="mt-2 z-10 rounded-md bg-[var(--card)]/95 backdrop-blur-sm px-2 py-2 shadow-[0_-6px_16px_rgba(0,0,0,0.08)] md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:shadow-none">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobilePage(prev => Math.max(prev - 1, 0))}
                disabled={mobilePagesCount === 0 || activeMobilePage === 0}
              >
                Anterior
              </Button>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                Página {activeMobilePage + 1} de {Math.max(mobilePagesCount, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobilePage(prev => Math.min(prev + 1, mobilePagesCount - 1))}
                disabled={mobilePagesCount === 0 || activeMobilePage === mobilePagesCount - 1}
              >
                Siguiente
              </Button>
            </div>
            <select
              value={String(activeMobilePage)}
              onChange={(e) => setMobilePage(Number(e.target.value))}
              disabled={mobilePagesCount === 0}
              className="mt-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[11px] text-[var(--text)] w-full"
            >
              {mobilePagesCount > 0
                ? Array.from({ length: mobilePagesCount }, (_, pageIndex) => {
                    const start = pageIndex * mobilePageSize + 1
                    const end = Math.min(start + mobilePageSize - 1, recent.length)
                    return (
                      <option key={`mobile-page-${start}-${end}`} value={String(pageIndex)}>
                        Gastos {start}-{end}
                      </option>
                    )
                  })
                : <option value="0">Solo primeros 10</option>
              }
            </select>
          </div>
        )}
      </CardContent>
      <style jsx>{`
        .inline-filters-grid { margin-bottom: 0.75rem; }
        .filter-label { line-height: 1.1; }
        .expenses-scroll-wrap {
          overflow-y: auto;
          max-height: 60vh;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        @media (min-width: 768px) {
          .expenses-scroll-wrap {
            overflow-y: auto;
            max-height: var(--desktop-max-height);
          }
        }
        .month-range-col {width: 100%;min-width: 0;}
        .month-compact-grid {display: grid;grid-template-columns: 1fr 1fr;gap: 6px;width: 100%;}
        .month-part-select {
          width: 100%;
          min-width: 0;
          height: 36px;
          border-radius: 10px;
          border: 2px solid var(--border);
          background: var(--card);
          color: var(--text);
          padding: 0 30px 0 10px;
          font-size: 13px;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .inline-filters-grid { gap: 6px; margin-bottom: 0.5rem; }
          .filter-label { font-size: 11px; margin-bottom: 4px; }
          .month-compact-grid { gap: 4px; }
          .month-part-select {
            height: 32px;
            border-radius: 8px;
            padding: 0 24px 0 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </Card>
  )
}
