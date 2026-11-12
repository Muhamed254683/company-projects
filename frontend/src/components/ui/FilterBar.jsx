import Button from './Button.jsx'

// Traka sa filterima iznad tabele. children: polja (SearchInput, Select...).
// Dugme "Ponisti filtere" se vidi samo kada je bar jedan filter aktivan.
function FilterBar({ has_filters, onReset, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
      {/* Svako polje dobija jednaku sirinu, a na uskom ekranu idu jedno ispod drugog. */}
      <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      {has_filters && (
        <Button variant="secondary" onClick={onReset}>
          Poništi filtere
        </Button>
      )}
    </div>
  )
}

export default FilterBar
