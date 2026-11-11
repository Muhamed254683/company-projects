import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'

// React Router za /companies/new i /companies/5/edit koristi ISTU komponentu, pa bi React zadrzao
// njeno stanje (popunjena polja, "ne postoji"...) kada se adresa promeni unutar aplikacije.
// Kljuc (key) jednak adresi znaci: nova adresa -> nova komponenta sa praznim stanjem.
function ResetOnUrlChange({ children }) {
  const { pathname } = useLocation()

  return <Fragment key={pathname}>{children}</Fragment>
}

export default ResetOnUrlChange
