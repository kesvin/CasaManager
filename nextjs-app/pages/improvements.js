'use client'

import { useRef, useState } from 'react'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function ImprovementsPage(){
  const { state, addImprovement, updateImprovement, deleteImprovement } = useGastos()
  const [title, setTitle] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCost, setEditCost] = useState('')
  const [showFormWarning, setShowFormWarning] = useState(false)
  const warningTimeoutRef = useRef(null)

  const triggerFormWarning = () => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    setShowFormWarning(true)
    warningTimeoutRef.current = setTimeout(() => {
      setShowFormWarning(false)
      warningTimeoutRef.current = null
    }, 2200)
  }

  const handleAdd = () => {
    if(!title.trim() || !estimatedCost) {
      triggerFormWarning()
      return
    }
    addImprovement({ title: title.trim(), estimated_cost: Number(estimatedCost) })
    setTitle('')
    setEstimatedCost('')
    setShowFormWarning(false)
  }

  return (
    <div className="container">
      <Card variant="form">
        <CardHeader>
          <CardTitle>Mejoras del hogar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <Input
              className="h-9 col-span-2 lg:col-span-1"
              placeholder="Ej: Reformar baño"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              className="h-9"
              type="number"
              min="0"
              step="0.01"
              placeholder="Coste estimado (€)"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
            <div className="relative w-full col-span-2 lg:col-span-1">
              <div
                className={`pointer-events-none absolute left-1/2 z-20 w-max max-w-[260px] -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11px] font-medium text-[var(--text)] shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition-all duration-200 ${showFormWarning ? 'bottom-[calc(100%+10px)] opacity-100' : 'bottom-[calc(100%-2px)] opacity-0'}`}
                aria-hidden="true"
              >
                Completa anotación y coste estimado
              </div>
              <Button variant="interactive" onClick={handleAdd} className="w-full h-9">Añadir mejora</Button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full text-xs md:text-sm table-auto">
              <thead>
                <tr className="border-b bg-transparent">
                  <th className="text-left py-2 px-2 md:px-3">Anotación</th>
                  <th className="text-right py-2 px-2 md:px-3">Coste estimado</th>
                  <th className="text-center py-2 px-2 md:px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(state.improvements || []).map(item => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 px-2 md:px-3 align-top break-words">
                      {editingId === item.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      ) : (
                        item.title
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3 text-right font-semibold align-top">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editCost}
                          onChange={(e) => setEditCost(e.target.value)}
                        />
                      ) : (
                        formatMoney(item.estimated_cost)
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3 align-top">
                      <div className="flex flex-col sm:flex-row justify-center gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="interactive"
                              onClick={() => {
                                if(!editTitle.trim() || !editCost) return
                                updateImprovement(item.id, { title: editTitle.trim(), estimated_cost: Number(editCost) })
                                setEditingId(null)
                              }}
                            >
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="xs"
                              variant="edit"
                              onClick={() => {
                                setEditingId(item.id)
                                setEditTitle(item.title)
                                setEditCost(String(item.estimated_cost || 0))
                              }}
                            >
                              Editar
                            </Button>
                            <Button size="xs" variant="danger" onClick={() => deleteImprovement(item.id)}>Eliminar</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!state.improvements || state.improvements.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[var(--muted)]">Todavía no hay mejoras anotadas.</td>
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
