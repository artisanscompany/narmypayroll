import { AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function AWOLBanner() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-800">Your status is currently marked as AWOL</p>
        <p className="text-xs text-red-600 mt-1">
          Some services may be restricted. If this is incorrect,{' '}
          <Link to="/complaints/new" className="underline font-semibold hover:text-red-800">
            file a complaint
          </Link>{' '}
          to dispute this status.
        </p>
      </div>
    </div>
  )
}
