import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiRequest } from '../../api/client.js'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Table from '../../components/ui/Table.jsx'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'

function UserListPage() {
  const location = useLocation()
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/users')

  const [message, setMessage] = useState(location.state?.message ?? null)
  const [user_to_delete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [delete_error, setDeleteError] = useState(null)

  function openDeleteDialog(user) {
    setDeleteError(null)
    setUserToDelete(user)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    try {
      await apiRequest(`/users/${user_to_delete.id}`, { method: 'DELETE' })
      setMessage(`Korisnik "${user_to_delete.full_name}" je obrisan.`)
      setUserToDelete(null)
      reload()
    } catch (err) {
      setDeleteError(err.message)
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

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        <div className={loading ? 'opacity-50' : ''}>
          <Table columns={columns} rows={rows} emptyMessage="Još nema korisnika." />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={user_to_delete !== null}
        loading={deleting}
        error={delete_error}
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
