// Statusi projekta: iste vrednosti kao ProjectStatus enum u Laravelu.
// Nazivi i boje su na jednom mestu, pa ih koriste i lista (bedz) i forma (padajuca lista).
export const PROJECT_STATUSES = [
  { value: 'planned', label: 'Planiran', classes: 'bg-gray-100 text-gray-700' },
  { value: 'active', label: 'Aktivan', classes: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'Na čekanju', classes: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Završen', classes: 'bg-blue-100 text-blue-800' },
]

export function findProjectStatus(value) {
  return PROJECT_STATUSES.find((status) => status.value === value)
}
