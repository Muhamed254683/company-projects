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

function CompanyListPage() {
  const location = useLocation()
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/companies')

  // Poruka koju je forma poslala posle cuvanja (navigate(..., { state: { message } })).
  const [message, setMessage] = useState(location.state?.message ?? null)

  // Kompanija za koju je otvorena potvrda brisanja (null = potvrda zatvorena).
  const [company_to_delete, setCompanyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [delete_error, setDeleteError] = useState(null)

  function openDeleteDialog(company) {
    setDeleteError(null)
    setCompanyToDelete(company)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    try {
      await apiRequest(`/companies/${company_to_delete.id}`, { method: 'DELETE' })
      setMessage(`Kompanija "${company_to_delete.name}" je obrisana.`)
      setCompanyToDelete(null)
      reload()
    } catch (err) {
      setDeleteError(err.message)
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

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      {error && <Alert>Greška pri učitavanju: {error}</Alert>}

      {!error && loading && !meta && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && (
        // Dok se ucitava druga strana, stara tabela ostaje vidljiva, samo bleda.
        <div className={loading ? 'opacity-50' : ''}>
          <Table columns={columns} rows={rows} emptyMessage="Još nema kompanija." />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={company_to_delete !== null}
        loading={deleting}
        error={delete_error}
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
