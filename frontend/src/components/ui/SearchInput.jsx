import { useEffect, useState } from 'react'
import { controlClasses } from './controlClasses.js'
import FormField from './FormField.jsx'

const DELAY_MS = 300

// Polje za pretragu: onChange se poziva tek 300 ms posle poslednjeg otkucanog slova ("debounce"),
// da se ne salje zahtev API-ju za svako slovo.
// value: trenutna vrednost (iz URL-a); text: ono sto korisnik upravo kuca.
function SearchInput({ label = 'Pretraga', name = 'search', value, onChange, placeholder = 'Pretraga...' }) {
  const [text, setText] = useState(value)

  // Ako se vrednost promeni spolja (npr. "Ponisti filtere" ili dugme Nazad), polje je prati.
  // Ovo je React obrazac "podesi state tokom crtanja kada se promeni prop".
  const [previous_value, setPreviousValue] = useState(value)
  if (value !== previous_value) {
    setPreviousValue(value)
    setText(value)
  }

  useEffect(() => {
    if (text.trim() === value) return

    const timer = setTimeout(() => onChange(text.trim()), DELAY_MS)
    // Novo slovo pre isteka 300 ms ponistava prethodni tajmer.
    return () => clearTimeout(timer)
  }, [text, value, onChange])

  return (
    <FormField label={label} htmlFor={name}>
      <input
        id={name}
        name={name}
        type="search"
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        className={controlClasses(false)}
      />
    </FormField>
  )
}

export default SearchInput
