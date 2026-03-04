const fs = require('fs')
const path = require('path')

function pad(n){return String(n).padStart(2,'0')}
function formatDate(d){
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

function uniqueRandomFloats(count, min, max){
  const set = new Set()
  while(set.size < count){
    const v = (Math.random()*(max-min) + min)
    // two decimals
    set.add(Number(v.toFixed(2)))
  }
  return Array.from(set)
}

const owners = [
  { id:1, name:'Kevin', icon:'male', monthly_income:1600 },
  { id:2, name:'Alba', icon:'female', monthly_income:1500 },
  { id:3, name:'Luis', icon:'male', monthly_income:1700 },
  { id:4, name:'Marta', icon:'female', monthly_income:1550 },
  { id:5, name:'Sergio', icon:'male', monthly_income:1650 }
]

const categories = [
  { id:1, name: 'Comida' },
  { id:2, name: 'Servicios' },
  { id:3, name: 'Transporte' },
  { id:4, name: 'Ocio' },
  { id:5, name: 'Salud' },
  { id:6, name: 'Hogar' },
  { id:7, name: 'Tecnología' },
  { id:8, name: 'Mascotas' },
  { id:9, name: 'Educación' },
  { id:10, name: 'Imprevistos' }
]

const accounts = [{id:1,name:'Efectivo'},{id:2,name:'Tarjeta'}]

const amounts = uniqueRandomFloats(20, 5, 250)

const expenses = Array.from({length:20},(_,i)=>{
  const owner_id = owners[randomInt(0, owners.length-1)].id
  const category_id = categories[randomInt(0, categories.length-1)].id
  const account_id = randomInt(1,2)
  // random date within last 90 days
  const daysAgo = randomInt(0,90)
  const date = formatDate(new Date(Date.now() - daysAgo*24*60*60*1000))
  const amount = amounts[i]
  const description = `${categories[category_id-1].name} - Gasto ${i+1}`
  return {
    id: i+1,
    account_id,
    owner_id,
    category_id,
    amount,
    date,
    description
  }
})

const budgets = owners.map(o=>({ owner_id: o.id, amount: 500 }))

const fixedExpenses = []
const improvements = []
const houseDocuments = []
const houseContacts = []

const data = {
  accounts,
  owners,
  categories,
  budgets,
  fixedExpenses,
  improvements,
  houseDocuments,
  houseContacts,
  expenses
}

const outPath = path.join(__dirname, '..', 'public', 'demo-data.json')
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
console.log('Wrote demo data to', outPath)
console.log('Run `node scripts/seedDemoData.js` from nextjs-app folder, then in the browser console:')
console.log("fetch('/demo-data.json').then(r=>r.json()).then(d=>localStorage.setItem('gastosData_v1',JSON.stringify(d))).then(()=>location.reload())")
