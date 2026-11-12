import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getValidationErrors } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'
import AuthCard from '../components/AuthCard.jsx'
import { useToast } from '../components/toast/toastContext.js'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const EMPTY = { first_name: '', last_name: '', email: '', password: '', password_confirmation: '' }

// Otvorena registracija: svako moze da napravi nalog; posle registracije je odmah prijavljen.
function RegisterPage() {
  const { status, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [general_error, setGeneralError] = useState(null)
  const [sending, setSending] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/companies" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Greska za ponovljenu lozinku stoji ispod "Lozinka", pa i nju sklanjamo kad se menja potvrda.
    const field = name === 'password_confirmation' ? 'password' : name
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    setGeneralError(null)

    try {
      const user = await register(values)
      toast.success(`Dobrodošao/la, ${user.first_name}! Nalog je napravljen.`)
      navigate('/companies', { replace: true })
    } catch (err) {
      if (err.status === 429) {
        setGeneralError('Previše pokušaja registracije. Sačekaj minut, pa probaj ponovo.')
      } else if (err.status === 422) {
        setErrors(getValidationErrors(err))
        setGeneralError('Proveri označena polja.')
      } else {
        setGeneralError(err.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthCard
      title="Registracija"
      footer={
        <>
          Već imaš nalog?{' '}
          <Link to="/login" className="font-medium text-blue-700 hover:underline">
            Prijavi se
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {general_error && <Alert>{general_error}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ime"
            name="first_name"
            required
            autoComplete="given-name"
            value={values.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />
          <Input
            label="Prezime"
            name="last_name"
            required
            autoComplete="family-name"
            value={values.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Lozinka"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          hint="Najmanje 8 znakova."
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Ponovi lozinku"
          name="password_confirmation"
          type="password"
          required
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={handleChange}
        />

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Pravljenje naloga...' : 'Napravi nalog'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default RegisterPage
