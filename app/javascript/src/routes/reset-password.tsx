import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [armyNumber, setArmyNumber] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!armyNumber.trim()) {
      setError('Please enter your Army Number.')
      return
    }

    const result = requestPasswordReset(armyNumber.trim())
    if (result.error) {
      setError(result.error)
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08] mb-4">
            <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-10 h-10 drop-shadow-[0_0_6px_rgba(200,168,75,0.25)]" />
          </div>
          <h1 className="text-army-dark text-2xl font-bold tracking-tight">Password Reset</h1>
          <p className="text-army-dark/40 text-sm mt-1">
            Request a new password from your administrator
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white border border-army-sand/60 rounded-xl p-6">
              <p className="text-army-dark/50 text-sm mb-6">
                Enter your Army Number below. An administrator will process your request and provide a new password through your base pay office.
              </p>

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
                  className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
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

            <button
              type="submit"
              className="w-full bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all shadow-lg shadow-army-dark/20"
            >
              Submit Request
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-army-dark/40 hover:text-army-dark/60 transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="bg-white border border-army-sand/60 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-army-dark font-semibold text-lg mb-2">Request Submitted</h2>
              <p className="text-army-dark/50 text-sm leading-relaxed">
                Your password reset request has been sent to an administrator. You will receive your new password through your base pay office.
              </p>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-sm text-army-dark/40 hover:text-army-dark/60 transition-colors">
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
