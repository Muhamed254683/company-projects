// Zajednicki izgled za stranice Prijava i Registracija: naziv aplikacije i bela kartica na sredini ekrana.
function AuthCard({ title, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-700">Company Projects</h1>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {children}
        </div>

        {footer && <div className="mt-4 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  )
}

export default AuthCard
