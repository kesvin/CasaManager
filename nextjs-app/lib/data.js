// Data utilities: mirrors the original SPA logic

export const STORE_KEY = 'gastosData_v1'
export const THEME_KEY = 'gastos_theme'

export function defaultData(){
  const categories = [
    { id: 1, name: 'Comida' },
    { id: 2, name: 'Servicios' },
    { id: 3, name: 'Transporte' },
    { id: 4, name: 'Ocio' },
    { id: 5, name: 'Salud' },
    { id: 6, name: 'Hogar' },
    { id: 7, name: 'Tecnología' },
    { id: 8, name: 'Mascotas' },
    { id: 9, name: 'Educación' },
    { id: 10, name: 'Imprevistos' }
  ]

  const descriptionsByCategory = {
    1: ['Compra semanal supermercado', 'Mercado de barrio', 'Fruta y verdura'],
    2: ['Factura de luz', 'Pago de agua', 'Recibo de internet'],
    3: ['Gasolina', 'Billete transporte público', 'Parking centro'],
    4: ['Cena fuera', 'Cine en pareja', 'Suscripción streaming'],
    5: ['Farmacia', 'Consulta médica', 'Suplementos'],
    6: ['Ferretería', 'Limpieza hogar', 'Menaje cocina'],
    7: ['Accesorio móvil', 'Software mensual', 'Repuesto ordenador'],
    8: ['Comida mascota', 'Veterinario', 'Accesorios mascota'],
    9: ['Curso online', 'Material de estudio', 'Libro técnico'],
    10: ['Reparación urgente', 'Avería doméstica', 'Compra inesperada']
  }

  const seedExpenses = Array.from({ length: 20 }, (_, idx) => {
    const month = (idx % 3) + 1
    const dayMax = month === 2 ? 28 : 31
    const day = ((idx * 7 + 3) % dayMax) + 1
    const date = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const owner_id = idx % 2 === 0 ? 1 : 2
    const account_id = (idx % 2) + 1
    const category_id = ((idx * 3 + 2) % 10) + 1
    const amount = Number((18 + ((idx * 29.37) % 235)).toFixed(2))
    const pool = descriptionsByCategory[category_id]
    const description = pool[idx % pool.length]

    return {
      id: idx + 1,
      account_id,
      owner_id,
      category_id,
      amount,
      date,
      description
    }
  })

  // Seed 10 owners
  const ownerNames = ['Kevin','Alba','Luis','Marta','Sergio','Lucía','Carlos','Ana','David','Paula'];
  const owners = ownerNames.map((name, idx) => ({
    id: idx + 1,
    name,
    icon: idx % 2 === 0 ? 'male' : 'female',
    monthly_income: 1500 + (idx * 100)
  }));

  // Seed 10 budgets
  const budgets = owners.map(o => ({ owner_id: o.id, amount: 500 + (o.id * 50) }));

  // Seed 10 fixed expenses
  const fixedExpenses = Array.from({ length: 10 }, (_, idx) => ({
    id: idx + 1,
    name: `Gasto fijo ${idx + 1}`,
    amount: 50 + idx * 25,
    day: (idx * 3) % 28 + 1,
    account_id: (idx % 2) + 1,
    owner_id: owners[(idx + 1) % owners.length].id,
    category_id: ((idx * 2) % 10) + 1,
    active: true
  }));

  return {
    accounts: [{id:1,name:'Efectivo'},{id:2,name:'Tarjeta'}],
    owners,
    categories,
    budgets,
    fixedExpenses,
    improvements: [
      { id: 1, title: 'Reformar baño', estimated_cost: 2500 },
      { id: 2, title: 'Pintar salón', estimated_cost: 480 }
    ],
    houseDocuments: [
      {
        id: 1,
        title: 'Plano general vivienda',
        kind: 'Plano',
        estimated_cost: 0,
        contact_name: 'Laura Martín',
        contact_phone: '600123001',
        company: 'Inmobiliaria Centro',
        notes: 'Versión entregada en la firma.',
        file_name: '',
        file_type: '',
        file_size: 0,
        file_data_url: '',
        created_at: '2026-03-01T09:00:00.000Z'
      },
      {
        id: 2,
        title: 'Presupuesto reforma baño',
        kind: 'Coste',
        estimated_cost: 4200,
        contact_name: 'Diego Pérez',
        contact_phone: '600123002',
        company: 'Construcciones Delta',
        notes: 'Incluye alicatado y fontanería.',
        file_name: '',
        file_type: '',
        file_size: 0,
        file_data_url: '',
        created_at: '2026-03-01T10:30:00.000Z'
      },
      {
        id: 3,
        title: 'Contrato mantenimiento caldera',
        kind: 'Mantenimiento',
        estimated_cost: 180,
        contact_name: 'Sergio Vidal',
        contact_phone: '600123003',
        company: 'TecnoMantenimiento',
        notes: 'Renovación anual en noviembre.',
        file_name: '',
        file_type: '',
        file_size: 0,
        file_data_url: '',
        created_at: '2026-03-01T12:00:00.000Z'
      }
    ],
    houseContacts: [
      {
        id: 1,
        name: 'Laura Martín',
        company: 'Inmobiliaria Centro',
        phone: '600123001',
        description: 'Gestora de la compra y postventa.',
        created_at: '2026-03-01T09:00:00.000Z'
      },
      {
        id: 2,
        name: 'Diego Pérez',
        company: 'Construcciones Delta',
        phone: '600123002',
        description: 'Responsable de reformas interiores.',
        created_at: '2026-03-01T10:30:00.000Z'
      },
      {
        id: 3,
        name: 'Sergio Vidal',
        company: 'TecnoMantenimiento',
        phone: '600123003',
        description: 'Técnico de mantenimiento de caldera.',
        created_at: '2026-03-01T12:00:00.000Z'
      }
    ],
    expenses: seedExpenses
  }
}

export function loadData(){
  if(typeof window === 'undefined') return defaultData()

  // In production, demo data should be disabled unless explicitly enabled
  const demoEnabled = String(process.env.NEXT_PUBLIC_DEMO_ENABLED || 'false') === 'true'
  if (process.env.NODE_ENV === 'production' && !demoEnabled) {
    try{
      const raw = localStorage.getItem(STORE_KEY)
      if(!raw) return {
        accounts: [], owners: [], categories: [], budgets: [], fixedExpenses: [], improvements: [], houseDocuments: [], houseContacts: [], expenses: []
      }
      return JSON.parse(raw)
    }catch(e){
      console.error(e)
      return { accounts: [], owners: [], categories: [], budgets: [], fixedExpenses: [], improvements: [], houseDocuments: [], houseContacts: [], expenses: [] }
    }
  }

  try{
    const raw = localStorage.getItem(STORE_KEY)
    if(!raw) return defaultData()
    return JSON.parse(raw)
  }catch(e){
    console.error(e)
    return defaultData()
  }
}

export function saveData(state){
  if(typeof window === 'undefined') return
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  }catch(e){
    console.error('Error al guardar:', e)
  }
}

export function nextId(arr){
  return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1
}

export function formatMoney(v){
  return Number(v).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €'
}

export function getOwnerIconSvg(type, size=16){
  if(type==='female') 
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="3.2" stroke="#ff6b9a" stroke-width="1.4" fill="#ffd6e0"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#ff6b9a" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="3.2" stroke="#4a90e2" stroke-width="1.4" fill="#d7eaff"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#4a90e2" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`
}

export function getChartColors(count, isDark=false){
  const darkPalette = [
    '#334155',
    '#1e3a8a',
    '#0f766e',
    '#4c1d95',
    '#155e75',
    '#3f3f46',
    '#1d4ed8',
    '#0f766e'
  ]
  const lightPalette = [
    '#2563eb',
    '#14b8a6',
    '#8b5cf6',
    '#0ea5e9',
    '#06b6d4',
    '#64748b',
    '#4f46e5',
    '#0891b2'
  ]

  const palette = isDark ? darkPalette : lightPalette
  return Array.from({ length: count }, (_, index) => palette[index % palette.length])
}
