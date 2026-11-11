// Uloge na projektu: iste vrednosti kao ProjectRole enum u Laravelu.
export const PROJECT_ROLES = [
  { value: 'manager', label: 'Menadžer' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Dizajner' },
  { value: 'tester', label: 'Tester' },
]

export function projectRoleLabel(value) {
  return PROJECT_ROLES.find((role) => role.value === value)?.label ?? value
}
