import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/onboard')({
  component: OnboardPage,
})

function OnboardPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [armyNumber, setArmyNumber] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!armyNumber.trim()) {
      setError('Please enter your Army Number.')
      return
    }
    if (!tempPassword.trim()) {
      setError('Please enter the temporary password issued by your base.')
      return
    }

    const result = login(armyNumber, tempPassword)
    if (result.error || !result.user) {
      setError(result.error || 'Invalid credentials. Check your Army Number and temporary password.')
      return
    }

    if (result.user.isFirstLogin) {
      navigate({ to: '/setup' })
    } else {
      // Already set up — go to dashboard
      if (result.user.role === 'personnel') {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/admin/dashboard' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-army-cream/50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08] mx-auto mb-4">
            <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-army-dark">First-Time Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your Army Number and the temporary password issued by your base pay office.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {/* Steps overview */}
          <div className="mb-6 pb-5 border-b border-gray-100">
            <p className="text-xs font-semibold text-army-dark/50 uppercase tracking-wider mb-3">How it works</p>
            <div className="space-y-2.5">
              {[
                { step: '1', text: 'Enter your Army Number and temporary password' },
                { step: '2', text: 'Create a new personal password' },
                { step: '3', text: 'Set up your 4-digit PIN for document access' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-army/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-army">{item.step}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Army Number
              </label>
              <input
                type="text"
                value={armyNumber}
                onChange={(e) => setArmyNumber(e.target.value)}
                placeholder="e.g. NA/23/01234"
                autoComplete="username"
                className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Temporary Password
              </label>
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Password from your base pay office"
                autoComplete="current-password"
                className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
              />
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
              Continue to Setup
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo: Use army number <span className="font-mono">NA/15/05678</span> with password <span className="font-mono">demo1234</span>
        </p>
      </div>
    </div>
  )
}
