// Svi pozivi API-ja idu preko ove funkcije, pa je adresa API-ja na jednom mestu (.env).
const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL nije podesen. Napravi frontend/.env po uzoru na .env.example.')
}

// Adresa Laravel backenda bez "/api" (npr. za Blade stranicu /showcase/{slug}).
// http://localhost:8000/api -> http://localhost:8000
export const BACKEND_URL = API_URL.replace(/\/api\/?$/, '')

// Laravelova poruka za nepostojeci model ("No query results for model [App\Models\Company] 5")
// je tehnicka; korisniku prikazujemo razumljivu.
function readableMessage(status, data) {
  const message = data?.message ?? ''

  if (status === 404 && (message === '' || message.startsWith('No query results') || message === 'Not Found')) {
    return 'Traženi podatak ne postoji (možda je obrisan u međuvremenu).'
  }

  return message || `API greška (HTTP ${status})`
}

// Greska koju bacamo kada API vrati status 4xx/5xx (ili 0 kada server uopste ne odgovara).
// status: HTTP status (npr. 404, 422), data: telo odgovora (npr. { message, errors }).
export class ApiError extends Error {
  constructor(status, data) {
    super(readableMessage(status, data))
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

  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    // fetch baca gresku samo kada odgovora uopste nema (server ugasen, pogresan VITE_API_URL, CORS).
    throw new ApiError(0, { message: 'Server ne odgovara. Proveri da li backend radi (php artisan serve).' })
  }

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
