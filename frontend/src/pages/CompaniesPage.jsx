import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'

function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // useEffect sa praznim [] se pokrece jednom, kada se stranica prvi put prikaze.
  useEffect(() => {
    apiRequest('/companies?per_page=5')
      .then((response) => setCompanies(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
      <p className="mt-2 text-gray-600">Provera veze sa API-jem (prave tabele dolaze u Fazi 6):</p>

      {loading && <p className="mt-4 text-gray-500">Ucitavanje...</p>}

      {error && <p className="mt-4 rounded bg-red-100 p-3 text-red-700">Greska: {error}</p>}

      {!loading && !error && (
        <ul className="mt-4 list-disc pl-6 text-gray-800">
          {companies.map((company) => (
            <li key={company.id}>
              {company.name} <span className="text-gray-500">({company.city})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CompaniesPage
