import { useEffect, useState } from 'react'
import { apiRequest, getValidationErrors } from '../../api/client.js'
import { PROJECT_ROLES, projectRoleLabel } from '../../constants/projectRoles.js'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Select from '../ui/Select.jsx'
import Table from '../ui/Table.jsx'

// Clan je "spoljni" kada nije iz kompanije kojoj projekat pripada (druga firma ili frilenser).
function isExternal(member, project) {
  return member.company_id !== project.company_id
}

function ExternalBadge({ member }) {
  const label = member.company_id === null ? 'Frilenser' : 'Druga firma'

  return <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{label}</span>
}

// Clanovi projekta: tabela, dodavanje i uklanjanje.
// onChanged: poziva se posle svake izmene, da roditelj ponovo ucita projekat.
function ProjectMembers({ project, onChanged }) {
  const [all_users, setAllUsers] = useState([])
  const [new_member, setNewMember] = useState({ user_id: '', role: '' })
  const [errors, setErrors] = useState({})
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState(null)
  const [general_error, setGeneralError] = useState(null)

  const [member_to_remove, setMemberToRemove] = useState(null)
  const [removing, setRemoving] = useState(false)
  const [remove_error, setRemoveError] = useState(null)

  // Svi korisnici, za padajucu listu (API vraca najvise 100 po strani).
  useEffect(() => {
    let ignore = false

    apiRequest('/users?per_page=100')
      .then((response) => {
        if (!ignore) setAllUsers(response.data)
      })
      .catch((err) => {
        if (!ignore) setGeneralError(`Korisnici nisu učitani: ${err.message}`)
      })

    return () => {
      ignore = true
    }
  }, [])

  // U padajucoj listi su samo korisnici koji JOS NISU clanovi.
  const member_ids = new Set(project.members.map((member) => member.id))
  const user_options = all_users
    .filter((user) => !member_ids.has(user.id))
    .map((user) => ({
      value: user.id,
      label: `${user.full_name} (${user.company?.name ?? 'bez kompanije'})`,
    }))

  function handleChange(event) {
    const { name, value } = event.target
    setNewMember((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleAdd(event) {
    event.preventDefault()

    setAdding(true)
    setErrors({})
    setGeneralError(null)
    setMessage(null)

    try {
      const response = await apiRequest(`/projects/${project.id}/members`, {
        method: 'POST',
        body: {
          user_id: new_member.user_id === '' ? null : Number(new_member.user_id),
          role: new_member.role === '' ? null : new_member.role,
        },
      })

      setMessage(`${response.data.full_name} je dodat kao ${projectRoleLabel(response.data.role).toLowerCase()}.`)
      setNewMember({ user_id: '', role: '' })
      onChanged()
    } catch (err) {
      const validation_errors = getValidationErrors(err)

      if (Object.keys(validation_errors).length > 0) setErrors(validation_errors)
      else setGeneralError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setRemoveError(null)

    try {
      await apiRequest(`/projects/${project.id}/members/${member_to_remove.id}`, { method: 'DELETE' })
      setMessage(`${member_to_remove.full_name} je uklonjen sa projekta.`)
      setMemberToRemove(null)
      onChanged()
    } catch (err) {
      setRemoveError(err.message)
    } finally {
      setRemoving(false)
    }
  }

  const columns = [
    {
      key: 'full_name',
      header: 'Ime i prezime',
      className: 'font-medium',
      render: (member) => (
        <>
          {member.full_name}
          {isExternal(member, project) && <ExternalBadge member={member} />}
        </>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'company', header: 'Kompanija', render: (member) => member.company?.name ?? '–' },
    { key: 'role', header: 'Uloga', render: (member) => projectRoleLabel(member.role) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (member) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setRemoveError(null)
            setMemberToRemove(member)
          }}
        >
          Ukloni
        </Button>
      ),
    },
  ]

  // Spoljni clanovi dobijaju zutu pozadinu reda.
  const rows = project.members.map((member) => ({ ...member, external: isExternal(member, project) }))

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Članovi ({project.members.length})</h2>
        <p className="text-sm text-gray-600">
          <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-amber-300 bg-amber-50 align-middle" />
          žuto = član iz druge firme ili frilenser
        </p>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {general_error && <Alert>{general_error}</Alert>}

      <Table columns={columns} rows={rows} rowClassName={(row) => (row.external ? 'bg-amber-50 hover:bg-amber-100' : '')} emptyMessage="Projekat još nema članova." />

      <form noValidate onSubmit={handleAdd} className="grid gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-[1fr_200px_auto] md:items-start">
        <Select
          label="Novi član"
          name="user_id"
          placeholder="— izaberi korisnika —"
          options={user_options}
          value={new_member.user_id}
          onChange={handleChange}
          error={errors.user_id}
        />
        <Select
          label="Uloga"
          name="role"
          placeholder="— uloga —"
          options={PROJECT_ROLES}
          value={new_member.role}
          onChange={handleChange}
          error={errors.role}
        />
        {/* Prazna labela poravnava dugme sa poljima. */}
        <div>
          <span className="mb-1 hidden text-sm md:block">&nbsp;</span>
          <Button type="submit" disabled={adding} className="w-full">
            {adding ? 'Dodavanje...' : 'Dodaj člana'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={member_to_remove !== null}
        title="Uklanjanje člana"
        confirmLabel="Ukloni"
        loading={removing}
        error={remove_error}
        onCancel={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        message={
          member_to_remove && (
            <p>
              Ukloniti <strong>{member_to_remove.full_name}</strong> sa projekta <strong>{project.name}</strong>? Korisnik ostaje u
              sistemu.
            </p>
          )
        }
      />
    </section>
  )
}

export default ProjectMembers
