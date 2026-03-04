import OwnersList from '../components/OwnersList'

export default function AdminPage(){
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-6">
        <OwnersList />
      </div>
    </div>
  )
}
