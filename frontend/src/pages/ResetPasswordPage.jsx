import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest, getValidationErrors } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'
import AuthCard from '../components/AuthCard.jsx'
import { useToast } from '../components/toast/toastContext.js'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const EMPTY = { password: '', password_confirmation: '' }

// Nova lozinka. Korisnik dolazi preko linka iz emaila: /reset-password?token=...&email=...
function ResetPasswordPage() {
  const { status, user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [search_params] = useSearchParams()
  const token = search_params.get('token') ?? ''
  const email = search_params.get('email') ?? ''

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  // Link je los ili istekao: prikazujemo poruku i link za novi zahtev.
  const [link_invalid, setLinkInvalid] = useState(false)
  const [general_error, setGeneralError] = useState(null)
  const [sending, setSending] = useState(false)

  const footer = (
    <Link to="/login" className="font-medium text-blue-700 hover:underline">
      Nazad na prijavu
    </Link>
  )

  const new_link = (
    <Link to="/forgot-password" className="font-medium underline">
      Zatraži novi link
    </Link>
  )

  // Link bez tokena ili emaila (npr. iseckan pri kopiranju).
  if (!token || !email || link_invalid) {
    return (
      <AuthCard title="Nova lozinka" footer={footer}>
        <Alert>
          Link za novu lozinku nije ispravan ili je istekao (važi 60 minuta i samo jednom). {new_link}.
        </Alert>
      </AuthCard>
    )
  }

  // Neko je vec prijavljen u ovom browseru. Nova lozinka ionako odjavljuje sa svih uredjaja,
  // pa trazimo da se prvo odjavi (link u adresi ostaje, forma se pojavi odmah posle odjave).
  if (status === 'authenticated') {
    return (
      <AuthCard title="Nova lozinka" footer={footer}>
        <p className="text-sm text-gray-700">
          Trenutno si prijavljen/a kao <strong>{user?.email}</strong>. Da bi postavio/la novu lozinku za{' '}
          <strong>{email}</strong>, prvo se odjavi.
        </p>
        <Button className="w-full" onClick={logout}>
          Odjavi se
        </Button>
      </AuthCard>
    )
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Greska za ponovljenu lozinku stoji ispod "Nova lozinka", pa i nju sklanjamo kad se menja potvrda.
    setErrors((current) => ({ ...current, password: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    setGeneralError(null)

    try {
      await apiRequest('/reset-password', { method: 'POST', body: { token, email, ...values } })
      toast.success('Lozinka je promenjena. Prijavi se novom lozinkom.')
      // Email saljemo stranici za prijavu, da ne mora ponovo da se kuca.
      navigate('/login', { replace: true, state: { email } })
    } catch (err) {
      if (err.status === 429) {
        setGeneralError('Previše pokušaja. Sačekaj minut, pa probaj ponovo.')
      } else if (err.status === 422) {
        const validation_errors = getValidationErrors(err)
        // Greska na "email" znaci los ili istekao link (token i email su iz linka, korisnik ih ne kuca).
        if (validation_errors.email || validation_errors.token) setLinkInvalid(true)
        else setErrors(validation_errors)
      } else {
        setGeneralError(err.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthCard title="Nova lozinka" footer={footer}>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {general_error && <Alert>{general_error}</Alert>}

        <p className="text-sm text-gray-600">
          Nalog: <strong>{email}</strong>
        </p>

        {/* Skriveno polje sa emailom pomaze browseru da sacuva novu lozinku uz pravi nalog. */}
        <input type="email" name="email" value={email} autoComplete="username" readOnly hidden />

        <Input
          label="Nova lozinka"
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
          label="Ponovi novu lozinku"
          name="password_confirmation"
          type="password"
          required
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={handleChange}
        />

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Čuvanje...' : 'Sačuvaj novu lozinku'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default ResetPasswordPage
