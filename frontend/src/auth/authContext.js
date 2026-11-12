import { createContext, useContext } from 'react'

// Ko je prijavljen, i funkcije za prijavu/odjavu. Vrednost postavlja <AuthProvider> (main.jsx).
// status: 'loading' (proveravamo token), 'guest' (nije prijavljen), 'authenticated' (prijavljen)
export const AuthContext = createContext(null)

// Upotreba: const { user, status, login, logout } = useAuth()
export function useAuth() {
  const auth = useContext(AuthContext)

  if (!auth) {
    throw new Error('useAuth() radi samo unutar <AuthProvider>.')
  }

  return auth
}
