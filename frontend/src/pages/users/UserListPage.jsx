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

const FILTER_KEYS = ['search', 'company_id']

function UserListPage() {
  const toast = useToast()
  const { filters, has_filters, setFilter, resetFilters } = useListFilters(FILTER_KEYS)
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/users', { filter_keys: FILTER_KEYS })

  // "none" = korisnici bez kompanije (API: /users?company_id=none).
  const { options: company_options } = useCompanyOptions()
  const company_filter_options = [{ value: 'none', label: '— bez kompanije (frilenseri) —' }, ...company_options]

  const [user_to_delete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openDeleteDialog(user) {
    setUserToDelete(user)
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      await apiRequest(`/users/${user_to_delete.id}`, { method: 'DELETE' })
      toast.success(`Korisnik "${user_to_delete.full_name}" je obrisan.`)
      setUserToDelete(null)
      reload()
    } catch (err) {
      // Neocekivana greska (npr. server ne radi): crvena notifikacija, potvrda se zatvara.
      toast.error(`Brisanje nije uspelo: ${err.message}`)
      setUserToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'full_name', header: 'Ime i prezime', className: 'font-medium' },
    { key: 'email', header: 'Email' },
    {
      key: 'company',
      header: 'Kompanija',
      render: (user) =>
        user.company ? (
          user.company.name
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">bez kompanije</span>
        ),
    },
    { key: 'job_title', header: 'Pozicija', render: (user) => user.job_title ?? '–' },
    { key: 'projects_count', header: 'Projekti', className: 'text-center' },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" to={`/users/${user.id}/edit`}>
            Izmeni
          </Button>
          <Button size="sm" variant="danger" onClick={() => openDeleteDialog(user)}>
            Obriši
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Korisnici" actions={<Button to="/users/new">+ Dodaj korisnika</Button>} />

      <FilterBar has_filters={has_filters} onReset={resetFilters}>
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value, { replace: true })}
          placeholder="Ime, prezime, email ili pozicija"
        />
        <Select
          label="Kompanija"
          name="company_id"
          placeholder="Sve kompanije"
          options={company_filter_options}
          value={filters.company_id}
          onChange={(event) => setFilter('company_id', event.target.value)}
        />
      </FilterBar>

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        <div className={loading ? 'opacity-50' : ''}>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage={has_filters ? 'Nema rezultata za zadate filtere.' : 'Još nema korisnika.'}
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={user_to_delete !== null}
        loading={deleting}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        message={
          user_to_delete && (
            <div className="space-y-2">
              <p>
                Da li sigurno želiš da obrišeš korisnika <strong>{user_to_delete.full_name}</strong>?
              </p>
              <p className="text-gray-600">
                Biće uklonjen sa projekata na kojima je član ({user_to_delete.projects_count}).
              </p>
            </div>
          )
        }
      />
    </div>
  )
}

export default UserListPage
