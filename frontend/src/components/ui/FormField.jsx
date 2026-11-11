// Okvir oko jednog polja forme: labela, samo polje (children) i poruka greske ispod.
// error moze biti tekst ili niz poruka iz Laravela (npr. ["The name field is required."]).
function FormField({ label, htmlFor, error, required = false, hint, children }) {
  const message = Array.isArray(error) ? error[0] : error

  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
      )}

      {children}

      {hint && !message && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {message && <p className="mt-1 text-sm text-red-600">{message}</p>}
    </div>
  )
}

export default FormField
