import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { KPI_DATA, DIVISION_1_KPI, CATEGORY_CHART_DATA, MONTHLY_TREND_DATA } from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import { differenceInDays } from 'date-fns'
import { ChevronRight, Ticket, Banknote, Users, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: AdminDashboard,
})

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getSlaInfo(deadline: string): { label: string; color: string } {
  const daysLeft = differenceInDays(new Date(deadline), new Date())
  if (daysLeft <= 0) return { label: 'Overdue', color: 'text-red-500' }
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: 'text-amber-500' }
  return { label: `${daysLeft}d left`, color: 'text-gray-400' }
}

function isTrendPositive(label: string, direction: string): boolean {
  // "Resolved" + up = good
  if (label.toLowerCase().includes('resolved') && direction === 'up') return true
  // "Breach" + down = good
  if (label.toLowerCase().includes('breach') && direction === 'down') return true
  // "Resolution" time + down = good
  if (label.toLowerCase().includes('resolution') && direction === 'down') return true
  // "Open" + up = bad
  return false
}

const ROLE_LABELS: Record<string, string> = {
  divisionAdmin: 'Division Admin',
  superAdmin: 'Super Admin',
  personnel: 'Personnel',
}

function AdminDashboard() {
  const { user } = useAuth()
  const { complaints, getComplaintsForDivision } = useData()

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'
  const kpis = isSuperAdmin ? KPI_DATA : DIVISION_1_KPI
  const roleLabel = ROLE_LABELS[user.role] ?? user.role
  const divisionScope = isSuperAdmin ? 'All Divisions' : user.division

  const allTickets = isSuperAdmin ? complaints : getComplaintsForDivision(user.division)
  const openTickets = allTickets.filter((c) => !['resolved', 'closed'].includes(c.status))

  const recentTickets = [...allTickets]
    .sort((a, b) => {
      const aOpen = !['resolved', 'closed'].includes(a.status) ? 1 : 0
      const bOpen = !['resolved', 'closed'].includes(b.status) ? 1 : 0
      if (bOpen !== aOpen) return bOpen - aOpen
      return new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime()
    })
    .slice(0, 3)

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Hero Card */}
      <div className="bg-army-dark rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-army-gold/6 rounded-full blur-[80px]" />

        <div className="relative z-10 px-6 pt-6 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {getGreeting()}, {user.rank} {user.name.split(' ').pop()}
          </h1>
          <p className="text-xs text-white/30 mt-1">
            {roleLabel} · {divisionScope}
          </p>
        </div>

        <div className="relative z-10 border-t border-white/8 px-6 py-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-0">
            {[
              { label: 'Role', value: roleLabel },
              { label: 'Division', value: divisionScope },
              { label: 'Rank', value: user.rank },
              { label: 'Corps', value: user.corps },
            ].map(({ label, value }) => (
              <div key={label} className="min-w-0 pr-4">
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                <p className="text-[13px] text-white/80 font-semibold truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const positive = isTrendPositive(kpi.label, kpi.trendDirection)
          const trendColor = positive ? 'text-green-600' : 'text-red-500'
          const trendSign = kpi.trend > 0 ? '+' : ''
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{kpi.label}</p>
              <p className="text-lg font-extrabold text-army-dark font-mono">
                {kpi.value}{kpi.unit ? <span className="text-sm font-semibold text-gray-400 ml-0.5">{kpi.unit}</span> : null}
              </p>
              <p className={`text-xs font-medium ${trendColor}`}>
                {trendSign}{kpi.trend}% vs last month
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3">

        {/* Category Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">By Category</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart layout="vertical" data={CATEGORY_CHART_DATA} margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B5E35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Trend</p>
            <span className="text-[11px] font-medium">
              <span className="text-army-gold">● Filed</span>
              <span className="text-army ml-2">● Resolved</span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MONTHLY_TREND_DATA} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#C8A84B" strokeWidth={2} dot={{ r: 3 }} name="Filed" />
              <Line type="monotone" dataKey="resolved" stroke="#1B5E35" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tickets', sublabel: 'Manage & respond', to: '/admin/tickets', Icon: Ticket },
          { label: 'Payroll', sublabel: 'Upload & review', to: '/admin/payroll', Icon: Banknote },
          { label: 'Users', sublabel: 'View personnel', to: '/admin/users', Icon: Users },
          { label: 'Analytics', sublabel: 'Charts & metrics', to: '/admin/analytics', Icon: BarChart3 },
        ].map(({ label, sublabel, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-army-gold/20 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-army-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-army-dark">{label}</p>
              <p className="text-[11px] text-gray-400">{sublabel}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent Tickets */}
      {recentTickets.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-bold text-army-dark">Recent Tickets</h3>
              <span className="text-xs text-gray-400">{openTickets.length} open</span>
            </div>
            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5 pb-3">
            {recentTickets.map((c, i) => {
              const isOpen = !['resolved', 'closed'].includes(c.status)
              const sla = isOpen ? getSlaInfo(c.slaDeadline) : null
              return (
                <Link
                  key={c.id}
                  to="/admin/tickets/$ticketId"
                  params={{ ticketId: c.id }}
                  className={`flex items-center gap-3 py-2.5 hover:opacity-80 transition-opacity group ${i < recentTickets.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <StatusBadge status={c.status} fixed />
                  <span className="text-sm text-army-dark group-hover:text-army transition-colors truncate flex-1">
                    {c.subcategory}
                  </span>
                  {sla && (
                    <span className={`text-[11px] font-semibold shrink-0 ${sla.color}`}>
                      {sla.label}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-8 text-center">
          <p className="text-sm text-gray-400">No tickets to display</p>
        </div>
      )}

    </div>
  )
}
