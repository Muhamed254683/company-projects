import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">404 - Stranica ne postoji</h1>
      <Link to="/companies" className="mt-4 inline-block text-blue-600 hover:underline">
        Nazad na Companies
      </Link>
    </div>
  )
}

export default NotFoundPage
