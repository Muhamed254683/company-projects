import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

// Zajednicki okvir za sve stranice. <Outlet /> je mesto gde React Router
// ubacuje stranicu za trenutni URL (CompaniesPage, ProjectsPage...).
function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
