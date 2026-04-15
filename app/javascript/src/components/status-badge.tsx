import type { ComplaintStatus } from '#/types/complaint'

const statusConfig: Record<ComplaintStatus, { label: string; dot: string; bg: string; text: string }> = {
  open: { label: 'Open', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
  review: { label: 'In Review', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
  'action-required': { label: 'Action Required', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700' },
  resolved: { label: 'Resolved', dot: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-700' },
  closed: { label: 'Closed', dot: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-500' },
}

export function StatusBadge({ status, fixed }: { status: ComplaintStatus; fixed?: boolean }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${config.bg} ${config.text} ${fixed ? 'w-22.5 justify-center' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
