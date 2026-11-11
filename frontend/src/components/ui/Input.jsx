import { controlClasses } from './controlClasses.js'
import FormField from './FormField.jsx'

// <Input label="Naziv" name="name" value={...} onChange={...} error={errors.name} required />
// "required" ovde samo dodaje zvezdicu uz labelu. Ne prosledjujemo ga u <input>,
// da browser ne bi blokirao slanje: proveru radi Laravel i vraca poruke koje prikazujemo.
function Input({ label, name, error, required, hint, type = 'text', ...props }) {
  return (
    <FormField label={label} htmlFor={name} error={error} required={required} hint={hint}>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        className={controlClasses(Boolean(error))}
        {...props}
      />
    </FormField>
  )
}

export default Input
