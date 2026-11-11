// Svi pozivi API-ja idu preko ove funkcije, pa je adresa API-ja na jednom mestu (.env).
const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL nije podesen. Napravi frontend/.env po uzoru na .env.example.')
}

// Greska koju bacamo kada API vrati status 4xx/5xx.
// status: HTTP status (npr. 404, 422), data: telo odgovora (npr. { message, errors }).
export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `API greska (HTTP ${status})`)
    this.status = status
    this.data = data
  }
}

// Primer: apiRequest('/companies?page=2') ili apiRequest('/companies', { method: 'POST', body: {...} })
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const options = { method, headers }

  if (body instanceof FormData) {
    // Fajlovi: browser sam postavlja Content-Type sa "boundary" delom, zato ga ne diramo.
    options.body = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${path}`, options)

  // 204 No Content (npr. posle brisanja) nema telo.
  const data = response.status === 204 ? null : await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data
}

// Iz greske 422 (validacija) vraca objekat { polje: ['poruka', ...] }; za sve ostale greske prazan objekat.
// Primer: const errors = getValidationErrors(err); errors.name?.[0] -> "The name field is required."
export function getValidationErrors(error) {
  if (error instanceof ApiError && error.status === 422) {
    return error.data?.errors ?? {}
  }

  return {}
}
