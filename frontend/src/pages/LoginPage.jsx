import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getValidationErrors } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'
import AuthCard from '../components/AuthCard.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Kuda je korisnik krenuo pre nego sto ga je RequireAuth poslao ovde.
  const from = location.state?.from ?? '/companies'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [general_error, setGeneralError] = useState(null)
  const [sending, setSending] = useState(false)

  // Vec prijavljen korisnik nema sta da trazi na stranici za prijavu.
  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    setGeneralError(null)

    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.status === 429) {
        setGeneralError('Previše pokušaja prijave. Sačekaj minut, pa probaj ponovo.')
      } else if (err.status === 422) {
        setErrors(getValidationErrors(err))
      } else {
        setGeneralError(err.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthCard
      title="Prijava"
      footer={
        <>
          Nemaš nalog?{' '}
          <Link to="/register" className="font-medium text-blue-700 hover:underline">
            Registruj se
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {general_error && <Alert>{general_error}</Alert>}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Lozinka"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Prijava...' : 'Prijavi se'}
        </Button>

        {/* Samo u razvoju (npm run dev): podsetnik na test nalog iz seedera. U build-u ovoga nema. */}
        {import.meta.env.DEV && (
          <p className="text-center text-xs text-gray-500">
            Test nalog: <strong>admin@example.com</strong> / <strong>password</strong>
          </p>
        )}
      </form>
    </AuthCard>
  )
}

export default LoginPage
