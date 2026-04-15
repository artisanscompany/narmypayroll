import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '#/contexts/AuthContext'
import { DataProvider } from '#/contexts/DataContext'
import '#/styles.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <Outlet />
      </DataProvider>
    </AuthProvider>
  )
}
