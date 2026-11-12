import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './components/Layout.jsx'
import ResetOnUrlChange from './components/ResetOnUrlChange.jsx'
import CompanyFormPage from './pages/companies/CompanyFormPage.jsx'
import CompanyListPage from './pages/companies/CompanyListPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectDetailPage from './pages/projects/ProjectDetailPage.jsx'
import ProjectFormPage from './pages/projects/ProjectFormPage.jsx'
import ProjectListPage from './pages/projects/ProjectListPage.jsx'
import UserFormPage from './pages/users/UserFormPage.jsx'
import UserListPage from './pages/users/UserListPage.jsx'

// Forma za dodavanje i izmenu je ista komponenta (razlikuje ih da li u URL-u postoji :id).
// ResetOnUrlChange: kada se adresa promeni (npr. /new -> /5/edit), forma krece od nule.
function form(page) {
  return <ResetOnUrlChange>{page}</ResetOnUrlChange>
}

function App() {
  return (
    <Routes>
      {/* Jedine stranice bez prijave (prijava, registracija, zaboravljena lozinka). */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* RequireAuth: sve unutra vide samo prijavljeni korisnici (ostali idu na /login). */}
      <Route element={<RequireAuth />}>
      {/* Sve stranice su "unutar" Layout-a, pa svaka ima isti okvir (i navbar). */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/companies" replace />} />

        <Route path="/companies" element={<CompanyListPage />} />
        <Route path="/companies/new" element={form(<CompanyFormPage />)} />
        <Route path="/companies/:id/edit" element={form(<CompanyFormPage />)} />

        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/new" element={form(<ProjectFormPage />)} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={form(<ProjectFormPage />)} />

        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/new" element={form(<UserFormPage />)} />
        <Route path="/users/:id/edit" element={form(<UserFormPage />)} />

        {/* "*" hvata svaki URL koji nije gore naveden. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Route>
    </Routes>
  )
}

export default App
