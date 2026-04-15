import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import {
  KPI_DATA, DIVISION_1_KPI, CATEGORY_CHART_DATA, MONTHLY_TREND_DATA,
  STATUS_DISTRIBUTION_DATA, DIVISION_COMPARISON_DATA, SLA_COMPLIANCE_DATA,
} from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'

export const Route = createFileRoute('/_authenticated/admin/analytics')({
  component: AdminAnalytics,
})

function isPositiveTrend(label: string, trendDirection: string): boolean {
  if (label === 'Resolved This Month') return trendDirection === 'up'
  if (label === 'SLA Breach Rate') return trendDirection === 'down'
  if (label === 'Avg Resolution Time') return trendDirection === 'down'
  return trendDirection === 'up'
}

function AdminAnalytics() {
  const { user } = useAuth()

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'
  const kpiData = isSuperAdmin ? KPI_DATA : DIVISION_1_KPI

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-army-dark">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Detailed ticket analytics and trend data</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpiData.map((kpi) => {
          const positive = isPositiveTrend(kpi.label, kpi.trendDirection)
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{kpi.label}</p>
              <p className="text-lg font-extrabold text-army-dark font-mono">
                {kpi.value}{kpi.unit ? <span className="text-xs font-normal ml-0.5">{kpi.unit}</span> : null}
              </p>
              <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tickets by Category</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart layout="vertical" data={CATEGORY_CHART_DATA}>
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B5E35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 pt-4 pb-2 flex items-center gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Trend</p>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <span className="w-2 h-0.5 bg-army-gold inline-block rounded" />Filed
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <span className="w-2 h-0.5 bg-army inline-block rounded" />Resolved
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_TREND_DATA}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="tickets" stroke="#C8A84B" fill="#C8A84B" fillOpacity={0.15} strokeWidth={2} name="Filed" />
              <Area type="monotone" dataKey="resolved" stroke="#1B5E35" fill="#1B5E35" fillOpacity={0.15} strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status Distribution</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STATUS_DISTRIBUTION_DATA.map((entry) => (
            <div key={entry.status} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                <span className="text-lg font-extrabold font-mono text-army-dark">{entry.count}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{entry.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Super Admin Only — Division Comparison */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 pt-4 pb-2 flex items-center gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Division Comparison</p>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <span className="w-2 h-2 rounded bg-army-gold inline-block" />Open
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <span className="w-2 h-2 rounded bg-army inline-block" />Resolved
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <span className="w-2 h-2 rounded bg-[#ef4444] inline-block" />Escalated
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DIVISION_COMPARISON_DATA}>
              <XAxis dataKey="division" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="open" stackId="a" fill="#C8A84B" name="Open" />
              <Bar dataKey="resolved" stackId="a" fill="#1B5E35" name="Resolved" />
              <Bar dataKey="escalated" stackId="a" fill="#ef4444" name="Escalated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* SLA Compliance */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SLA Compliance</p>
        <div>
          {(isSuperAdmin ? SLA_COMPLIANCE_DATA : SLA_COMPLIANCE_DATA.slice(0, 1)).map((d, i, arr) => {
            const rate = d.complianceRate
            const borderClass = i < arr.length - 1 ? 'border-b border-gray-50' : ''
            return (
              <div key={d.division} className={`flex items-center gap-3 py-2 ${borderClass}`}>
                <span className="text-xs text-gray-600 w-32 shrink-0 truncate">{d.division}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${rate >= 95 ? 'bg-green-500' : rate >= 90 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-xs font-semibold font-mono text-army-dark w-12 text-right">{rate}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
