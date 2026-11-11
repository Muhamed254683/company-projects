// '2026-12-01' -> '01.12.2026.'  (null -> '–')
export function formatDate(date_string) {
  if (!date_string) return '–'

  const [year, month, day] = date_string.split('-')
  return `${day}.${month}.${year}.`
}

// 1536 -> '1,5 KB', 2097152 -> '2,0 MB'
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString('sr-Latn-RS', { maximumFractionDigits: 1 })} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('sr-Latn-RS', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`
}

// '12500.50' -> '12.500,50'  (null -> '–')
export function formatMoney(amount) {
  if (amount === null || amount === undefined || amount === '') return '–'

  return Number(amount).toLocaleString('sr-Latn-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
