'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'

const REPORT_DOCS_KEY = 'gc_report_documents'
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function monthValueFromDate(date){
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthPartsFromValue(value){
  const [yearText, monthText] = String(value || '').split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  if(Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12){
    return { year, month }
  }

  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function updateMonthValue(value, part, nextValue){
  const { year, month } = monthPartsFromValue(value)
  const safeYear = part === 'year' ? Number(nextValue) : year
  const safeMonth = part === 'month' ? Number(nextValue) : month
  return `${safeYear}-${String(safeMonth).padStart(2, '0')}`
}

function toDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ReportsPage(){
  const { state } = useGastos()
  const now = new Date()
  const currentYear = now.getFullYear()
  const defaultToMonth = monthValueFromDate(now)
  const defaultFromMonth = monthValueFromDate(new Date(now.getFullYear(), now.getMonth() - 2, 1))

  const [fromMonth, setFromMonth] = useState(defaultFromMonth)
  const [toMonth, setToMonth] = useState(defaultToMonth)
  const [categoryId, setCategoryId] = useState('all')
  const [accountId, setAccountId] = useState('all')
  const [ownerId, setOwnerId] = useState('all')
  const [emailTo, setEmailTo] = useState('')
  const [documents, setDocuments] = useState([])
  const [reportPage, setReportPage] = useState(0)
  const [documentsPage, setDocumentsPage] = useState(0)

  const fromMonthParts = monthPartsFromValue(fromMonth)
  const toMonthParts = monthPartsFromValue(toMonth)

  const yearOptions = useMemo(() => {
    const years = state.expenses
      .map(expense => Number(String(expense.date || '').slice(0, 4)))
      .filter(year => Number.isFinite(year) && year >= 2000 && year <= 2100)

    const minYear = Math.min(currentYear - 2, ...(years.length ? years : [currentYear]))
    const maxYear = Math.max(currentYear + 2, ...(years.length ? years : [currentYear]))

    const options = []
    for(let year = maxYear; year >= minYear; year -= 1){
      options.push(year)
    }
    return options
  }, [state.expenses, currentYear])

  useEffect(() => {
    try{
      const raw = localStorage.getItem(REPORT_DOCS_KEY)
      if(raw) setDocuments(JSON.parse(raw))
    }catch(e){
      setDocuments([])
    }
  }, [])

  useEffect(() => {
    try{
      localStorage.setItem(REPORT_DOCS_KEY, JSON.stringify(documents))
    }catch(e){
      // ignore storage errors
    }
  }, [documents])

  const reportData = useMemo(() => {
    const normalizedFrom = fromMonth <= toMonth ? fromMonth : toMonth
    const normalizedTo = fromMonth <= toMonth ? toMonth : fromMonth
    const start = `${normalizedFrom}-01`
    const end = `${normalizedTo}-31`

    const filtered = state.expenses.filter(expense => {
      const expenseMonth = String(expense.date || '').slice(0, 7)
      const insideRange = expenseMonth >= normalizedFrom && expenseMonth <= normalizedTo
      if(!insideRange) return false
      if(categoryId !== 'all' && String(expense.category_id) !== categoryId) return false
      if(accountId !== 'all' && String(expense.account_id) !== accountId) return false
      if(ownerId !== 'all' && String(expense.owner_id) !== ownerId) return false
      return true
    })

    const total = filtered.reduce((sum, expense) => sum + Number(expense.amount), 0)

    return {
      start,
      end,
      fromMonth: normalizedFrom,
      toMonth: normalizedTo,
      filtered,
      total
    }
  }, [state, fromMonth, toMonth, categoryId, accountId, ownerId])

  const reportPageSize = 10
  const reportPagesCount = Math.ceil(reportData.filtered.length / reportPageSize)
  const activeReportPage = Math.min(reportPage, Math.max(reportPagesCount - 1, 0))
  const visibleReportRows = reportData.filtered.slice(
    activeReportPage * reportPageSize,
    activeReportPage * reportPageSize + reportPageSize
  )
  const reportStartItem = reportData.filtered.length > 0 ? activeReportPage * reportPageSize + 1 : 0
  const reportEndItem = Math.min(reportStartItem + visibleReportRows.length - 1, reportData.filtered.length)

  const documentsPageSize = 10
  const documentsPagesCount = Math.ceil(documents.length / documentsPageSize)
  const activeDocumentsPage = Math.min(documentsPage, Math.max(documentsPagesCount - 1, 0))
  const visibleDocumentsRows = documents.slice(
    activeDocumentsPage * documentsPageSize,
    activeDocumentsPage * documentsPageSize + documentsPageSize
  )
  const documentsStartItem = documents.length > 0 ? activeDocumentsPage * documentsPageSize + 1 : 0
  const documentsEndItem = Math.min(documentsStartItem + visibleDocumentsRows.length - 1, documents.length)

  useEffect(() => {
    setReportPage(0)
  }, [fromMonth, toMonth, categoryId, accountId, ownerId, state.expenses.length])

  useEffect(() => {
    setDocumentsPage(0)
  }, [documents.length])

  const downloadReport = () => {
    const lines = []
    lines.push(`Informe de gastos;${reportData.start} a ${reportData.end}`)
    lines.push(`Total;${formatMoney(reportData.total)}`)
    lines.push('')
    lines.push('Fecha;Cuenta;Persona;Categoría;Descripción;Importe')

    reportData.filtered.forEach(expense => {
      const account = state.accounts.find(a => a.id === expense.account_id)?.name || '—'
      const owner = state.owners.find(o => o.id === expense.owner_id)?.name || '—'
      const category = state.categories.find(c => c.id === expense.category_id)?.name || '—'
      const description = String(expense.description || '—').replace(/;/g, ',')
      lines.push(`${expense.date};${account};${owner};${category};${description};${formatMoney(expense.amount)}`)
    })

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-gastos-${reportData.start}-a-${reportData.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadReportTxt = () => {
    const lines = []
    lines.push(`Informe de gastos | ${reportData.start} a ${reportData.end}`)
    lines.push(`Total: ${formatMoney(reportData.total)}`)
    lines.push('')
    lines.push('Fecha | Cuenta | Persona | Categoría | Descripción | Importe')

    reportData.filtered.forEach(expense => {
      const account = state.accounts.find(a => a.id === expense.account_id)?.name || '—'
      const owner = state.owners.find(o => o.id === expense.owner_id)?.name || '—'
      const category = state.categories.find(c => c.id === expense.category_id)?.name || '—'
      const description = String(expense.description || '—').replace(/\|/g, '/')
      lines.push(`${expense.date} | ${account} | ${owner} | ${category} | ${description} | ${formatMoney(expense.amount)}`)
    })

    const txt = lines.join('\n')
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-gastos-${reportData.start}-a-${reportData.end}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sendReportByEmail = () => {
    const subject = `Informe de gastos (${reportData.start} a ${reportData.end})`
    const body = [
      `Resumen del informe`,
      `Periodo: ${reportData.start} a ${reportData.end}`,
      `Registros: ${reportData.filtered.length}`,
      `Total: ${formatMoney(reportData.total)}`,
      '',
      'Descarga el CSV desde la aplicación y adjúntalo al correo si lo necesitas.'
    ].join('\n')

    const to = emailTo.trim()
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const onUploadDocuments = async (event) => {
    const files = Array.from(event.target.files || [])
    if(!files.length) return

    const parsed = await Promise.all(files.map(async (file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      dataUrl: await toDataUrl(file)
    })))

    setDocuments(prev => [...parsed, ...prev])
    event.target.value = ''
  }

  const downloadDocument = (documentItem) => {
    const a = document.createElement('a')
    a.href = documentItem.dataUrl
    a.download = documentItem.name
    a.click()
  }

  const sendDocumentByEmail = (documentItem) => {
    const subject = `Recibo/Documento: ${documentItem.name}`
    const body = [
      `Te envío el documento: ${documentItem.name}`,
      '',
      'Descárgalo desde la app y adjúntalo manualmente en este correo.'
    ].join('\n')
    const to = emailTo.trim()
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-6">

        <Card variant="form">
          <CardHeader>
            <CardTitle>Generador de informes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Desde (mes)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    className="report-dark-select"
                    value={String(fromMonthParts.month)}
                    onChange={(e) => setFromMonth(updateMonthValue(fromMonth, 'month', e.target.value))}
                  >
                    {MONTHS_ES.map((monthName, index) => (
                      <option key={monthName} value={String(index + 1)}>{monthName}</option>
                    ))}
                  </Select>
                  <Select
                    className="report-dark-select"
                    value={String(fromMonthParts.year)}
                    onChange={(e) => setFromMonth(updateMonthValue(fromMonth, 'year', e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={String(year)}>{year}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Hasta (mes)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    className="report-dark-select"
                    value={String(toMonthParts.month)}
                    onChange={(e) => setToMonth(updateMonthValue(toMonth, 'month', e.target.value))}
                  >
                    {MONTHS_ES.map((monthName, index) => (
                      <option key={monthName} value={String(index + 1)}>{monthName}</option>
                    ))}
                  </Select>
                  <Select
                    className="report-dark-select"
                    value={String(toMonthParts.year)}
                    onChange={(e) => setToMonth(updateMonthValue(toMonth, 'year', e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={String(year)}>{year}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Categoría</label>
                  <Select className="report-dark-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="all">Todas</option>
                    {state.categories.map(category => (
                      <option key={category.id} value={String(category.id)}>{category.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Cuenta</label>
                  <Select className="report-dark-select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                    <option value="all">Todas</option>
                    {state.accounts.map(account => (
                      <option key={account.id} value={String(account.id)}>{account.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Persona</label>
                  <Select className="report-dark-select" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                    <option value="all">Todas</option>
                    {state.owners.map(owner => (
                      <option key={owner.id} value={String(owner.id)}>{owner.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--card)] space-y-3">
              <div className="text-sm font-semibold">Vista previa del informe a descargar</div>
              <div className="text-sm">Periodo: <span className="font-semibold">{reportData.start}</span> a <span className="font-semibold">{reportData.end}</span></div>
              <div className="text-sm">Registros: <span className="font-semibold">{reportData.filtered.length}</span></div>
              <div className="text-sm">Total: <span className="font-semibold">{formatMoney(reportData.total)}</span></div>

              <div className="text-sm font-semibold pt-1">Listado de gastos</div>
              <div className="overflow-y-auto max-h-56">
                <table className="w-full text-xs md:text-sm table-auto">
                  <thead>
                    <tr className="border-b bg-transparent">
                      <th className="text-left py-2 px-2">Fecha</th>
                      <th className="hidden md:table-cell text-left py-2 px-2">Cuenta</th>
                      <th className="hidden md:table-cell text-left py-2 px-2">Persona</th>
                      <th className="hidden md:table-cell text-left py-2 px-2">Categoría</th>
                      <th className="text-left py-2 px-2">Concepto</th>
                      <th className="text-right py-2 px-2">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleReportRows.map(expense => {
                      const account = state.accounts.find(a => a.id === expense.account_id)?.name || '—'
                      const owner = state.owners.find(o => o.id === expense.owner_id)?.name || '—'
                      const category = state.categories.find(c => c.id === expense.category_id)?.name || '—'
                      return (
                        <tr key={expense.id} className="border-b last:border-b-0">
                          <td className="py-2 px-2 align-top">{expense.date}</td>
                          <td className="hidden md:table-cell py-2 px-2 align-top">{account}</td>
                          <td className="hidden md:table-cell py-2 px-2 align-top">{owner}</td>
                          <td className="hidden md:table-cell py-2 px-2 align-top">{category}</td>
                          <td className="py-2 px-2 align-top break-words">
                            <div>{expense.description || '—'}</div>
                            <div className="md:hidden text-[11px] text-[var(--muted)] mt-1">{category} · {owner} · {account}</div>
                          </td>
                          <td className="py-2 px-2 text-right font-semibold">{formatMoney(Number(expense.amount || 0))}</td>
                        </tr>
                      )
                    })}
                    {reportData.filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-5 px-2 text-center text-[var(--muted)]">No hay gastos en ese rango.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {reportData.filtered.length > 0 && (
                <div className="mt-2 z-10 rounded-md bg-[var(--card)]/95 backdrop-blur-sm px-2 py-2 shadow-[0_-6px_16px_rgba(0,0,0,0.08)] md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:shadow-none">
                  <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                    Mostrando {reportStartItem}-{reportEndItem} de {reportData.filtered.length}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReportPage(prev => Math.max(prev - 1, 0))}
                      disabled={reportPagesCount === 0 || activeReportPage === 0}
                    >
                      Anterior
                    </Button>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      Página {activeReportPage + 1} de {Math.max(reportPagesCount, 1)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReportPage(prev => Math.min(prev + 1, reportPagesCount - 1))}
                      disabled={reportPagesCount === 0 || activeReportPage === reportPagesCount - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                  <select
                    value={String(activeReportPage)}
                    onChange={(e) => setReportPage(Number(e.target.value))}
                    disabled={reportPagesCount === 0}
                    className="mt-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[11px] text-[var(--text)] w-full"
                  >
                    {reportPagesCount > 0
                      ? Array.from({ length: reportPagesCount }, (_, pageIndex) => {
                          const start = pageIndex * reportPageSize + 1
                          const end = Math.min(start + reportPageSize - 1, reportData.filtered.length)
                          return (
                            <option key={`reports-page-${start}-${end}`} value={String(pageIndex)}>
                              Gastos {start}-{end}
                            </option>
                          )
                        })
                      : <option value="0">Solo primeros 10</option>
                    }
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full lg:max-w-2xl">
                <div className="w-full">
                  <label className="text-xs font-semibold text-[var(--muted)] mb-1 block">Correo destino</label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
                <Button variant="default" onClick={sendReportByEmail} className="sm:shrink-0">Enviar informe por correo</Button>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button variant="interactive" onClick={downloadReport}>Descargar informe en csv</Button>
                <Button variant="outline" onClick={downloadReportTxt}>Descargar informe en txt</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos y recibos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input type="file" multiple onChange={onUploadDocuments} className="max-w-md" />
            </div>

            <div className="overflow-y-auto max-h-72">
              <table className="w-full text-xs md:text-sm table-auto">
                <thead>
                  <tr className="border-b bg-transparent">
                    <th className="text-left py-2 px-2 md:px-3">Documento</th>
                    <th className="hidden md:table-cell text-left py-2 px-2 md:px-3">Fecha subida</th>
                    <th className="text-right py-2 px-2 md:px-3">Tamaño</th>
                    <th className="text-center py-2 px-2 md:px-3">Control</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDocumentsRows.map(doc => (
                    <tr key={doc.id} className="border-b">
                      <td className="py-2 px-2 md:px-3 align-top break-words">
                        <div>{doc.name}</div>
                        <div className="md:hidden text-[11px] text-[var(--muted)] mt-1">{new Date(doc.uploadedAt).toLocaleString('es-ES')}</div>
                      </td>
                      <td className="hidden md:table-cell py-2 px-2 md:px-3 align-top">{new Date(doc.uploadedAt).toLocaleString('es-ES')}</td>
                      <td className="py-2 px-2 md:px-3 text-right align-top">{(doc.size / 1024).toFixed(1)} KB</td>
                      <td className="py-2 px-2 md:px-3 align-top">
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => downloadDocument(doc)}>Descargar</Button>
                          <Button size="sm" variant="default" onClick={() => sendDocumentByEmail(doc)}>Enviar correo</Button>
                          <Button size="xs" variant="danger" onClick={() => removeDocument(doc.id)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[var(--muted)]">No hay documentos subidos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {documents.length > 0 && (
              <div className="mt-2 z-10 rounded-md bg-[var(--card)]/95 backdrop-blur-sm px-2 py-2 shadow-[0_-6px_16px_rgba(0,0,0,0.08)] md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:shadow-none">
                <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                  Mostrando {documentsStartItem}-{documentsEndItem} de {documents.length}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDocumentsPage(prev => Math.max(prev - 1, 0))}
                    disabled={documentsPagesCount === 0 || activeDocumentsPage === 0}
                  >
                    Anterior
                  </Button>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    Página {activeDocumentsPage + 1} de {Math.max(documentsPagesCount, 1)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDocumentsPage(prev => Math.min(prev + 1, documentsPagesCount - 1))}
                    disabled={documentsPagesCount === 0 || activeDocumentsPage === documentsPagesCount - 1}
                  >
                    Siguiente
                  </Button>
                </div>
                <select
                  value={String(activeDocumentsPage)}
                  onChange={(e) => setDocumentsPage(Number(e.target.value))}
                  disabled={documentsPagesCount === 0}
                  className="mt-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[11px] text-[var(--text)] w-full"
                >
                  {documentsPagesCount > 0
                    ? Array.from({ length: documentsPagesCount }, (_, pageIndex) => {
                        const start = pageIndex * documentsPageSize + 1
                        const end = Math.min(start + documentsPageSize - 1, documents.length)
                        return (
                          <option key={`report-documents-page-${start}-${end}`} value={String(pageIndex)}>
                            Documentos {start}-{end}
                          </option>
                        )
                      })
                    : <option value="0">Solo primeros 10</option>
                  }
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        [data-theme='dark'] .report-dark-select {
          color-scheme: dark;
        }

        .report-dark-select {
          padding-right: 40px !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px 16px;
        }

        [data-theme='dark'] .report-dark-select option {
          background-color: #000000;
          color: #ffffff;
        }
      `}</style>
    </div>
  )
}
