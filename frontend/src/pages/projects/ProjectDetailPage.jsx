import { useParams } from 'react-router-dom'
import ProjectGallery from '../../components/projects/ProjectGallery.jsx'
import ProjectMembers from '../../components/projects/ProjectMembers.jsx'
import ProjectStatusBadge from '../../components/ProjectStatusBadge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApiGet } from '../../hooks/useApiGet.js'
import { formatDate, formatMoney } from '../../utils/format.js'

// Jedan red u kartici sa podacima: naziv levo, vrednost desno.
function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{children}</dd>
    </div>
  )
}

// /projects/:id - podaci o projektu, clanovi i galerija slika.
function ProjectDetailPage() {
  const { id } = useParams()
  const { data: project, loading, error, not_found, reload } = useApiGet(`/projects/${id}`)

  if (loading) return <p className="text-gray-500">Učitavanje...</p>

  if (not_found || !project) {
    return (
      <div>
        <PageHeader title="Projekat" />
        <Alert>{not_found ? 'Projekat ne postoji.' : `Greška pri učitavanju: ${error}`}</Alert>
        <Button variant="secondary" to="/projects" className="mt-4">
          Nazad na listu
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={project.name}
        subtitle={project.company.name}
        actions={
          <>
            <Button variant="secondary" to="/projects">
              ‹ Svi projekti
            </Button>
            <Button to={`/projects/${project.id}/edit`}>Izmeni projekat</Button>
          </>
        }
      />

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <dl className="divide-y divide-gray-100">
          <InfoRow label="Kompanija">{project.company.name}</InfoRow>
          <InfoRow label="Status">
            <ProjectStatusBadge status={project.status} />
          </InfoRow>
          <InfoRow label="Period">
            {formatDate(project.start_date)} – {formatDate(project.end_date)}
          </InfoRow>
          <InfoRow label="Budžet">{formatMoney(project.budget)}</InfoRow>
          <InfoRow label="Opis">{project.description ?? '–'}</InfoRow>
        </dl>
      </section>

      <ProjectMembers project={project} onChanged={reload} />

      <ProjectGallery project={project} onChanged={reload} />
    </div>
  )
}

export default ProjectDetailPage
