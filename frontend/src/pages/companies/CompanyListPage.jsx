import { useState } from 'react'
import { apiRequest } from '../../api/client.js'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import SearchInput from '../../components/ui/SearchInput.jsx'
import Select from '../../components/ui/Select.jsx'
import Table from '../../components/ui/Table.jsx'
import { useToast } from '../../components/toast/toastContext.js'
import { useCompanyOptions } from '../../hooks/useCompanyOptions.js'
import { useListFilters } from '../../hooks/useListFilters.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'

const FILTER_KEYS = ['search', 'city']

function CompanyListPage() {
  const toast = useToast()
  const { filters, has_filters, setFilter, resetFilters } = useListFilters(FILTER_KEYS)
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/companies', { filter_keys: FILTER_KEYS })

  // Gradovi za filter: svi razliciti gradovi postojecih kompanija, po abecedi.
  const { companies } = useCompanyOptions()
  const city_options = [...new Set(companies.map((company) => company.city).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'sr'))
    .map((city) => ({ value: city, label: city }))


  // Kompanija za koju je otvorena potvrda brisanja (null = potvrda zatvorena).
  const [company_to_delete, setCompanyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openDeleteDialog(company) {
    setCompanyToDelete(company)
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      await apiRequest(`/companies/${company_to_delete.id}`, { method: 'DELETE' })
      toast.success(`Kompanija "${company_to_delete.name}" je obrisana.`)
      setCompanyToDelete(null)
      reload()
    } catch (err) {
      // Neocekivana greska (npr. server ne radi): crvena notifikacija, potvrda se zatvara.
      toast.error(`Brisanje nije uspelo: ${err.message}`)
      setCompanyToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Naziv', className: 'font-medium' },
    { key: 'tax_number', header: 'PIB' },
    { key: 'city', header: 'Grad', render: (company) => company.city ?? '–' },
    { key: 'email', header: 'Email', render: (company) => company.email ?? '–' },
    { key: 'users_count', header: 'Korisnici', className: 'text-center' },
    { key: 'projects_count', header: 'Projekti', className: 'text-center' },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (company) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" to={`/companies/${company.id}/edit`}>
            Izmeni
          </Button>
          <Button size="sm" variant="danger" onClick={() => openDeleteDialog(company)}>
            Obriši
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Kompanije" actions={<Button to="/companies/new">+ Dodaj kompaniju</Button>} />

      <FilterBar has_filters={has_filters} onReset={resetFilters}>
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value, { replace: true })}
          placeholder="Naziv, PIB, grad ili email"
        />
        <Select
          label="Grad"
          name="city"
          placeholder="Svi gradovi"
          options={city_options}
          value={filters.city}
          onChange={(event) => setFilter('city', event.target.value)}
        />
      </FilterBar>

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        // Dok se ucitava druga strana, stara tabela ostaje vidljiva, samo bleda.
        <div className={loading ? 'opacity-50' : ''}>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage={has_filters ? 'Nema rezultata za zadate filtere.' : 'Još nema kompanija.'}
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={company_to_delete !== null}
        loading={deleting}
        onCancel={() => setCompanyToDelete(null)}
        onConfirm={handleDelete}
        message={
          company_to_delete && (
            <div className="space-y-2">
              <p>
                Da li sigurno želiš da obrišeš kompaniju <strong>{company_to_delete.name}</strong>?
              </p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Biće obrisani i njeni projekti ({company_to_delete.projects_count}), zajedno sa slikama.</li>
                <li>Korisnici ({company_to_delete.users_count}) ostaju, ali bez kompanije.</li>
              </ul>
            </div>
          )
        }
      />
    </div>
  )
}

export default CompanyListPage
