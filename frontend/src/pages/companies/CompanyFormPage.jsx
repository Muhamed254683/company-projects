import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest, getValidationErrors } from '../../api/client.js'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Textarea from '../../components/ui/Textarea.jsx'

const EMPTY_COMPANY = {
  name: '',
  tax_number: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  description: '',
}

// Iz API odgovora uzimamo samo polja forme; null pretvaramo u '' jer <input> ne prima null.
function toFormValues(company) {
  const values = {}
  for (const key of Object.keys(EMPTY_COMPANY)) {
    values[key] = company[key] ?? ''
  }
  return values
}

// ISTA stranica za dodavanje (/companies/new) i izmenu (/companies/:id/edit).
function CompanyFormPage() {
  const { id } = useParams()
  const is_edit = id !== undefined
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY_COMPANY)
  const [errors, setErrors] = useState({})
  const [general_error, setGeneralError] = useState(null)
  const [loading, setLoading] = useState(is_edit)
  const [not_found, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  // Pri izmeni ucitavamo postojecu kompaniju i popunjavamo formu.
  useEffect(() => {
    if (!is_edit) return

    let ignore = false

    apiRequest(`/companies/${id}`)
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

  // Jedna funkcija za sva polja: name atribut polja kaze koji kljuc u "values" menjamo.
  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Korisnik je ispravio polje: sklanjamo staru gresku ispod njega.
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    // Bez ovoga bi browser poslao formu "na stari nacin" i ponovo ucitao stranicu.
    event.preventDefault()

    setSaving(true)
    setErrors({})
    setGeneralError(null)

    try {
      await apiRequest(is_edit ? `/companies/${id}` : '/companies', {
        method: is_edit ? 'PUT' : 'POST',
        body: values,
      })

      navigate('/companies', {
        state: { message: is_edit ? `Kompanija "${values.name}" je izmenjena.` : `Kompanija "${values.name}" je dodata.` },
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

  const title = is_edit ? 'Izmena kompanije' : 'Nova kompanija'

  if (not_found) {
    return (
      <div>
        <PageHeader title={title} />
        <Alert>Kompanija ne postoji.</Alert>
        <Button variant="secondary" to="/companies" className="mt-4">
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
        // noValidate: browser NE proverava polja sam (npr. type="email"), nego sve proverava Laravel,
        // pa korisnik vidi nase poruke ispod polja, a ne browserove oblacice.
        <form noValidate onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-lg bg-white p-6 shadow-sm">
          {general_error && <Alert>{general_error}</Alert>}

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Naziv" name="name" required value={values.name} onChange={handleChange} error={errors.name} />
            <Input
              label="PIB"
              name="tax_number"
              required
              hint="9 cifara"
              value={values.tax_number}
              onChange={handleChange}
              error={errors.tax_number}
            />
            <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
            <Input label="Telefon" name="phone" value={values.phone} onChange={handleChange} error={errors.phone} />
            <Input
              label="Sajt"
              name="website"
              hint="npr. https://www.firma.rs"
              value={values.website}
              onChange={handleChange}
              error={errors.website}
            />
            <Input label="Grad" name="city" value={values.city} onChange={handleChange} error={errors.city} />
            <div className="md:col-span-2">
              <Input label="Adresa" name="address" value={values.address} onChange={handleChange} error={errors.address} />
            </div>
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
            <Button variant="secondary" to="/companies">
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

export default CompanyFormPage
