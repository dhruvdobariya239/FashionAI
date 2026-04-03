import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth.jsx'

export function RequireAuth({ children }) {
  const { isAuthed } = useAuth()
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}

