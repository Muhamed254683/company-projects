import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Filteri liste cuvaju se u URL-u (?search=crm&status=active), kao i broj strane:
// rade dugme "Nazad", osvezavanje stranice i slanje linka nekome.
// keys: imena filtera koje lista koristi, npr. ['search', 'status'].
export function useListFilters(keys) {
  const [search_params, setSearchParams] = useSearchParams()

  const filters = Object.fromEntries(keys.map((key) => [key, search_params.get(key) ?? '']))
  const has_filters = keys.some((key) => filters[key] !== '')

  // Promena filtera vraca na stranu 1 (brise "page"): strana 3 posle filtriranja mozda vise ne postoji.
  // replace: true za pretragu, da svako otkucano slovo ne pravi novi korak u istoriji browsera.
  const setFilter = useCallback(
    (key, value, { replace = false } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value) next.set(key, value)
          else next.delete(key)
          next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  // Brise samo SVOJE filtere (i stranu); ostali parametri (npr. ?trashed=only za korpu) ostaju.
  const resetFilters = useCallback(
    () =>
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        for (const key of keys) next.delete(key)
        next.delete('page')
        return next
      }),
    [setSearchParams, keys],
  )

  return { filters, has_filters, setFilter, resetFilters, search_params }
}
