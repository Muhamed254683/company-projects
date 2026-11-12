import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext.js'

// "Cuvar" ruta: stranice unutar njega vide samo prijavljeni korisnici.
// Neprijavljen korisnik ide na /login, a pamtimo kuda je krenuo (state.from), da ga posle prijave vratimo tamo.
function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <p className="p-6 text-gray-500">Provera prijave...</p>
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

export default RequireAuth
