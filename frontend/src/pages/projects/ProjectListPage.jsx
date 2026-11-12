import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../../api/client.js'
import ProjectStatusBadge from '../../components/ProjectStatusBadge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import SearchInput from '../../components/ui/SearchInput.jsx'
import Select from '../../components/ui/Select.jsx'
import Table from '../../components/ui/Table.jsx'
import { PROJECT_STATUSES } from '../../constants/projectStatus.js'
import { useCompanyOptions } from '../../hooks/useCompanyOptions.js'
import { useListFilters } from '../../hooks/useListFilters.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { formatDate, formatMoney } from '../../utils/format.js'

const FILTER_KEYS = ['search', 'company_id', 'status']
const STATUS_OPTIONS = PROJECT_STATUSES.map(({ value, label }) => ({ value, label }))

function ProjectListPage() {
  const location = useLocation()
  const { filters, has_filters, setFilter, resetFilters } = useListFilters(FILTER_KEYS)
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/projects', { filter_keys: FILTER_KEYS })
  const { options: company_options } = useCompanyOptions()

  const [message, setMessage] = useState(location.state?.message ?? null)
  const [project_to_delete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [delete_error, setDeleteError] = useState(null)

  function openDeleteDialog(project) {
    setDeleteError(null)
    setProjectToDelete(project)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    try {
      await apiRequest(`/projects/${project_to_delete.id}`, { method: 'DELETE' })
      setMessage(`Projekat "${project_to_delete.name}" je obrisan.`)
      setProjectToDelete(null)
      reload()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Naziv',
      className: 'font-medium',
      render: (project) => (
        <Link to={`/projects/${project.id}`} className="text-blue-700 hover:underline">
          {project.name}
        </Link>
      ),
    },
    { key: 'company', header: 'Kompanija', render: (project) => project.company?.name ?? '–' },
    { key: 'status', header: 'Status', render: (project) => <ProjectStatusBadge status={project.status} /> },
    {
      key: 'period',
      header: 'Period',
      className: 'whitespace-nowrap',
      render: (project) => `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`,
    },
    { key: 'budget', header: 'Budžet', className: 'text-right whitespace-nowrap', render: (project) => formatMoney(project.budget) },
    { key: 'members_count', header: 'Članovi', className: 'text-center' },
    { key: 'images_count', header: 'Slike', className: 'text-center' },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (project) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" to={`/projects/${project.id}/edit`}>
            Izmeni
          </Button>
          <Button size="sm" variant="danger" onClick={() => openDeleteDialog(project)}>
            Obriši
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Projekti" actions={<Button to="/projects/new">+ Dodaj projekat</Button>} />

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      <FilterBar has_filters={has_filters} onReset={resetFilters}>
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value, { replace: true })}
          placeholder="Naziv ili opis"
        />
        <Select
          label="Kompanija"
          name="company_id"
          placeholder="Sve kompanije"
          options={company_options}
          value={filters.company_id}
          onChange={(event) => setFilter('company_id', event.target.value)}
        />
        <Select
          label="Status"
          name="status"
          placeholder="Svi statusi"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(event) => setFilter('status', event.target.value)}
        />
      </FilterBar>

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        <div className={loading ? 'opacity-50' : ''}>
          <Table
            columns={columns}
            rows={rows}
            emptyMessage={has_filters ? 'Nema rezultata za zadate filtere.' : 'Još nema projekata.'}
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={project_to_delete !== null}
        loading={deleting}
        error={delete_error}
        onCancel={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        message={
          project_to_delete && (
            <div className="space-y-2">
              <p>
                Da li sigurno želiš da obrišeš projekat <strong>{project_to_delete.name}</strong>?
              </p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Biće obrisane i njegove slike ({project_to_delete.images_count}), i sa diska.</li>
                <li>Članovi ({project_to_delete.members_count}) se uklanjaju sa projekta, ali korisnici ostaju.</li>
              </ul>
            </div>
          )
        }
      />
    </div>
  )
}

export default ProjectListPage
