import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CompanyFormPage from './pages/companies/CompanyFormPage.jsx'
import CompanyListPage from './pages/companies/CompanyListPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectDetailPage from './pages/projects/ProjectDetailPage.jsx'
import ProjectFormPage from './pages/projects/ProjectFormPage.jsx'
import ProjectListPage from './pages/projects/ProjectListPage.jsx'
import UserFormPage from './pages/users/UserFormPage.jsx'
import UserListPage from './pages/users/UserListPage.jsx'

function App() {
  return (
    <Routes>
      {/* Sve stranice su "unutar" Layout-a, pa svaka ima isti okvir (i navbar). */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/companies" replace />} />

        <Route path="/companies" element={<CompanyListPage />} />
        {/* Ista komponenta za dodavanje i izmenu; razlikuje ih da li u URL-u postoji :id. */}
        <Route path="/companies/new" element={<CompanyFormPage />} />
        <Route path="/companies/:id/edit" element={<CompanyFormPage />} />

        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/new" element={<ProjectFormPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/new" element={<UserFormPage />} />
        <Route path="/users/:id/edit" element={<UserFormPage />} />

        {/* "*" hvata svaki URL koji nije gore naveden. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
