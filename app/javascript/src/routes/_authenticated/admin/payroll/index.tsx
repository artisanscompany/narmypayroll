import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { Search, Upload, ChevronRight } from 'lucide-react'
import type { PayslipStatus } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/admin/payroll/')({
  component: AdminPayroll,
})

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLast6Months(): { month: number; year: number; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    })
  }
  return result
}

function AdminPayroll() {
  const { user } = useAuth()
  const { payslips, users } = useData()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [search, setSearch] = useState('')

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'
  const months = getLast6Months()

  // Scope users by division for divisionAdmin
  const scopedUsers = useMemo(
    () =>
      isSuperAdmin
        ? users.filter((u) => u.role === 'personnel')
        : users.filter((u) => u.role === 'personnel' && u.division === user.division),
    [users, isSuperAdmin, user.division],
  )

  const scopedUserIds = useMemo(() => new Set(scopedUsers.map((u) => u.id)), [scopedUsers])

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  // Filter payslips to scope, month, and search
  const filteredPayslips = useMemo(() => {
    return payslips.filter((slip) => {
      if (!scopedUserIds.has(slip.userId)) return false
      if (slip.month !== selectedMonth || slip.year !== selectedYear) return false
      if (search.trim()) {
        const u = userMap.get(slip.userId)
        if (!u) return false
        const q = search.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.armyNumber.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [payslips, scopedUserIds, selectedMonth, selectedYear, search, userMap])

  // Stats
  const payslipsThisMonth = useMemo(
    () => payslips.filter((s) => scopedUserIds.has(s.userId) && s.month === selectedMonth && s.year === selectedYear),
    [payslips, scopedUserIds, selectedMonth, selectedYear],
  )
  const totalDisbursed = payslipsThisMonth.reduce((sum, s) => sum + s.netPay, 0)

  const statusConfig: Record<PayslipStatus, { label: string; classes: string }> = {
    paid: { label: 'Paid', classes: 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700' },
    pending: { label: 'Pending', classes: 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600' },
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-army-dark">Payroll Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {payslipsThisMonth.length} payslip{payslipsThisMonth.length !== 1 ? 's' : ''} · {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <Link
          to="/admin/payroll/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload Payslip
        </Link>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Total Personnel</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">{scopedUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Payslips This Month</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">{payslipsThisMonth.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Total Disbursed</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">₦{totalDisbursed.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {months.map(({ month, year, label }) => {
          const active = month === selectedMonth && year === selectedYear
          return (
            <button
              key={label}
              onClick={() => { setSelectedMonth(month); setSelectedYear(year) }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active ? 'bg-army-dark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-army-gold/40'
              }`}
            >
              {label}
            </button>
          )
        })}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search personnel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-army-gold/40 w-48"
          />
        </div>
      </div>

      {/* Payslip Cards */}
      {filteredPayslips.length > 0 ? (
        <div className="space-y-2">
          {filteredPayslips.map((slip) => {
            const u = userMap.get(slip.userId)
            const userName = u?.name ?? 'Unknown'
            const armyNumber = u?.armyNumber ?? '—'
            const rank = u?.rank ?? '—'
            const { label: statusLabel, classes: statusClasses } = statusConfig[slip.status]
            return (
              <Link
                key={slip.id}
                to="/admin/users/$userId"
                params={{ userId: slip.userId }}
                className="block bg-white rounded-xl border border-gray-100 px-5 py-3.5 hover:border-army-gold/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-army-dark">{userName}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{armyNumber}</span> · {rank}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-semibold font-mono text-army-dark tabular-nums">
                      ₦{slip.netPay.toLocaleString()}
                    </span>
                    <span className={statusClasses}>{statusLabel}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No payslips match the current filters</p>
        </div>
      )}

    </div>
  )
}
