import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../../api/client.js'
import ProjectStatusBadge from '../../components/ProjectStatusBadge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Table from '../../components/ui/Table.jsx'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { formatDate, formatMoney } from '../../utils/format.js'

function ProjectListPage() {
  const location = useLocation()
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/projects')

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

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        <div className={loading ? 'opacity-50' : ''}>
          <Table columns={columns} rows={rows} emptyMessage="Još nema projekata." />
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
