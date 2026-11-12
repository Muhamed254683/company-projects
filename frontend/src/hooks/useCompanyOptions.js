import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'

// Sve kompanije kao opcije za <Select>: [{ value: 1, label: 'Firma A' }, ...].
// companies: cele kompanije (npr. za spisak gradova u filteru).
// API vraca najvise 100 po strani; za ovu aplikaciju je to dovoljno (vidi README, "Poznata ogranicenja").
export function useCompanyOptions() {
  const [companies, setCompanies] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    apiRequest('/companies?per_page=100')
      .then((response) => {
        if (!ignore) setCompanies(response.data)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })

    return () => {
      ignore = true
    }
  }, [])

  const options = companies.map((company) => ({ value: company.id, label: company.name }))

  return { options, companies, error }
}
