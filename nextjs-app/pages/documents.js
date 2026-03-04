'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024

function formatBytes(bytes){
  const value = Number(bytes || 0)
  if(value < 1024) return `${value} B`
  if(value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

export default function DocumentsPage(){
  const { state, addHouseDocument, deleteHouseDocument } = useGastos()

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('Plano')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const [documentsPage, setDocumentsPage] = useState(0)

  const totalEstimated = useMemo(
    () => (state.houseDocuments || []).reduce((acc, item) => acc + Number(item.estimated_cost || 0), 0),
    [state.houseDocuments]
  )

  const filteredDocuments = useMemo(() => {
    const q = quickSearch.trim().toLowerCase()
    const items = state.houseDocuments || []
    if(!q) return items

    return items.filter(item => {
      const target = [
        item.title,
        item.kind,
        item.company,
        item.contact_name,
        item.contact_phone,
        item.notes,
        item.file_name
      ]
        .map(v => String(v || '').toLowerCase())
        .join(' ')

      return target.includes(q)
    })
  }, [state.houseDocuments, quickSearch])

  const documentsPageSize = 10
  const documentsPagesCount = Math.ceil(filteredDocuments.length / documentsPageSize)
  const activeDocumentsPage = Math.min(documentsPage, Math.max(documentsPagesCount - 1, 0))
  const visibleDocuments = filteredDocuments.slice(
    activeDocumentsPage * documentsPageSize,
    activeDocumentsPage * documentsPageSize + documentsPageSize
  )
  const documentsStartItem = filteredDocuments.length > 0 ? activeDocumentsPage * documentsPageSize + 1 : 0
  const documentsEndItem = Math.min(documentsStartItem + visibleDocuments.length - 1, filteredDocuments.length)

  useEffect(() => {
    setDocumentsPage(0)
  }, [quickSearch, state.houseDocuments.length])

  const handleSave = async () => {
    if(!title.trim()){
      setErrorMsg('La anotación/título es obligatoria.')
      return
    }
    if(!selectedFile){
      setErrorMsg('Selecciona un archivo para importar el documento.')
      return
    }
    if(selectedFile.size > MAX_FILE_SIZE_BYTES){
      setErrorMsg('El archivo es demasiado grande para guardarlo en local. Máximo 4 MB.')
      return
    }

    try{
      setSaving(true)
      setErrorMsg('')
      const fileDataUrl = await readFileAsDataUrl(selectedFile)

      addHouseDocument({
        title: title.trim(),
        kind,
        estimated_cost: Number(estimatedCost || 0),
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        company: company.trim(),
        notes: notes.trim(),
        file_name: selectedFile.name,
        file_type: selectedFile.type || 'application/octet-stream',
        file_size: selectedFile.size,
        file_data_url: fileDataUrl
      })

      setTitle('')
      setKind('Plano')
      setEstimatedCost('')
      setContactName('')
      setContactPhone('')
      setCompany('')
      setNotes('')
      setSelectedFile(null)
    }catch(e){
      setErrorMsg('No se pudo guardar el documento. Intenta con un archivo más pequeño.')
    }finally{
      setSaving(false)
    }
  }

  return (
    <div className="container space-y-6">
      <Card variant="form">
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Anotación / título</div>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ej: Plano instalación eléctrica" className="h-9" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Tipo</div>
              <select className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text)] px-3 py-2 text-sm h-9" value={kind} onChange={(e)=>setKind(e.target.value)}>
                <option>Plano</option>
                <option>Coste</option>
                <option>Inmobiliaria</option>
                <option>Constructora</option>
                <option>Técnico</option>
                <option>Mantenimiento</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Coste estimado (€)</div>
              <Input type="number" min="0" step="0.01" value={estimatedCost} onChange={(e)=>setEstimatedCost(e.target.value)} placeholder="Opcional" className="h-9" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Empresa</div>
              <Input value={company} onChange={(e)=>setCompany(e.target.value)} placeholder="Ej: Inmobiliaria Centro" className="h-9" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Contacto</div>
              <Input value={contactName} onChange={(e)=>setContactName(e.target.value)} placeholder="Nombre del contacto" className="h-9" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)]">Teléfono</div>
              <Input value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} placeholder="Ej: 600123123" className="h-9" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-[var(--muted)]">Notas</div>
            <textarea
              value={notes}
              onChange={(e)=>setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text)] px-3 py-2 text-sm"
              placeholder="Datos importantes, condiciones, incidencias, etc."
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-[var(--muted)]">Importar documento (PDF, imagen, etc.)</div>
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt"
            />
            <div className="text-xs text-[var(--muted)]">Límite recomendado para guardar en el navegador: 4 MB por archivo.</div>
          </div>

          {errorMsg && <div className="text-sm" style={{ color: 'var(--purple)' }}>{errorMsg}</div>}

          <div className="flex justify-end">
            <Button variant="interactive" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Importar y archivar'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archivo de documentos ({filteredDocuments.length}) · Coste estimado total: {formatMoney(totalEstimated)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input
              value={quickSearch}
              onChange={(e)=>setQuickSearch(e.target.value)}
              placeholder="Búsqueda rápida: título, tipo, empresa, contacto, teléfono o notas"
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full text-xs md:text-sm table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 md:px-3">Documento</th>
                  <th className="hidden md:table-cell text-left py-2 px-2 md:px-3">Contacto</th>
                  <th className="text-right py-2 px-2 md:px-3">Coste</th>
                  <th className="hidden md:table-cell text-right py-2 px-2 md:px-3">Archivo</th>
                  <th className="text-center py-2 px-2 md:px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleDocuments.map(item => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 px-2 md:px-3 align-top break-words">
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-[var(--muted)]">{item.kind} · {new Date(item.created_at).toLocaleDateString('es-ES')}</div>
                      <div className="md:hidden text-xs text-[var(--muted)] mt-1">{item.contact_name || '-'}{item.company ? ` · ${item.company}` : ''}{item.contact_phone ? ` · ${item.contact_phone}` : ''}</div>
                      <div className="md:hidden text-xs text-[var(--muted)] mt-1">{item.file_name || 'archivo'} · {formatBytes(item.file_size || 0)}</div>
                      {item.notes ? <div className="text-xs text-[var(--muted)] mt-1">{item.notes}</div> : null}
                    </td>
                    <td className="hidden md:table-cell py-2 px-2 md:px-3 align-top">
                      <div>{item.contact_name || '-'}</div>
                      <div className="text-xs text-[var(--muted)]">{item.company || ''}{item.contact_phone ? ` · ${item.contact_phone}` : ''}</div>
                    </td>
                    <td className="py-2 px-2 md:px-3 text-right font-semibold align-top">{formatMoney(item.estimated_cost || 0)}</td>
                    <td className="hidden md:table-cell py-2 px-2 md:px-3 text-right align-top">
                      {item.file_data_url ? (
                        <a href={item.file_data_url} download={item.file_name || 'documento'} className="underline">
                          {item.file_name || 'archivo'}
                        </a>
                      ) : (
                        '-'
                      )}
                      <div className="text-xs text-[var(--muted)]">{formatBytes(item.file_size || 0)}</div>
                    </td>
                    <td className="py-2 px-2 md:px-3 align-top">
                      <div className="flex justify-center">
                        <Button size="xs" variant="danger" onClick={()=>deleteHouseDocument(item.id)}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(filteredDocuments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[var(--muted)]">No hay resultados para la búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length > 0 && (
            <div className="mt-2 z-10 rounded-md bg-[var(--card)]/95 backdrop-blur-sm px-2 py-2 shadow-[0_-6px_16px_rgba(0,0,0,0.08)] md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:shadow-none">
              <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                Mostrando {documentsStartItem}-{documentsEndItem} de {filteredDocuments.length}
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
                      const end = Math.min(start + documentsPageSize - 1, filteredDocuments.length)
                      return (
                        <option key={`documents-page-${start}-${end}`} value={String(pageIndex)}>
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
  )
}
