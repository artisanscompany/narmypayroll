import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { maskSensitive } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Lock, Eye, PenLine, Shield, Fingerprint, Building2, MapPin, Phone, Calendar, ChevronRight, Wallet, MessageCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

const SENSITIVE_FIELDS = ['nin', 'bvn', 'salaryAccountNo'] as const
type SensitiveField = (typeof SENSITIVE_FIELDS)[number]

const FIELD_LABELS: Record<SensitiveField, string> = {
  nin: 'National Identification Number (NIN)',
  bvn: 'BVN',
  salaryAccountNo: 'Salary Account Number',
}

// TODO: replace with real auth flow
const DEMO_DECRYPT_PIN = '0000'

function ProfilePage() {
  const { user } = useAuth()
  const [revealedFields, setRevealedFields] = useState<Set<SensitiveField>>(new Set())
  const [decryptField, setDecryptField] = useState<SensitiveField | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  if (!user) return null

  const enlistDate = new Date(user.dateOfEnlistment)
  const now = new Date()
  const totalMonths = Math.max(0, (now.getFullYear() - enlistDate.getFullYear()) * 12 + (now.getMonth() - enlistDate.getMonth()))
  const serviceYears = Math.floor(totalMonths / 12)
  const serviceMonths = totalMonths % 12

  function handleDecryptSubmit() {
    if (code === DEMO_DECRYPT_PIN) {
      setRevealedFields((prev) => {
        const next = new Set(prev)
        next.add(decryptField!)
        return next
      })
      setDecryptField(null)
      setCode('')
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function renderSensitiveValue(field: SensitiveField, value: string) {
    const isRevealed = revealedFields.has(field)
    return (
      <button
        type="button"
        onClick={() => {
          if (isRevealed) {
            setRevealedFields((prev) => { const next = new Set(prev); next.delete(field); return next })
          } else {
            setDecryptField(field)
            setCode('')
            setCodeError(false)
          }
        }}
        className="inline-flex items-center gap-2 group/field rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-army-gold/5 transition-colors"
      >
        <span className={`font-mono text-sm transition-colors ${isRevealed ? 'text-army-dark' : 'text-gray-400'}`}>
          {isRevealed ? value : maskSensitive(value)}
        </span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid opacity-50 group-hover/field:opacity-100 transition-opacity" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-army-gold group-hover/field:text-army-gold transition-colors" />
        )}
      </button>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const serviceItems = [
    { label: 'Rank', value: user.rank },
    { label: 'Grade / Step', value: `${user.gradeLevel} – A${user.step}` },
    ...(user.personnelType === 'soldier' ? [{ label: 'Trade', value: user.trade }] : []),
    { label: 'Corps', value: user.corps },
    { label: 'Service', value: `${serviceYears}y ${serviceMonths}m` },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Page header — name + status inline */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-army-dark truncate">{user.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              user.status === 'active' ? 'bg-green-50 text-green-700' :
              user.status === 'awol' ? 'bg-red-50 text-red-700' :
              user.status === 'retired' ? 'bg-gray-100 text-gray-600' :
              'bg-orange-50 text-orange-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                user.status === 'active' ? 'bg-green-500' :
                user.status === 'awol' ? 'bg-red-500' :
                user.status === 'retired' ? 'bg-gray-400' :
                'bg-orange-500'
              }`} />
              {user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="font-mono">{user.armyNumber}</span>
            <span className="text-gray-300 mx-1.5">·</span>
            {user.division}
          </p>
        </div>
      </div>

      {/* Service summary strip — with left accent bar and dividers */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex">
          <div className="w-1.5 bg-army-gold shrink-0" />
          <div className="flex-1 px-5 py-3.5">
            <div className="flex items-center">
              {serviceItems.map(({ label, value }, i) => (
                <div key={label} className={`flex-1 min-w-0 ${i < serviceItems.length - 1 ? 'border-r border-gray-100 pr-4 mr-4' : ''}`}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                  <p className="text-sm text-army-dark font-semibold truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sensitive Identifiers */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-army-gold" />
            </div>
            <h3 className="text-sm font-bold text-army-dark">Sensitive Identifiers</h3>
          </div>
          {revealedFields.size === 0 && (
            <span className="text-[11px] text-gray-300 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Click to reveal
            </span>
          )}
        </div>
        <div className="px-3 pb-3">
          {([
            { label: 'National Identification Number (NIN)', field: 'nin' as SensitiveField, value: user.nin },
            { label: 'Bank Verification Number (BVN)', field: 'bvn' as SensitiveField, value: user.bvn },
            { label: 'Salary Account Number', field: 'salaryAccountNo' as SensitiveField, value: user.salaryAccountNo },
          ]).map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
              onClick={() => {
                if (!revealedFields.has(row.field)) {
                  setDecryptField(row.field)
                  setCode('')
                  setCodeError(false)
                }
              }}
            >
              <span className="text-xs font-medium text-gray-400">{row.label}</span>
              {renderSensitiveValue(row.field, row.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information — 2-column grid */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center">
            <Shield className="w-4 h-4 text-army" />
          </div>
          <h3 className="text-sm font-bold text-army-dark">Personal Information</h3>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {([
              { icon: Calendar, label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
              { icon: Calendar, label: 'Date of Enlistment', value: formatDate(user.dateOfEnlistment) },
              { icon: MapPin, label: 'State of Origin', value: user.stateOfOrigin },
              { icon: Phone, label: 'Phone', value: user.phone },
            ]).map((row) => (
              <div key={row.label} className="flex items-start gap-3 py-2">
                <row.icon className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{row.label}</p>
                  <p className="text-sm text-army-dark font-semibold truncate">{row.value}</p>
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 flex items-start gap-3 py-2 border-t border-gray-50 mt-1 pt-3">
              <Building2 className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Unit</p>
                <p className="text-sm text-army-dark font-semibold truncate">{user.unit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Correction CTA — dark banner like help page */}
        <div className="bg-army-dark rounded-b-xl px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Need to correct your information?</p>
            <p className="text-[11px] text-white/40">Raise a complaint ticket and our team will update your records</p>
          </div>
          <Link
            to="/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-xs font-bold hover:bg-army-gold-light transition-colors whitespace-nowrap shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            Raise Ticket
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/pay" className="group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-army-gold/20 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-army-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-army-dark">Pay & Documents</p>
            <p className="text-[11px] text-gray-400">Payslips & certificates</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
        </Link>
        <Link to="/complaints" className="group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-army-gold/20 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-army" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-army-dark">My Complaints</p>
            <p className="text-[11px] text-gray-400">Track & raise tickets</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
        </Link>
      </div>

      {/* Decrypt Modal */}
      <Dialog
        open={decryptField !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDecryptField(null)
            setCode('')
            setCodeError(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
            <DialogDescription>
              Enter verification code to view{' '}
              {decryptField ? FIELD_LABELS[decryptField] : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="password"
              maxLength={4}
              value={code}
              aria-label="Verification PIN"
              onChange={(e) => {
                setCode(e.target.value)
                setCodeError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDecryptSubmit()
              }}
              placeholder="0000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army transition-all"
              autoFocus
            />
            {codeError && (
              <p className="text-xs text-red-600 mt-2 text-center font-medium">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDecryptSubmit} className="bg-army-dark text-white hover:bg-army transition-colors">
              Verify & Reveal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
