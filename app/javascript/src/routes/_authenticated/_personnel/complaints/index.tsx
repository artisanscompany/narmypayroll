import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { useState } from 'react'
import { PenLine, Search, X, ArrowUpRight, Paperclip } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/')({
  component: ComplaintsListPage,
})

const filterOptions: { label: string; value: ComplaintStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Review', value: 'review' },
  { label: 'Action Req.', value: 'action-required' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

function ComplaintsListPage() {
  const { user } = useAuth()
  const { getComplaintsForUser } = useData()
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  if (!user) return null

  const complaints = getComplaintsForUser(user.id)
  const openCount = complaints.filter(c => !['resolved', 'closed'].includes(c.status)).length

  const searched = search.trim()
    ? complaints.filter((c) =>
        c.subcategory.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : complaints

  const filtered = filter === 'all' ? searched : searched.filter((c) => c.status === filter)
  const sorted = [...filtered].sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime())

  const counts: Record<string, number> = {
    all: searched.length,
    open: searched.filter((c) => c.status === 'open').length,
    review: searched.filter((c) => c.status === 'review').length,
    'action-required': searched.filter((c) => c.status === 'action-required').length,
    resolved: searched.filter((c) => c.status === 'resolved').length,
    closed: searched.filter((c) => c.status === 'closed').length,
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-0.5">{openCount} open · {complaints.length} total</p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors shrink-0"
        >
          <PenLine className="w-4 h-4" />
          Raise Inquiry
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            aria-label="Search" placeholder="Search by title, category, or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {filterOptions.map((opt) => {
            const count = counts[opt.value]
            if (opt.value !== 'all' && count === 0) return null
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-army-dark text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {opt.label} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Inquiry List */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500 mb-1">
            {search ? `No results for "${search}"` : 'No inquiries match this filter'}
          </p>
          <p className="text-xs text-gray-500">
            {search ? 'Try different keywords' : 'Adjust filters or raise a new inquiry'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((c) => {
            const isClosed = ['resolved', 'closed'].includes(c.status)
            return (
              <Link
                key={c.id}
                to="/complaints/$complaintId"
                params={{ complaintId: c.id }}
                className={`block bg-white rounded-xl border px-5 py-4 hover:border-army-gold/20 hover:shadow-sm transition-all group ${isClosed ? 'border-gray-100 opacity-60 hover:opacity-80' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <StatusBadge status={c.status} />
                      {c.attachments && c.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <Paperclip className="w-3 h-3" />
                          {c.attachments.length}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-gray-300 ml-auto">{c.id}</span>
                    </div>
                    <p className="text-sm font-semibold text-army-dark group-hover:text-army transition-colors">{c.subcategory || c.category}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.category} · Filed {new Date(c.filedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {/* Description preview */}
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{c.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
