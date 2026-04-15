import { useMatches, Link } from '@tanstack/react-router'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Home',
  '/profile': 'My Profile',
  '/pay': 'Pay Slips',
  '/complaints': 'Inquiries',
  '/complaints/new': 'New Inquiry',
  '/help': 'Help Center',
  '/admin/dashboard': 'Dashboard',
  '/admin/tickets': 'Tickets',
  '/admin/payroll': 'Payroll',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'Users',
  '/admin/rbac': 'RBAC',
}

export function Breadcrumbs() {
  const matches = useMatches()

  const crumbs = matches
    .filter((m) => m.pathname !== '/' && m.pathname !== '/_authenticated' && m.pathname !== '/_authenticated/_personnel')
    .map((m) => ({
      path: m.pathname,
      label: ROUTE_LABELS[m.pathname] ?? m.pathname.split('/').pop() ?? '',
    }))
    .filter((c) => c.label)

  // Deduplicate by path
  const seen = new Set<string>()
  const uniqueCrumbs = crumbs.filter((c) => {
    if (seen.has(c.path)) return false
    seen.add(c.path)
    return true
  })

  if (uniqueCrumbs.length <= 1) return null

  return (
    <nav className="lg:hidden flex items-center gap-1.5 text-xs text-gray-500 px-1 overflow-x-auto">
      {uniqueCrumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5 shrink-0">
          {i > 0 && <span className="text-gray-300">&gt;</span>}
          {i < uniqueCrumbs.length - 1 ? (
            <Link to={crumb.path} className="hover:text-army transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-army-dark font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
