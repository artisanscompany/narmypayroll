import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'

const IDLE_TIMEOUT = 4 * 60 * 1000 // 4 minutes until warning
const WARNING_DURATION = 60 * 1000 // 60 seconds countdown

export function SessionTimeoutManager() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showWarningRef = useRef(showWarning)

  // Keep ref in sync with state
  useEffect(() => { showWarningRef.current = showWarning }, [showWarning])

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
  }, [])

  const forceLogout = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)
    logout()
    navigate({ to: '/login' })
  }, [clearAllTimers, logout, navigate])

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true)
    setCountdown(60)

    warningTimeoutRef.current = setTimeout(() => {
      forceLogout()
    }, WARNING_DURATION)

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
  }, [forceLogout])

  const resetIdleTimer = useCallback(() => {
    if (showWarningRef.current) return
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown()
    }, IDLE_TIMEOUT)
  }, [startWarningCountdown])

  const handleStayLoggedIn = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)
    setCountdown(60)
    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown()
    }, IDLE_TIMEOUT)
  }, [clearAllTimers, startWarningCountdown])

  // Register event listeners once — stable deps via refs
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    const handleActivity = () => resetIdleTimer()

    events.forEach((event) => document.addEventListener(event, handleActivity, true))
    resetIdleTimer()

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleActivity, true))
      clearAllTimers()
    }
  }, [resetIdleTimer, clearAllTimers])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        {/* Timer icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-army-dark text-lg font-bold mb-2">Session Timeout</h2>
        <p className="text-army-dark/50 text-sm mb-4">
          Your session will expire due to inactivity.
        </p>

        {/* Countdown */}
        <div className="mb-6">
          <span className="text-3xl font-bold text-orange-600 tabular-nums">{countdown}</span>
          <span className="text-army-dark/40 text-sm ml-1">seconds remaining</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={forceLogout}
            className="flex-1 border border-army-sand text-army-dark/60 py-3 rounded-lg font-semibold text-sm hover:bg-army-sand/20 transition-all"
          >
            Sign Out
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-army-dark text-white py-3 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all shadow-lg shadow-army-dark/20"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  )
}
