import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'

interface NotificationItem {
  label: string
  count: number
}

export function NotificationBell() {
  const { user, resetRequests } = useAuth()
  const { complaints } = useData()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!user) return null

  const items: NotificationItem[] = []

  if (user.role === 'personnel') {
    const userComplaints = complaints.filter((c) => c.userId === user.id)
    const awaitingFeedback = userComplaints.filter((c) => c.status === 'resolved').length
    const needsResponse = userComplaints.filter((c) => c.status === 'action-required').length

    if (awaitingFeedback > 0) items.push({ label: 'Awaiting your feedback', count: awaitingFeedback })
    if (needsResponse > 0) items.push({ label: 'Needs your response', count: needsResponse })
  } else {
    const pendingResets = resetRequests.filter((r) => r.status === 'pending').length
    const openTickets = complaints.filter((c) => !['resolved', 'closed'].includes(c.status)).length

    if (pendingResets > 0) items.push({ label: 'Pending password resets', count: pendingResets })
    if (openTickets > 0) items.push({ label: 'Open tickets', count: openTickets })
  }

  const totalCount = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-army-dark hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-army-dark">Notifications</h4>
          </div>
          {items.length > 0 ? (
            <div className="py-1">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-xs font-semibold text-white bg-red-500 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
