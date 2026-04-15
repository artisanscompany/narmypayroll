import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  loader: () => {
    // Default to dashboard — the personnel layout will redirect admins
    throw redirect({ to: '/dashboard' })
  },
})
