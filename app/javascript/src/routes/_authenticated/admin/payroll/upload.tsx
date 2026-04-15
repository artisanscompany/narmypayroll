import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { ArrowLeft, Upload, Plus, Minus, FileSpreadsheet, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Payslip, PayComponent, PayslipStatus } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/admin/payroll/upload')({
  component: PayrollUpload,
})

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Fixed CSV columns
const CSV_EARNINGS = ['basic_salary', 'housing_allowance', 'transport_allowance', 'sf_allowance'] as const
const CSV_DEDUCTIONS = ['tax_paye', 'pension_contribution', 'welfare_fund'] as const

const EARNING_LABELS: Record<string, string> = {
  basic_salary: 'Basic Salary',
  housing_allowance: 'Housing Allowance',
  transport_allowance: 'Transport Allowance',
  sf_allowance: 'SF Allowance',
}

const DEDUCTION_LABELS: Record<string, string> = {
  tax_paye: 'Tax (PAYE)',
  pension_contribution: 'Pension Contribution',
  welfare_fund: 'Welfare Fund',
}

type UploadMode = 'single' | 'csv'

interface CsvRow {
  armyNumber: string
  month: number
  year: number
  earnings: PayComponent[]
  deductions: PayComponent[]
  status: PayslipStatus
  grossPay: number
  totalDeductions: number
  netPay: number
  valid: boolean
  warning?: string
}

function PayrollUpload() {
  const { user } = useAuth()
  const { users, addPayslip } = useData()
  const navigate = useNavigate()

  const now = new Date()
  const [mode, setMode] = useState<UploadMode>('single')

  // Single mode state
  const [uploadUserId, setUploadUserId] = useState('')
  const [uploadMonth, setUploadMonth] = useState(now.getMonth() + 1)
  const [uploadYear, setUploadYear] = useState(now.getFullYear())
  const [earnings, setEarnings] = useState<PayComponent[]>([{ label: 'Basic Salary', amount: 0, type: 'earning' }])
  const [deductions, setDeductions] = useState<PayComponent[]>([{ label: 'Tax (PAYE)', amount: 0, type: 'deduction' }])
  const [uploadStatus, setUploadStatus] = useState<PayslipStatus>('paid')

  // CSV mode state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [csvFileName, setCsvFileName] = useState('')
  const [csvParsed, setCsvParsed] = useState(false)

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'

  // Scope personnel users for dropdown
  const scopedUsers = useMemo(
    () =>
      isSuperAdmin
        ? users.filter((u) => u.role === 'personnel')
        : users.filter((u) => u.role === 'personnel' && u.division === user.division),
    [users, isSuperAdmin, user.division],
  )

  // Army number -> user map
  const armyNumberMap = useMemo(() => new Map(users.map((u) => [u.armyNumber, u])), [users])

  // Single mode calculations
  const gross = earnings.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalDed = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0)
  const net = gross - totalDed

  function handleSavePayslip() {
    if (!uploadUserId) return
    const payslip: Payslip = {
      id: `PAY-${uploadUserId}-${uploadYear}-${String(uploadMonth).padStart(2, '0')}`,
      userId: uploadUserId,
      month: uploadMonth,
      year: uploadYear,
      components: [...earnings, ...deductions],
      grossPay: gross,
      totalDeductions: totalDed,
      netPay: net,
      status: uploadStatus,
      paidDate:
        uploadStatus === 'pending'
          ? null
          : `${uploadYear}-${String(uploadMonth).padStart(2, '0')}-25`,
    }
    addPayslip(payslip)
    toast.success('Payslip saved successfully')
    navigate({ to: '/admin/payroll' })
  }

  // CSV parsing
  function parseCsv(text: string): CsvRow[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    // Skip header row (lines[0])
    const dataLines = lines.slice(1)
    return dataLines
      .filter((l) => l.trim())
      .map((line) => {
        const cols = line.split(',')
        const [
          armyNumber,
          monthStr,
          yearStr,
          basic_salary,
          housing_allowance,
          transport_allowance,
          sf_allowance,
          tax_paye,
          pension_contribution,
          welfare_fund,
          status,
        ] = cols.map((c) => c.trim())

        const matchedUser = armyNumberMap.get(armyNumber)
        if (!matchedUser) {
          return {
            armyNumber,
            month: Number(monthStr),
            year: Number(yearStr),
            earnings: [],
            deductions: [],
            status: 'paid' as PayslipStatus,
            grossPay: 0,
            totalDeductions: 0,
            netPay: 0,
            valid: false,
            warning: `Unknown army number: ${armyNumber}`,
          }
        }

        const earningComponents: PayComponent[] = CSV_EARNINGS.map((key) => {
          const amtMap: Record<string, string> = {
            basic_salary,
            housing_allowance,
            transport_allowance,
            sf_allowance,
          }
          return {
            label: EARNING_LABELS[key],
            amount: Number(amtMap[key]) || 0,
            type: 'earning' as const,
          }
        }).filter((c) => c.amount > 0)

        const deductionComponents: PayComponent[] = CSV_DEDUCTIONS.map((key) => {
          const amtMap: Record<string, string> = {
            tax_paye,
            pension_contribution,
            welfare_fund,
          }
          return {
            label: DEDUCTION_LABELS[key],
            amount: Number(amtMap[key]) || 0,
            type: 'deduction' as const,
          }
        }).filter((c) => c.amount > 0)

        const grossPay = earningComponents.reduce((s, c) => s + c.amount, 0)
        const totalDeductions = deductionComponents.reduce((s, c) => s + c.amount, 0)
        const netPay = grossPay - totalDeductions

        const parsedStatus = (['paid', 'pending'] as PayslipStatus[]).includes(
          status as PayslipStatus,
        )
          ? (status as PayslipStatus)
          : 'paid'

        return {
          armyNumber,
          month: Number(monthStr),
          year: Number(yearStr),
          earnings: earningComponents,
          deductions: deductionComponents,
          status: parsedStatus,
          grossPay,
          totalDeductions,
          netPay,
          valid: true,
        }
      })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCsv(text)
      setCsvRows(rows)
      setCsvParsed(true)
    }
    reader.readAsText(file)
  }

  function handleUploadAll() {
    const validRows = csvRows.filter((r) => r.valid)
    validRows.forEach((row) => {
      const matchedUser = armyNumberMap.get(row.armyNumber)
      if (!matchedUser) return
      const payslip: Payslip = {
        id: `PAY-${matchedUser.id}-${row.year}-${String(row.month).padStart(2, '0')}`,
        userId: matchedUser.id,
        month: row.month,
        year: row.year,
        components: [...row.earnings, ...row.deductions],
        grossPay: row.grossPay,
        totalDeductions: row.totalDeductions,
        netPay: row.netPay,
        status: row.status,
        paidDate:
          row.status === 'pending'
            ? null
            : `${row.year}-${String(row.month).padStart(2, '0')}-25`,
      }
      addPayslip(payslip)
    })
    toast.success(`${validRows.length} payslip${validRows.length !== 1 ? 's' : ''} uploaded successfully`)
    navigate({ to: '/admin/payroll' })
  }

  const validCsvCount = csvRows.filter((r) => r.valid).length
  const invalidCsvCount = csvRows.filter((r) => !r.valid).length

  return (
    <div className="max-w-3xl mx-auto space-y-3">

      {/* Back link */}
      <Link
        to="/admin/payroll"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Payroll Management
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-army-dark">Upload Payslips</h1>
        <p className="text-xs text-gray-400 mt-0.5">Add single or bulk payslip records</p>
      </div>

      {/* Mode Toggle */}
      <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'single' ? 'bg-white text-army-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Single
        </button>
        <button
          onClick={() => setMode('csv')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'csv' ? 'bg-white text-army-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          CSV Bulk
        </button>
      </div>

      {/* ─── SINGLE MODE ─── */}
      {mode === 'single' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">

          {/* Personnel selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Personnel</label>
            <select
              value={uploadUserId}
              onChange={(e) => setUploadUserId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
            >
              <option value="">Select personnel…</option>
              {scopedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.armyNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Month</label>
              <select
                value={uploadMonth}
                onChange={(e) => setUploadMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Year</label>
              <select
                value={uploadYear}
                onChange={(e) => setUploadYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
              >
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Earnings */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Earnings</p>
            {earnings.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const updated = [...earnings]
                    updated[idx] = { ...updated[idx], label: e.target.value }
                    setEarnings(updated)
                  }}
                  placeholder="Label"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                />
                <input
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => {
                    const updated = [...earnings]
                    updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                    setEarnings(updated)
                  }}
                  placeholder="0"
                  className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-right focus:outline-none focus:border-army-gold/40"
                />
                {earnings.length > 1 && (
                  <button
                    onClick={() => setEarnings(earnings.filter((_, i) => i !== idx))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setEarnings([...earnings, { label: '', amount: 0, type: 'earning' }])}
              className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold mt-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add earning
            </button>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deductions</p>
            {deductions.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const updated = [...deductions]
                    updated[idx] = { ...updated[idx], label: e.target.value }
                    setDeductions(updated)
                  }}
                  placeholder="Label"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                />
                <input
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => {
                    const updated = [...deductions]
                    updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                    setDeductions(updated)
                  }}
                  placeholder="0"
                  className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-right focus:outline-none focus:border-army-gold/40"
                />
                {deductions.length > 1 && (
                  <button
                    onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setDeductions([...deductions, { label: '', amount: 0, type: 'deduction' }])}
              className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold mt-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add deduction
            </button>
          </div>

          {/* Auto-calculated summary */}
          <div className="bg-army-dark/5 rounded-xl px-4 py-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Gross Pay</span>
              <span className="font-mono font-semibold">₦{gross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Total Deductions</span>
              <span className="font-mono font-semibold text-red-500">-₦{totalDed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-army-dark mt-2 pt-2 border-t border-gray-200">
              <span>Net Pay</span>
              <span className="font-mono">₦{net.toLocaleString()}</span>
            </div>
          </div>

          {/* Status pills */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <div className="flex gap-2">
              {(['paid', 'pending'] as PayslipStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setUploadStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
                    uploadStatus === s
                      ? s === 'paid'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSavePayslip}
              disabled={!uploadUserId || gross <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Save Payslip
            </button>
          </div>

        </div>
      )}

      {/* ─── CSV BULK MODE ─── */}
      {mode === 'csv' && (
        <div className="space-y-3">

          {/* Upload area */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-army-dark flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-army-gold" />
                  CSV Bulk Upload
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload a CSV file to add multiple payslips at once
                </p>
              </div>
              <a
                href="/samples/payslip-bulk-sample.csv"
                download
                className="inline-flex items-center gap-1.5 text-xs text-army font-semibold hover:text-army-gold transition-colors shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Download sample CSV
              </a>
            </div>

            {/* Expected format note */}
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expected columns</p>
              <p className="text-[11px] font-mono text-gray-500 break-all leading-relaxed">
                army_number, month, year, basic_salary, housing_allowance, transport_allowance, sf_allowance, tax_paye, pension_contribution, welfare_fund, status, discrepancy_note
              </p>
            </div>

            {/* File input */}
            <label className="block">
              <div className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors ${
                csvFileName ? 'border-army-gold/40 bg-army-gold/5' : 'border-gray-200 hover:border-army-gold/30'
              }`}>
                {csvFileName ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <FileSpreadsheet className="w-8 h-8 text-army-gold" />
                    <p className="text-sm font-semibold text-army-dark">{csvFileName}</p>
                    <p className="text-xs text-gray-400">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-8 h-8 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">Click to select CSV file</p>
                    <p className="text-xs text-gray-400">Accepts .csv files only</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Preview table */}
          {csvParsed && csvRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div>
                  <p className="text-sm font-bold text-army-dark">Preview</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {validCsvCount} valid · {invalidCsvCount > 0 ? `${invalidCsvCount} with warnings` : 'no issues'}
                  </p>
                </div>
                {invalidCsvCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {invalidCsvCount} row{invalidCsvCount !== 1 ? 's' : ''} will be skipped
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-y border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Army No.</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Period</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Gross</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Deductions</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Net Pay</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Valid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {csvRows.map((row, idx) => (
                      <tr key={idx} className={row.valid ? '' : 'bg-amber-50/50'}>
                        <td className="px-4 py-2.5 font-mono text-army-dark">{row.armyNumber}</td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {MONTH_NAMES[(row.month - 1)] ?? row.month} {row.year}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-right text-army-dark">
                          {row.valid ? `₦${row.grossPay.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-right text-red-500">
                          {row.valid ? `-₦${row.totalDeductions.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-right font-semibold text-army-dark">
                          {row.valid ? `₦${row.netPay.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.valid ? (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              row.status === 'paid' ? 'bg-green-50 text-green-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.valid ? (
                            <Check className="w-4 h-4 text-green-500 inline-block" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{row.warning}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload All button */}
              {validCsvCount > 0 && (
                <div className="flex justify-end px-5 py-4 border-t border-gray-100">
                  <button
                    onClick={handleUploadAll}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload All ({validCsvCount})
                  </button>
                </div>
              )}
            </div>
          )}

          {csvParsed && csvRows.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No data rows found in the CSV file</p>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
