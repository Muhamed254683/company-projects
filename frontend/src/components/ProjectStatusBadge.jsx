import { findProjectStatus } from '../constants/projectStatus.js'

function ProjectStatusBadge({ status }) {
  const found = findProjectStatus(status)

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${found?.classes ?? 'bg-gray-100 text-gray-700'}`}>
      {found?.label ?? status}
    </span>
  )
}

export default ProjectStatusBadge
