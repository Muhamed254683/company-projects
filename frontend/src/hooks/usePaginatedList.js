import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiRequest } from '../api/client.js'

// Ucitava jednu stranu liste sa API-ja, npr. usePaginatedList('/companies', { filter_keys: ['search', 'city'] }).
// Broj strane i filteri su u URL-u (?page=2&search=crm), pa rade dugme "Nazad", osvezavanje i deljenje linka.
export function usePaginatedList(path, { per_page = 10, filter_keys = [] } = {}) {
  const [search_params, setSearchParams] = useSearchParams()
  const page = Math.max(Number(search_params.get('page')) || 1, 1)

  // Kada se promeni reload_key, lista se ponovo ucita (npr. posle brisanja).
  const [reload_key, setReloadKey] = useState(0)

  // Poslednji stigao odgovor i "kljuc" zahteva za koji je stigao.
  const [result, setResult] = useState({ key: null, rows: [], meta: null, error: null })

  // Filteri iz URL-a idu i API-ju (samo oni koji su popunjeni).
  const query = new URLSearchParams()
  for (const key of filter_keys) {
    const value = search_params.get(key)
    if (value) query.set(key, value)
  }
  query.set('page', String(page))
  query.set('per_page', String(per_page))

  const url = `${path}?${query}`
  const request_key = `${url}#${reload_key}`

  // Ucitava se sve dok odgovor ne stigne za TRENUTNI zahtev; ne cuvamo poseban "loading" state.
  const loading = result.key !== request_key

  // Menja samo "page", a filtere u URL-u ostavlja.
  const setPage = useCallback(
    (new_page) =>
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        next.set('page', String(new_page))
        return next
      }),
    [setSearchParams],
  )
  const reload = useCallback(() => setReloadKey((key) => key + 1), [setReloadKey])

  useEffect(() => {
    // "ignore" sprecava da spor, zastareo odgovor (npr. za stranu 1) pregazi noviji (za stranu 2).
    let ignore = false

    apiRequest(url)
      .then((response) => {
        if (ignore) return

        // Strana je ostala prazna (npr. obrisan poslednji red na poslednjoj strani): predji na poslednju postojecu.
        if (response.data.length === 0 && page > response.meta.last_page) {
          setPage(response.meta.last_page)
          return
        }

        setResult({ key: request_key, rows: response.data, meta: response.meta, error: null })
      })
      .catch((err) => {
        if (!ignore) setResult((current) => ({ ...current, key: request_key, error: err.message }))
      })

    return () => {
      ignore = true
    }
  }, [url, page, request_key, setPage])

  return { rows: result.rows, meta: result.meta, loading, error: result.error, page, setPage, reload }
}
