import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, UNAUTHORIZED_EVENT } from '../api/client.js'
import { clearToken, getToken, setToken } from '../api/token.js'
import { useToast } from '../components/toast/toastContext.js'
import { AuthContext } from './authContext.js'

function AuthProvider({ children }) {
  const toast = useToast()
  const [user, setUser] = useState(null)
  // Ako token postoji (od ranije), prvo ga proveravamo preko /api/me; do tada "loading".
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'guest'))

  // Trenutni status za event listener (da ne bismo pravili novi listener pri svakoj promeni).
  const status_ref = useRef(status)
  useEffect(() => {
    status_ref.current = status
  }, [status])

  // Pri otvaranju aplikacije: da li sacuvani token jos vazi?
  useEffect(() => {
    if (!getToken()) return

    let ignore = false

    apiRequest('/me')
      .then((response) => {
        if (ignore) return
        setUser(response.data)
        setStatus('authenticated')
      })
      .catch(() => {
        if (ignore) return
        clearToken()
        setStatus('guest')
      })

    return () => {
      ignore = true
    }
  }, [])

  // API je vratio 401 usred rada (token istekao/obrisan): vracamo korisnika na prijavu.
  useEffect(() => {
    function handleUnauthorized() {
      // Poruka samo jednom, i samo ako je korisnik bio prijavljen (vise istovremenih zahteva moze da dobije 401).
      if (status_ref.current === 'authenticated') {
        toast.error('Prijava je istekla. Prijavi se ponovo.')
      }
      status_ref.current = 'guest'
      setUser(null)
      setStatus('guest')
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [toast])

  const login = useCallback(async (email, password) => {
    // Baca ApiError (422 pogresni podaci, 429 previse pokusaja); LoginPage prikazuje poruku.
    const response = await apiRequest('/login', { method: 'POST', body: { email, password } })
    setToken(response.token)
    setUser(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      // Brise token i na serveru (ne samo u browseru).
      await apiRequest('/logout', { method: 'POST' })
    } catch {
      // Ako server ne odgovara, odjavljujemo se bar lokalno.
    }
    clearToken()
    status_ref.current = 'guest'
    setUser(null)
    setStatus('guest')
    toast.success('Odjavljen si.')
  }, [toast])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
