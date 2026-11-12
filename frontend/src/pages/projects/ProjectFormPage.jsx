import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest, getValidationErrors } from '../../api/client.js'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useToast } from '../../components/toast/toastContext.js'
import Select from '../../components/ui/Select.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import { PROJECT_STATUSES } from '../../constants/projectStatus.js'
import { useCompanyOptions } from '../../hooks/useCompanyOptions.js'

const EMPTY_PROJECT = {
  company_id: '',
  name: '',
  description: '',
  status: 'planned',
  start_date: '',
  end_date: '',
  budget: '',
}

function toFormValues(project) {
  return {
    company_id: String(project.company_id),
    name: project.name ?? '',
    description: project.description ?? '',
    status: project.status,
    start_date: project.start_date ?? '',
    end_date: project.end_date ?? '',
    budget: project.budget ?? '',
  }
}

// Vrednosti forme su uvek tekst; API ocekuje brojeve i null za prazna polja.
function toRequestBody(values) {
  return {
    ...values,
    company_id: values.company_id === '' ? null : Number(values.company_id),
    start_date: values.start_date === '' ? null : values.start_date,
    end_date: values.end_date === '' ? null : values.end_date,
    budget: values.budget === '' ? null : Number(values.budget),
  }
}

const STATUS_OPTIONS = PROJECT_STATUSES.map(({ value, label }) => ({ value, label }))

// ISTA stranica za dodavanje (/projects/new) i izmenu (/projects/:id/edit).
function ProjectFormPage() {
  const { id } = useParams()
  const is_edit = id !== undefined
  const navigate = useNavigate()
  const toast = useToast()
  const { options: company_options, error: companies_error } = useCompanyOptions()

  const [values, setValues] = useState(EMPTY_PROJECT)
  const [errors, setErrors] = useState({})
  const [general_error, setGeneralError] = useState(null)
  const [loading, setLoading] = useState(is_edit)
  const [not_found, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!is_edit) return

    let ignore = false

    apiRequest(`/projects/${id}`)
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
      await apiRequest(is_edit ? `/projects/${id}` : '/projects', {
        method: is_edit ? 'PUT' : 'POST',
        body: toRequestBody(values),
      })

      // Poruka "prezivi" prelazak na listu, jer ToastProvider je iznad svih stranica.
      toast.success(is_edit ? `Projekat "${values.name}" je izmenjen.` : `Projekat "${values.name}" je dodat.`)
      navigate('/projects')
    } catch (err) {
      const validation_errors = getValidationErrors(err)

      if (Object.keys(validation_errors).length > 0) {
        setErrors(validation_errors)
        setGeneralError('Proveri označena polja.')
      } else {
        // Neocekivana greska (npr. server ne radi): crvena notifikacija.
        toast.error(`Čuvanje nije uspelo: ${err.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const title = is_edit ? 'Izmena projekta' : 'Novi projekat'

  if (not_found) {
    return (
      <div>
        <PageHeader title={title} />
        <Alert>Projekat ne postoji.</Alert>
        <Button variant="secondary" to="/projects" className="mt-4">
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
            <div className="md:col-span-2">
              <Input label="Naziv" name="name" required value={values.name} onChange={handleChange} error={errors.name} />
            </div>
            <Select
              label="Kompanija"
              name="company_id"
              required
              placeholder="— izaberi kompaniju —"
              options={company_options}
              value={values.company_id}
              onChange={handleChange}
              error={errors.company_id}
            />
            <Select
              label="Status"
              name="status"
              required
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={handleChange}
              error={errors.status}
            />
            <Input
              label="Početak"
              name="start_date"
              type="date"
              value={values.start_date}
              onChange={handleChange}
              error={errors.start_date}
            />
            <Input
              label="Rok"
              name="end_date"
              type="date"
              hint="Ne sme biti pre početka."
              value={values.end_date}
              onChange={handleChange}
              error={errors.end_date}
            />
            <Input
              label="Budžet"
              name="budget"
              type="number"
              min="0"
              step="0.01"
              hint="Najviše 2 decimale."
              value={values.budget}
              onChange={handleChange}
              error={errors.budget}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Opis"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={errors.description}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <Button variant="secondary" to="/projects">
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

export default ProjectFormPage
