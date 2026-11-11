// columns: [{ key: 'name', header: 'Naziv' }, { key: 'actions', header: '', render: (row) => <...> }]
// Ako kolona ima render(), on odlucuje sta se prikazuje; inace se prikazuje row[key].
// rowClassName (opciono): funkcija koja za red vraca dodatne klase, npr. drugu boju pozadine.
function Table({ columns, rows, rowKey = (row) => row.id, rowClassName, emptyMessage = 'Nema podataka.' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-left font-semibold text-gray-700 ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className={rowClassName?.(row) || 'hover:bg-gray-50'}>
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 text-gray-800 ${column.className ?? ''}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
