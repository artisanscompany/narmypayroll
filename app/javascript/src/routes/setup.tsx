import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const hasSpecial = /[^A-Za-z0-9]/.test(pw)
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, pw.length >= 10].filter(Boolean).length
  if (score <= 2) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/4' }
  if (score <= 3) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

function SetupPage() {
  const { user, completeSetup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    } else if (!user.isFirstLogin) {
      navigate({ to: user.role === 'personnel' ? '/dashboard' : '/admin/dashboard' })
    }
  }, [user, navigate])

  if (!user || !user.isFirstLogin) return null

  const strength = getPasswordStrength(newPassword)

  const handlePasswordStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setStep(2)
  }

  const handlePinStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.')
      return
    }
    completeSetup(newPassword, pin)
    if (user.role === 'personnel') {
      navigate({ to: '/dashboard' })
    } else {
      navigate({ to: '/admin/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08] mb-4">
            <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-10 h-10 drop-shadow-[0_0_6px_rgba(200,168,75,0.25)]" />
          </div>
          <h1 className="text-army-dark text-2xl font-bold tracking-tight">Account Setup</h1>
          <p className="text-army-dark/40 text-sm mt-1">
            Welcome, {user.rank} {user.name.split(' ').pop()}. Please set up your account.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-army' : 'bg-army-sand'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-army' : 'bg-army-sand'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handlePasswordStep} className="space-y-5">
            <div className="bg-white border border-army-sand/60 rounded-xl p-6">
              <h2 className="text-army-dark font-semibold text-lg mb-1">Step 1: Create Password</h2>
              <p className="text-army-dark/40 text-sm mb-6">Choose a secure password for your account.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
                  />
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-army-sand/50 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all`} />
                      </div>
                      <span className="text-[11px] text-army-dark/40 mt-1 block">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-red-700 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all shadow-lg shadow-army-dark/20"
            >
              Continue to PIN Setup
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePinStep} className="space-y-5">
            <div className="bg-white border border-army-sand/60 rounded-xl p-6">
              <h2 className="text-army-dark font-semibold text-lg mb-1">Step 2: Create PIN</h2>
              <p className="text-army-dark/40 text-sm mb-6">Create a 4-digit PIN for quick actions.</p>

              <div>
                <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                  4-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  autoComplete="off"
                  className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white font-mono text-sm text-center tracking-[0.5em] placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-red-700 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                className="flex-1 border border-army-sand text-army-dark/60 py-3.5 rounded-lg font-semibold text-sm hover:bg-army-sand/20 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all shadow-lg shadow-army-dark/20"
              >
                Complete Setup
              </button>
            </div>
          </form>
        )}

        {/* Demo hint */}
        <div className="mt-8 text-center">
          <p className="text-army-dark/25 text-[11px]">
            Demo: use any password (min 6 chars) and any 4-digit PIN
          </p>
        </div>
      </div>
    </div>
  )
}
