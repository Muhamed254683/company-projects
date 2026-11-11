import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'

// Sve kompanije kao opcije za <Select>: [{ value: 1, label: 'Firma A' }, ...].
// API vraca najvise 100 po strani; za ovu aplikaciju je to dovoljno.
export function useCompanyOptions() {
  const [options, setOptions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    apiRequest('/companies?per_page=100')
      .then((response) => {
        if (!ignore) setOptions(response.data.map((company) => ({ value: company.id, label: company.name })))
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })

    return () => {
      ignore = true
    }
  }, [])

  return { options, error }
}
