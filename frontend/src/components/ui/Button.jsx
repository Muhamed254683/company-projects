import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-2.5 py-1 text-xs',
}

// Primeri:
//   <Button onClick={...}>Sacuvaj</Button>
//   <Button variant="danger" size="sm">Obrisi</Button>
//   <Button to="/companies/new">Dodaj</Button>   (link unutar React aplikacije koji izgleda kao dugme)
//   <Button href="http://...">Spolja</Button>     (obican link ka drugoj adresi, otvara se u novom tabu)
function Button({ variant = 'primary', size = 'md', to, href, type = 'button', className = '', children, ...props }) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    // rel="noopener noreferrer": nova kartica ne dobija pristup ovoj (bezbednosna navika za target="_blank").
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    )
  }

  // type="button" je podrazumevan, da dugme unutar <form> ne bi slucajno poslalo formu.
  // Za dugme koje salje formu pisemo type="submit".
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
