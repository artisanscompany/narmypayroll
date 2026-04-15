import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role === 'personnel') {
      navigate({ to: '/dashboard' })
    }
  }, [user, navigate])

  if (!user || user.role === 'personnel') return null

  return <Outlet />
}
