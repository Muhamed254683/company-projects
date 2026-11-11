import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest, getValidationErrors } from '../../api/client.js'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Select from '../../components/ui/Select.jsx'
import { useCompanyOptions } from '../../hooks/useCompanyOptions.js'

const EMPTY_USER = {
  company_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  job_title: '',
  password: '',
}

// Iz API odgovora uzimamo samo polja forme. Lozinku API nikad ne vraca, pa je pri izmeni prazna.
function toFormValues(user) {
  return {
    company_id: user.company_id === null ? '' : String(user.company_id),
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    job_title: user.job_title ?? '',
    password: '',
  }
}

// Vrednosti forme -> telo zahteva za API.
function toRequestBody(values, is_edit) {
  const body = {
    ...values,
    // <select> uvek daje tekst: '' znaci "bez kompanije" (null), inace broj.
    company_id: values.company_id === '' ? null : Number(values.company_id),
  }

  // Pri izmeni prazna lozinka znaci "ne menjaj je", pa je uopste ne saljemo.
  if (is_edit && values.password === '') {
    delete body.password
  }

  return body
}

// ISTA stranica za dodavanje (/users/new) i izmenu (/users/:id/edit).
function UserFormPage() {
  const { id } = useParams()
  const is_edit = id !== undefined
  const navigate = useNavigate()
  const { options: company_options, error: companies_error } = useCompanyOptions()

  const [values, setValues] = useState(EMPTY_USER)
  const [errors, setErrors] = useState({})
  const [general_error, setGeneralError] = useState(null)
  const [loading, setLoading] = useState(is_edit)
  const [not_found, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!is_edit) return

    let ignore = false

    apiRequest(`/users/${id}`)
      .then((response) => {
        if (!ignore) setValues(toFormValues(response.data))
      })
      .catch((err) => {
        if (ignore) return
        if (err.status === 404) setNotFound(true)
        else setGeneralError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id, is_edit])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setErrors({})
    setGeneralError(null)

    try {
      const response = await apiRequest(is_edit ? `/users/${id}` : '/users', {
        method: is_edit ? 'PUT' : 'POST',
        body: toRequestBody(values, is_edit),
      })

      const full_name = response.data.full_name
      navigate('/users', {
        state: { message: is_edit ? `Korisnik "${full_name}" je izmenjen.` : `Korisnik "${full_name}" je dodat.` },
      })
    } catch (err) {
      const validation_errors = getValidationErrors(err)

      if (Object.keys(validation_errors).length > 0) {
        setErrors(validation_errors)
        setGeneralError('Proveri označena polja.')
      } else {
        setGeneralError(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const title = is_edit ? 'Izmena korisnika' : 'Novi korisnik'

  if (not_found) {
    return (
      <div>
        <PageHeader title={title} />
        <Alert>Korisnik ne postoji.</Alert>
        <Button variant="secondary" to="/users" className="mt-4">
          Nazad na listu
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={title} />

      {loading ? (
        <p className="text-gray-500">Učitavanje...</p>
      ) : (
        // noValidate: sve provere radi Laravel, a poruke prikazujemo ispod polja.
        <form noValidate onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-lg bg-white p-6 shadow-sm">
          {general_error && <Alert>{general_error}</Alert>}
          {companies_error && <Alert>Kompanije nisu učitane: {companies_error}</Alert>}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Ime"
              name="first_name"
              required
              value={values.first_name}
              onChange={handleChange}
              error={errors.first_name}
            />
            <Input
              label="Prezime"
              name="last_name"
              required
              value={values.last_name}
              onChange={handleChange}
              error={errors.last_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input label="Telefon" name="phone" value={values.phone} onChange={handleChange} error={errors.phone} />
            <Select
              label="Kompanija"
              name="company_id"
              placeholder="— bez kompanije (frilenser) —"
              options={company_options}
              value={values.company_id}
              onChange={handleChange}
              error={errors.company_id}
            />
            <Input
              label="Pozicija"
              name="job_title"
              hint="npr. Backend developer"
              value={values.job_title}
              onChange={handleChange}
              error={errors.job_title}
            />
            <Input
              label="Lozinka"
              name="password"
              type="password"
              autoComplete="new-password"
              required={!is_edit}
              hint={is_edit ? 'Ostavi prazno da zadržiš postojeću lozinku.' : 'Najmanje 8 znakova.'}
              value={values.password}
              onChange={handleChange}
              error={errors.password}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <Button variant="secondary" to="/users">
              Otkaži
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UserFormPage
