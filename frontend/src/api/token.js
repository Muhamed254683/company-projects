// Token za prijavu (Sanctum) cuva se u localStorage, pa prijava ostaje i posle osvezavanja stranice.
// localStorage moze da baci gresku (npr. privatni prozor sa blokiranim skladistem), pa je sve u try/catch.
const KEY = 'auth_token'

export function getToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // Bez skladista prijava radi samo dok je stranica otvorena.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nista
  }
}
