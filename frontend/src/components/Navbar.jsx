import { Link, NavLink } from 'react-router-dom'
import { BACKEND_URL } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'

const links = [
  { to: '/companies', label: 'Companies' },
  { to: '/projects', label: 'Projects' },
  { to: '/users', label: 'Users' },
]

// NavLink prosledjuje isActive: true kada je njegov URL trenutno otvoren.
function navLinkClass({ isActive }) {
  const base = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'

  return isActive
    ? `${base} bg-white text-blue-700`
    : `${base} text-blue-100 hover:bg-blue-600 hover:text-white`
}

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-blue-700 shadow">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold text-white">
          Company Projects
        </Link>

        <ul className="flex gap-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* Laravel Blade dashboard (druga aplikacija), zato obican <a>, a ne NavLink.
              Adresa dolazi iz .env (VITE_API_URL bez "/api"), nije hardkodovana. */}
          <li className="ml-2 border-l border-blue-500 pl-2">
            <a href={BACKEND_URL} className={navLinkClass({ isActive: false })}>
              Dashboard ↗
            </a>
          </li>
          {/* Prijavljeni korisnik i odjava. */}
          <li className="ml-2 flex items-center gap-2 border-l border-blue-500 pl-4">
            <span className="text-sm text-blue-100" data-current-user>
              {user?.full_name}
            </span>
            <button type="button" onClick={logout} className={navLinkClass({ isActive: false })}>
              Odjavi se
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
