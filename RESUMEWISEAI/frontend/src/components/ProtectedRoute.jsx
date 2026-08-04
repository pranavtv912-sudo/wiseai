import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}

