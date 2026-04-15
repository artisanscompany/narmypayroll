import { createFileRoute, Outlet, useNavigate, useMatchRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/_personnel')({
  component: PersonnelLayout,
})

function PersonnelLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()

  useEffect(() => {
    if (!user) return
    if (user.role !== 'personnel') {
      navigate({ to: '/admin/dashboard' })
      return
    }
    if (user.status === 'awol') {
      const isComplaintsRoute = matchRoute({ to: '/complaints', fuzzy: true })
      if (!isComplaintsRoute) navigate({ to: '/complaints' })
    }
  }, [user, navigate, matchRoute])

  // Block render until redirect fires
  if (!user) return null
  if (user.role !== 'personnel') return null
  if (user.status === 'awol' && !matchRoute({ to: '/complaints', fuzzy: true })) return null

  return <Outlet />
}
