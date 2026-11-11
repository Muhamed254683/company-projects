import Button from './Button.jsx'

// Pravi listu brojeva strana sa "..." izmedju, npr. za 5. od 10 strana: [1, '...', 4, 5, 6, '...', 10]
function pageNumbers(current_page, last_page) {
  const pages = []

  for (let page = 1; page <= last_page; page++) {
    if (page === 1 || page === last_page || Math.abs(page - current_page) <= 1) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
}

// meta: objekat "meta" iz Laravel paginacije (current_page, last_page, from, to, total).
function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null

  const { current_page, last_page, from, to, total } = meta

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">
        Prikazano {from}–{to} od {total}
      </p>

      {last_page > 1 && (
        <nav aria-label="Paginacija" className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={current_page === 1}
            onClick={() => onPageChange(current_page - 1)}
          >
            ‹ Prethodna
          </Button>

          {pageNumbers(current_page, last_page).map((page, index) =>
            page === '...' ? (
              <span key={`gap-${index}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <Button
                key={page}
                size="sm"
                variant={page === current_page ? 'primary' : 'secondary'}
                aria-current={page === current_page ? 'page' : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            size="sm"
            variant="secondary"
            disabled={current_page === last_page}
            onClick={() => onPageChange(current_page + 1)}
          >
            Sledeća ›
          </Button>
        </nav>
      )}
    </div>
  )
}

export default Pagination
