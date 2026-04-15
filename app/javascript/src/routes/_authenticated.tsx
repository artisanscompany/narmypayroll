import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset } from '#/components/ui/sidebar'
import { AppSidebar } from '#/components/app-sidebar'
import { SessionTimeoutManager } from '#/components/session-timeout-modal'
import { Breadcrumbs } from '#/components/breadcrumbs'
import { NotificationBell } from '#/components/notification-bell'
import { useAuth } from '#/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user) return null

  return (
    <SidebarProvider>
      <SessionTimeoutManager />
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
            <Breadcrumbs />
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-army-cream/50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
