import { controlClasses } from './controlClasses.js'
import FormField from './FormField.jsx'

function Textarea({ label, name, error, required, hint, rows = 4, ...props }) {
  return (
    <FormField label={label} htmlFor={name} error={error} required={required} hint={hint}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={controlClasses(Boolean(error))}
        {...props}
      />
    </FormField>
  )
}

export default Textarea
