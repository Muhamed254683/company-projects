import { controlClasses } from './controlClasses.js'
import FormField from './FormField.jsx'

// options: [{ value: 1, label: 'Firma A' }, ...]
// placeholder: tekst prve, prazne opcije (npr. "-- izaberi --"); izostavi ako je ne zelis.
function Select({ label, name, error, required, hint, options, placeholder, ...props }) {
  return (
    <FormField label={label} htmlFor={name} error={error} required={required} hint={hint}>
      <select id={name} name={name} aria-invalid={error ? true : undefined} className={controlClasses(Boolean(error))} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

export default Select
