import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../../api/client.js'
import ProjectStatusBadge from '../../components/ProjectStatusBadge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import SearchInput from '../../components/ui/SearchInput.jsx'
import Select from '../../components/ui/Select.jsx'
import Table from '../../components/ui/Table.jsx'
import { PROJECT_STATUSES } from '../../constants/projectStatus.js'
import { useCompanyOptions } from '../../hooks/useCompanyOptions.js'
import { useListFilters } from '../../hooks/useListFilters.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format.js'

const FILTER_KEYS = ['search', 'company_id', 'status']
const STATUS_OPTIONS = PROJECT_STATUSES.map(({ value, label }) => ({ value, label }))

// Prekidac "Aktivni | Korpa" (u URL-u: ?trashed=only).
function ViewTabs({ in_trash, onChange }) {
  const tab = (active) =>
    `rounded-md px-4 py-1.5 text-sm font-medium ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <div className="mb-4 inline-flex rounded-lg bg-gray-200 p-1" role="tablist">
      <button type="button" role="tab" aria-selected={!in_trash} className={tab(!in_trash)} onClick={() => onChange(false)}>
        Aktivni
      </button>
      <button type="button" role="tab" aria-selected={in_trash} className={tab(in_trash)} onClick={() => onChange(true)}>
        Korpa
      </button>
    </div>
  )
}

function ProjectListPage() {
  const location = useLocation()
  const { filters, has_filters, setFilter, resetFilters, search_params } = useListFilters(FILTER_KEYS)
  // "trashed" ide API-ju, ali nije "filter": "Ponisti filtere" ne izbacuje iz korpe.
  const { rows, meta, loading, error, setPage, reload } = usePaginatedList('/projects', {
    filter_keys: [...FILTER_KEYS, 'trashed'],
  })
  const { options: company_options } = useCompanyOptions()
  const in_trash = search_params.get('trashed') === 'only'

  const [message, setMessage] = useState(location.state?.message ?? null)
  const [action_error, setActionError] = useState(null)

  // Otvorena potvrda: { type: 'trash' | 'force', project } ili null.
  const [dialog, setDialog] = useState(null)
  const [working, setWorking] = useState(false)
  const [dialog_error, setDialogError] = useState(null)

  function openDialog(type, project) {
    setDialogError(null)
    setDialog({ type, project })
  }

  // "U korpu" ili "Obrisi trajno" (zavisi od otvorene potvrde).
  async function handleConfirm() {
    const { type, project } = dialog
    setWorking(true)
    setDialogError(null)

    try {
      if (type === 'trash') {
        await apiRequest(`/projects/${project.id}`, { method: 'DELETE' })
        setMessage(`Projekat "${project.name}" je premešten u korpu.`)
      } else {
        await apiRequest(`/projects/${project.id}/force`, { method: 'DELETE' })
        setMessage(`Projekat "${project.name}" je trajno obrisan.`)
      }
      setDialog(null)
      reload()
    } catch (err) {
      setDialogError(err.message)
    } finally {
      setWorking(false)
    }
  }

  // Vracanje iz korpe ne unistava nista, pa ne trazi potvrdu.
  async function handleRestore(project) {
    setActionError(null)

    try {
      await apiRequest(`/projects/${project.id}/restore`, { method: 'POST' })
      setMessage(`Projekat "${project.name}" je vraćen iz korpe.`)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const name_column = {
    key: 'name',
    header: 'Naziv',
    className: 'font-medium',
    // Projekat iz korpe nema stranicu detalja, pa naziv nije link.
    render: (project) =>
      in_trash ? (
        project.name
      ) : (
        <Link to={`/projects/${project.id}`} className="text-blue-700 hover:underline">
          {project.name}
        </Link>
      ),
  }

  const columns = [
    name_column,
    { key: 'company', header: 'Kompanija', render: (project) => project.company?.name ?? '–' },
    { key: 'status', header: 'Status', render: (project) => <ProjectStatusBadge status={project.status} /> },
    in_trash
      ? { key: 'deleted_at', header: 'Obrisan', className: 'whitespace-nowrap', render: (project) => formatDateTime(project.deleted_at) }
      : {
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
      render: (project) =>
        in_trash ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleRestore(project)}>
              Vrati
            </Button>
            <Button size="sm" variant="danger" onClick={() => openDialog('force', project)}>
              Obriši trajno
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" to={`/projects/${project.id}/edit`}>
              Izmeni
            </Button>
            <Button size="sm" variant="danger" onClick={() => openDialog('trash', project)}>
              Obriši
            </Button>
          </div>
        ),
    },
  ]

  const empty_message = has_filters ? 'Nema rezultata za zadate filtere.' : in_trash ? 'Korpa je prazna.' : 'Još nema projekata.'

  // Odmah posle prelaska "Aktivni" <-> "Korpa" stigli su jos stari redovi (iz drugog prikaza).
  // Ne prikazujemo ih, da se npr. "Obrisi trajno" nikad ne pojavi uz aktivan projekat.
  const view_rows = rows.filter((project) => Boolean(project.deleted_at) === in_trash)
  const switching_view = loading && view_rows.length !== rows.length

  return (
    <div>
      <PageHeader title="Projekti" actions={<Button to="/projects/new">+ Dodaj projekat</Button>} />

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}
      {action_error && (
        <div className="mb-4">
          <Alert>{action_error}</Alert>
        </div>
      )}

      <ViewTabs in_trash={in_trash} onChange={(trash) => setFilter('trashed', trash ? 'only' : '')} />

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

      {!error && ((loading && !meta) || switching_view) && <p className="text-gray-500">Učitavanje...</p>}

      {!error && meta && !switching_view && (
        <div className={loading ? 'opacity-50' : ''}>
          <Table columns={columns} rows={view_rows} emptyMessage={empty_message} />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.type === 'force' ? 'Trajno brisanje' : 'Premeštanje u korpu'}
        confirmLabel={dialog?.type === 'force' ? 'Obriši trajno' : 'Premesti u korpu'}
        loading={working}
        error={dialog_error}
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirm}
        message={
          dialog &&
          (dialog.type === 'trash' ? (
            <div className="space-y-2">
              <p>
                Premestiti projekat <strong>{dialog.project.name}</strong> u korpu?
              </p>
              <p className="text-gray-600">
                Projekat se može vratiti iz korpe; slike ({dialog.project.images_count}) i članovi (
                {dialog.project.members_count}) ostaju sačuvani.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Trajno obrisati projekat <strong>{dialog.project.name}</strong>?
              </p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Biće obrisane i njegove slike ({dialog.project.images_count}), i sa diska.</li>
                <li>Članovi ({dialog.project.members_count}) se uklanjaju sa projekta, ali korisnici ostaju.</li>
                <li className="font-medium text-red-700">Ovo ne može da se poništi.</li>
              </ul>
            </div>
          ))
        }
      />
    </div>
  )
}

export default ProjectListPage
