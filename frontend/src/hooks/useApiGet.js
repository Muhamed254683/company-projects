import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'

// Ucitava jedan resurs sa API-ja, npr. useApiGet('/projects/5').
// reload() ga ponovo ucita (npr. posle dodavanja clana ili slike).
export function useApiGet(path) {
  const [reload_key, setReloadKey] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null, status: null })

  const request_key = `${path}#${reload_key}`
  // Prvo ucitavanje: jos nemamo nikakve podatke za ovaj path.
  const loading = result.key !== request_key && result.data === null

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let ignore = false

    apiRequest(path)
      .then((response) => {
        if (!ignore) setResult({ key: request_key, data: response.data, error: null, status: 200 })
      })
      .catch((err) => {
        if (!ignore) setResult({ key: request_key, data: null, error: err.message, status: err.status ?? null })
      })

    return () => {
      ignore = true
    }
  }, [path, request_key])

  return { data: result.data, loading, error: result.error, not_found: result.status === 404, reload }
}
