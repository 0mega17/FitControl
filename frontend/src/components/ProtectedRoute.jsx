import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from './ui/Spinner'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <PageSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.rol?.nombre)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
