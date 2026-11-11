import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CompaniesPage from './pages/CompaniesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'

function App() {
  return (
    <Routes>
      {/* Sve stranice su "unutar" Layout-a, pa svaka ima isti okvir (i navbar). */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/companies" replace />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/users" element={<UsersPage />} />
        {/* "*" hvata svaki URL koji nije gore naveden. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
