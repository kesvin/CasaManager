import AddExpenseForm from '../components/AddExpenseForm'
import FixedExpensesManager from '../components/FixedExpensesManager'

export default function ExpensesPage(){
  // Importar CardHeader, CardTitle, CardDescription
  const { CardHeader, CardTitle, CardDescription } = require('../components/ui/card');
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <CardHeader>
            <CardTitle>Todos los gastos</CardTitle>
            <CardDescription>Visualiza y añade todos los gastos mensuales y únicos de la casa.</CardDescription>
          </CardHeader>
          <AddExpenseForm />
          <FixedExpensesManager />
        </div>
      </div>
    </div>
  )
}
