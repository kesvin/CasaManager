'use client'

import { useMemo, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

function FieldIcon({ kind }){
  if(kind === 'name'){
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 20c0-3.2 3.1-5.8 7-5.8s7 2.6 7 5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if(kind === 'company'){
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M3 21h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 21V7h14v14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 11h2M9 15h2M13 11h2M13 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if(kind === 'phone'){
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M6.6 3h3L11 7l-2 1.8c1 2 2.6 3.6 4.6 4.6L15.4 11l4 1.4v3c0 .8-.6 1.5-1.4 1.6-7 .8-12.8-5-12-12 .1-.8.8-1.4 1.6-1.4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function FieldLabel({ kind, text }){
  return (
    <div className="text-xs text-[var(--muted)] flex items-center gap-2">
      <FieldIcon kind={kind} />
      <span>{text}</span>
    </div>
  )
}

export default function ContactsPage(){
  const { state, addHouseContact, updateHouseContact, deleteHouseContact } = useGastos()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [quickSearch, setQuickSearch] = useState('')

  const filteredContacts = useMemo(() => {
    const q = quickSearch.trim().toLowerCase()
    const items = state.houseContacts || []
    if(!q) return items

    return items.filter(item => {
      const target = [item.name, item.company, item.phone, item.description]
        .map(v => String(v || '').toLowerCase())
        .join(' ')
      return target.includes(q)
    })
  }, [state.houseContacts, quickSearch])

  const handleAdd = () => {
    if(!name.trim()){
      setErrorMsg('El nombre es obligatorio.')
      return
    }
    if(!phone.trim()){
      setErrorMsg('El teléfono es obligatorio.')
      return
    }

    addHouseContact({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      description: description.trim()
    })

    setName('')
    setCompany('')
    setPhone('')
    setDescription('')
    setErrorMsg('')
  }

  return (
    <div className="container space-y-6 min-w-0">
      <Card variant="form">
        <CardHeader>
          <CardTitle>Contactos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="space-y-1">
              <FieldLabel kind="name" text="Nombre de la persona" />
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ej: Marta López" className="h-9" />
            </div>
            <div className="space-y-1">
              <FieldLabel kind="company" text="Empresa" />
              <Input value={company} onChange={(e)=>setCompany(e.target.value)} placeholder="Ej: Inmobiliaria Centro" className="h-9" />
            </div>
            <div className="space-y-1">
              <FieldLabel kind="phone" text="Teléfono" />
              <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Ej: 600123123" className="h-9" />
            </div>
            <div className="space-y-1">
              <FieldLabel kind="description" text="Descripción" />
              <Input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Ej: Técnico de caldera" className="h-9" />
            </div>
          </div>

          {errorMsg && <div className="text-sm" style={{ color: 'var(--purple)' }}>{errorMsg}</div>}

          <div className="flex justify-end">
            <Button variant="interactive" onClick={handleAdd}>Añadir contacto</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de contactos ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input
              value={quickSearch}
              onChange={(e)=>setQuickSearch(e.target.value)}
              placeholder="Búsqueda rápida: nombre, empresa, teléfono o descripción"
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full text-xs md:text-sm table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 md:px-3">Nombre</th>
                  <th className="hidden md:table-cell text-left py-2 px-2 md:px-3">Empresa</th>
                  <th className="text-left py-2 px-2 md:px-3">Teléfono</th>
                  <th className="hidden md:table-cell text-left py-2 px-2 md:px-3">Descripción</th>
                  <th className="text-center py-2 px-2 md:px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(item => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 px-2 md:px-3 align-top break-all">
                      {editingId === item.id ? (
                        <Input value={editName} onChange={(e)=>setEditName(e.target.value)} />
                      ) : (
                        <>
                          <div className="font-medium">{item.name}</div>
                          <div className="md:hidden text-xs text-[var(--muted)] mt-1">{item.company || '-'}</div>
                          <div className="md:hidden text-xs text-[var(--muted)] mt-1">{item.description || '-'}</div>
                        </>
                      )}
                    </td>
                    <td className="hidden md:table-cell py-2 px-2 md:px-3 align-top">
                      {editingId === item.id ? (
                        <Input value={editCompany} onChange={(e)=>setEditCompany(e.target.value)} />
                      ) : (
                        item.company || '-'
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3 align-top break-words">
                      {editingId === item.id ? (
                        <Input value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} />
                      ) : (
                        item.phone
                      )}
                    </td>
                    <td className="hidden md:table-cell py-2 px-2 md:px-3 align-top break-words">
                      {editingId === item.id ? (
                        <Input value={editDescription} onChange={(e)=>setEditDescription(e.target.value)} />
                      ) : (
                        item.description || '-'
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3 align-top">
                      <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2 min-w-0">
                        {editingId === item.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="interactive"
                              className="w-full sm:w-auto px-2"
                              onClick={() => {
                                if(!editName.trim() || !editPhone.trim()) return
                                updateHouseContact(item.id, {
                                  name: editName.trim(),
                                  company: editCompany.trim(),
                                  phone: editPhone.trim(),
                                  description: editDescription.trim()
                                })
                                setEditingId(null)
                              }}
                            >
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto px-2" onClick={() => setEditingId(null)}>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="xs"
                              variant="edit"
                              className="w-full sm:w-auto px-2"
                              onClick={() => {
                                setEditingId(item.id)
                                setEditName(item.name || '')
                                setEditCompany(item.company || '')
                                setEditPhone(item.phone || '')
                                setEditDescription(item.description || '')
                              }}
                            >
                              Editar
                            </Button>
                            <Button size="xs" variant="danger" className="w-full sm:w-auto px-2" onClick={()=>deleteHouseContact(item.id)}>Eliminar</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(filteredContacts.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[var(--muted)]">No hay resultados para la búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
