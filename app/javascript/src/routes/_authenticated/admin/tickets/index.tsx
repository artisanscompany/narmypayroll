import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { differenceInDays } from 'date-fns'
import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/admin/tickets/')({
  component: AdminTickets,
})

const STATUS_OPTIONS: ComplaintStatus[] = [
  'open',
  'review',
  'action-required',
  'resolved',
  'closed',
]

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Open',
  review: 'In Review',
  'action-required': 'Action Req.',
  resolved: 'Resolved',
  closed: 'Closed',
}

function AdminTickets() {
  const { user } = useAuth()
  const { complaints, getComplaintsForDivision } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')

  const allTickets = useMemo(() => {
    if (!user) return []
    return user.role === 'superAdmin' ? complaints : getComplaintsForDivision(user.division)
  }, [user, complaints, getComplaintsForDivision])

  const isSuperAdmin = user?.role === 'superAdmin'

  const openCount = useMemo(
    () => allTickets.filter((c) => !['resolved', 'closed'].includes(c.status)).length,
    [allTickets],
  )

  const filtered = useMemo(() => {
    let list = allTickets

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.userArmyNumber.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.subcategory.toLowerCase().includes(q),
      )
    }

    return [...list].sort(
      (a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime(),
    )
  }, [allTickets, statusFilter, search])

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: allTickets.length }
    for (const s of STATUS_OPTIONS) {
      base[s] = allTickets.filter((c) => c.status === s).length
    }
    return base
  }, [allTickets])

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">Ticket Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {openCount} open · {allTickets.length} total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          placeholder="Search by ID, name, army number, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-1.5 flex-wrap mt-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === 'all' ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({counts.all})
        </button>
        {STATUS_OPTIONS.filter((s) => counts[s] > 0).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === s ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Ticket Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No tickets match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2 mt-3">
          {filtered.map((ticket) => {
            const daysLeft = differenceInDays(new Date(ticket.slaDeadline), new Date())
            const slaBreach = daysLeft < 0
            const slaWarning = daysLeft >= 0 && daysLeft <= 2

            const priorityClasses =
              ticket.priority === 'critical'
                ? 'bg-red-50 text-red-700'
                : ticket.priority === 'high'
                  ? 'bg-orange-50 text-orange-700'
                  : ticket.priority === 'medium'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-gray-50 text-gray-600'

            return (
              <Link
                key={ticket.id}
                to="/admin/tickets/$ticketId"
                params={{ ticketId: ticket.id }}
                className={`block bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-army-gold/20 hover:shadow-sm transition-all group ${
                  ['resolved', 'closed'].includes(ticket.status) ? 'opacity-60 hover:opacity-80' : ''
                }`}
              >
                {/* Row 1: badges */}
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={ticket.status} />
                  {!['resolved', 'closed'].includes(ticket.status) && (
                    <span
                      className={`text-[11px] font-semibold ${slaBreach ? 'text-red-500' : slaWarning ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      {slaBreach ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${priorityClasses}`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{ticket.id}</span>
                </div>
                {/* Row 2: Filer */}
                <p className="text-sm font-semibold text-army-dark">{ticket.userName}</p>
                <p className="text-xs text-gray-400">
                  {ticket.userArmyNumber} · {ticket.category} ·{' '}
                  {new Date(ticket.filedDate).toLocaleDateString()}
                </p>
                {/* Row 3: Description */}
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{ticket.description}</p>
                {/* Division badge for super admin */}
                {isSuperAdmin && (
                  <span className="mt-2 inline-flex text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {ticket.userDivision}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
