import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiRequest, getValidationErrors } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'
import AuthCard from '../components/AuthCard.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

// Zaboravljena lozinka: korisnik unese email, a backend posalje link za novu lozinku.
function ForgotPasswordPage() {
  const { status } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [general_error, setGeneralError] = useState(null)
  const [sending, setSending] = useState(false)
  // Email na koji je zahtev poslat; kada postoji, umesto forme prikazujemo poruku.
  const [sent_to, setSentTo] = useState(null)

  if (status === 'authenticated') {
    return <Navigate to="/companies" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setError(null)
    setGeneralError(null)

    try {
      await apiRequest('/forgot-password', { method: 'POST', body: { email } })
      setSentTo(email)
    } catch (err) {
      if (err.status === 429) {
        setGeneralError('Previše zahteva. Sačekaj minut, pa probaj ponovo.')
      } else if (err.status === 422) {
        setError(getValidationErrors(err).email)
      } else {
        setGeneralError(err.message)
      }
    } finally {
      setSending(false)
    }
  }

  const footer = (
    <Link to="/login" className="font-medium text-blue-700 hover:underline">
      Nazad na prijavu
    </Link>
  )

  if (sent_to) {
    return (
      <AuthCard title="Proveri email" footer={footer}>
        <div className="space-y-3 text-sm text-gray-700" role="status">
          {/* Ista poruka i kada nalog ne postoji: niko ne sme da sazna koji emailovi su registrovani. */}
          <p>
            Ako postoji nalog sa adresom <strong>{sent_to}</strong>, poslali smo mu link za novu lozinku. Link važi 60
            minuta.
          </p>
          <p>Ne vidiš email? Proveri i spam, ili zatraži novi link za minut.</p>
          {/* Samo u razvoju: emailovi se ne salju stvarno (MAIL_MAILER=log), nego se upisuju u log. */}
          {import.meta.env.DEV && (
            <p className="rounded-md bg-yellow-50 p-3 text-xs text-yellow-800">
              Lokalno se emailovi ne šalju: email sa linkom je na kraju fajla <code>backend/storage/logs/laravel.log</code>.
            </p>
          )}
          <Button variant="secondary" className="w-full" onClick={() => setSentTo(null)}>
            Pošalji ponovo
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Zaboravljena lozinka" footer={footer}>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {general_error && <Alert>{general_error}</Alert>}

        <p className="text-sm text-gray-600">Unesi email sa kojim si se registrovao/la i poslaćemo ti link za novu lozinku.</p>

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError(null)
          }}
          error={error}
        />

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Slanje...' : 'Pošalji link'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default ForgotPasswordPage
