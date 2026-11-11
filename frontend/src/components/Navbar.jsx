import { Link, NavLink } from 'react-router-dom'

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
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
