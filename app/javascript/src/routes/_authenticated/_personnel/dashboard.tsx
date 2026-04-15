import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { AWOLBanner } from '#/components/awol-banner'
import {
  ChevronRight,
  ArrowUpRight,
  PenLine,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/_personnel/dashboard')({
  component: PersonnelDashboard,
})

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getSlaLabel(deadline: string, status?: string): { label: string; urgent: boolean } | null {
  if (status && ['resolved', 'closed'].includes(status)) return null
  const now = new Date()
  const sla = new Date(deadline)
  const diffMs = sla.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Overdue', urgent: true }
  if (diffDays === 0) return { label: 'Due today', urgent: true }
  if (diffDays <= 3) return { label: `${diffDays}d left`, urgent: true }
  return { label: `${diffDays}d left`, urgent: false }
}

function PersonnelDashboard() {
  const { user } = useAuth()
  const { getComplaintsForUser, getPayslipsForUser } = useData()

  if (!user) return null

  const complaints = getComplaintsForUser(user.id)
  const payslips = getPayslipsForUser(user.id)
  const openComplaints = complaints.filter((c) => !['resolved', 'closed'].includes(c.status))
  const sortedPayslips = [...payslips].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))
  const latestPayslip = sortedPayslips[0]
  const previousPayslip = sortedPayslips[1]

  // Show open complaints first, then most recent — max 3
  const recentComplaints = [...complaints]
    .sort((a, b) => {
      const aOpen = !['resolved', 'closed'].includes(a.status) ? 1 : 0
      const bOpen = !['resolved', 'closed'].includes(b.status) ? 1 : 0
      if (bOpen !== aOpen) return bOpen - aOpen
      return new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime()
    })
    .slice(0, 3)

  const monthNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const enlistDate = new Date(user.dateOfEnlistment)
  const now = new Date()
  const totalMonths = Math.max(0, (now.getFullYear() - enlistDate.getFullYear()) * 12 + (now.getMonth() - enlistDate.getMonth()))
  const serviceYears = Math.floor(totalMonths / 12)
  const serviceMonths = totalMonths % 12

  const payDiff = latestPayslip && previousPayslip
    ? latestPayslip.netPay - previousPayslip.netPay
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {user.status === 'awol' && <AWOLBanner />}

      {/* Hero — greeting + service details */}
      <div className="bg-army-dark rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-army-gold/6 rounded-full blur-[80px]" />

        <div className="relative z-10 px-6 pt-6 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {getGreeting()}, {user.rank} {user.name.split(' ').pop()}
          </h1>
          <p className="text-xs text-white/30 mt-1">
            {user.status === 'awol' ? 'AWOL' : user.status === 'suspended' ? 'Suspended' : user.status === 'retired' ? 'Retired' : 'Active Duty'} · {serviceYears}y {serviceMonths}m service · {user.division}
          </p>
        </div>

        {/* Service detail chips — dynamic grid based on personnel type */}
        <div className="relative z-10 border-t border-white/8 px-6 py-3.5">
          {(() => {
            const chips = [
              { label: 'Army No.', value: user.armyNumber },
              { label: 'Rank / Step', value: `${user.rank} — Step ${user.step}` },
              ...(user.personnelType === 'soldier' ? [{ label: 'Trade', value: user.trade }] : []),
              { label: 'Corps', value: user.corps },
            ]
            return (
              <div className={`grid grid-cols-2 ${chips.length > 3 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-y-3 gap-x-0`}>
                {chips.map(({ label, value }) => (
                  <div key={label} className="min-w-0 pr-4">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                    <p className="text-[13px] text-white/80 font-semibold truncate">{value}</p>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Net Pay */}
      <Link to="/pay" className="group block">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 transition-all group-hover:border-army-gold/20 group-hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</span>
                {latestPayslip && (
                  <span className="text-xs text-gray-300">· {monthNamesShort[latestPayslip.month]} {latestPayslip.year}</span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-army-dark font-mono leading-tight">
                ₦{latestPayslip?.netPay.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {latestPayslip?.status === 'paid' && (
                <span className="text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full">Paid</span>
              )}
              {payDiff !== null && payDiff !== 0 && (
                <span className={`text-xs font-mono font-semibold ${payDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {payDiff > 0 ? '+' : ''}₦{payDiff.toLocaleString()}
                </span>
              )}
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
            </div>
          </div>
        </div>
      </Link>

      {/* Inquiries */}
        {recentComplaints.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-bold text-army-dark">Inquiries</h3>
                <span className="text-xs text-gray-500">{openComplaints.length} open</span>
              </div>
              <Link to="/complaints" className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 pb-3">
              {recentComplaints.map((c, i) => {
                const sla = getSlaLabel(c.slaDeadline, c.status)
                const showSla = !!sla
                return (
                  <Link
                    key={c.id}
                    to="/complaints/$complaintId"
                    params={{ complaintId: c.id }}
                    className={`flex items-center gap-3 py-2.5 hover:opacity-80 transition-opacity group ${i < recentComplaints.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <StatusBadge status={c.status} fixed />
                    <span className="text-sm text-army-dark group-hover:text-army transition-colors truncate flex-1">{c.subcategory}</span>
                    {showSla && (
                      <span className={`text-[11px] font-semibold shrink-0 ${sla.urgent ? 'text-red-500' : 'text-gray-500'}`}>
                        {sla.label}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  </Link>
                )
              })}
            </div>
            {/* Raise complaint inline CTA */}
            <div className="border-t border-gray-100 px-5 py-2.5">
              <Link
                to="/complaints/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-army hover:text-army-gold transition-colors"
              >
                <PenLine className="w-3 h-3" />
                Submit an inquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-8 text-center">
            <p className="text-sm text-gray-500 mb-2">No inquiries filed</p>
            <Link to="/complaints/new" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
              Submit your first inquiry
            </Link>
          </div>
        )}

      {/* Pay History */}
        {sortedPayslips.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
              <h3 className="text-sm font-bold text-army-dark">Pay History</h3>
              <Link to="/pay" className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold transition-colors">
                All {sortedPayslips.length} months <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 pb-3">
              {sortedPayslips.slice(0, 4).map((slip, i) => (
                <Link
                  key={slip.id}
                  to="/pay"
                  className={`flex items-center justify-between py-2.5 hover:opacity-80 transition-opacity ${i < Math.min(sortedPayslips.length, 4) - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-sm text-army-dark">{monthNamesShort[slip.month]} {slip.year}</span>
                  </div>
                  <span className="text-sm font-semibold font-mono text-army-dark tabular-nums">₦{slip.netPay.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
