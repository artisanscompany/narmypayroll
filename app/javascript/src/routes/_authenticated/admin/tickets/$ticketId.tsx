import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { TimelineView } from '#/components/timeline-view'
import { differenceInDays, format } from 'date-fns'
import { useState, useRef } from 'react'
import { ArrowLeft, AlertTriangle, Send, Paperclip, X, File, Download, User as UserIcon, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import type { ComplaintStatus, Attachment } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/admin/tickets/$ticketId')({
  component: AdminTicketDetail,
})

const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  open: ['review', 'action-required', 'resolved'],
  review: ['action-required', 'resolved'],
  'action-required': ['review', 'resolved'],
  resolved: ['closed'],
  closed: [],
}

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Open',
  review: 'In Review',
  'action-required': 'Action Required',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function AdminTicketDetail() {
  const { ticketId } = Route.useParams()
  const { user } = useAuth()
  const { complaints, updateComplaintStatus, addNote } = useData()
  const [noteText, setNoteText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('')
  const [noteAttachments, setNoteAttachments] = useState<Attachment[]>([])
  const noteFileRef = useRef<HTMLInputElement>(null)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  const ticket = complaints.find((c) => c.id === ticketId)

  if (!user) return null

  // Division admin scope check
  if (ticket && user.role === 'divisionAdmin' && ticket.userDivision !== user.division) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-sm text-gray-400 mb-3">You do not have access to this ticket</p>
        <Link to="/admin/tickets" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
          Back to tickets
        </Link>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-sm text-gray-400 mb-3">Ticket not found</p>
        <Link to="/admin/tickets" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
          Back to tickets
        </Link>
      </div>
    )
  }

  const daysOpen = differenceInDays(new Date(), new Date(ticket.filedDate))
  const daysLeft = differenceInDays(new Date(ticket.slaDeadline), new Date())
  const slaBreach = daysLeft < 0
  const availableStatuses = STATUS_TRANSITIONS[ticket.status] ?? []
  const isClosed = ticket.status === 'closed'
  const canRequestInfo = availableStatuses.includes('action-required')

  const sortedTimeline = [...ticket.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  const handleNoteFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = () => {
        setNoteAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
    if (noteFileRef.current) noteFileRef.current.value = ''
  }

  const handleAddNote = () => {
    if ((!noteText.trim() && noteAttachments.length === 0) || !user) return
    const attachmentsWithMeta: Attachment[] = noteAttachments.map((a) => ({
      ...a,
      source: 'response' as const,
      uploadedAt: new Date().toISOString(),
    }))
    const fileNames = attachmentsWithMeta.map(a => a.name).join(', ')
    const message = noteText.trim() || (attachmentsWithMeta.length > 0 ? `Attached: ${fileNames}` : '')
    if (!message) return
    addNote(ticket.id, message, user.name, attachmentsWithMeta.length > 0 ? attachmentsWithMeta : undefined)
    setNoteText('')
    setNoteAttachments([])
    toast.success('Response added')
  }

  const handleStatusChange = () => {
    if (!selectedStatus || !user) return
    updateComplaintStatus(ticket.id, selectedStatus, user.name, noteText || `Status changed to ${selectedStatus}`)
    setSelectedStatus('')
    setNoteText('')
    setNoteAttachments([])
    toast.success(`Status updated to ${STATUS_LABELS[selectedStatus]}`)
  }

  const handleRequestInfo = () => {
    if (!user) return
    updateComplaintStatus(ticket.id, 'action-required', user.name, noteText || 'Please provide additional information regarding: ')
    setNoteText('')
    setNoteAttachments([])
    toast.success('Information requested from filer')
  }

  const toggleVoicePlayback = () => {
    if (!ticket.voiceRecording) return
    if (isPlayingVoice && voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      setIsPlayingVoice(false)
      return
    }
    const audio = new Audio(ticket.voiceRecording.dataUrl)
    voiceAudioRef.current = audio
    audio.onended = () => setIsPlayingVoice(false)
    audio.play()
    setIsPlayingVoice(true)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Back link */}
      <Link
        to="/admin/tickets"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to tickets
      </Link>

      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
          <StatusBadge status={ticket.status} />
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              ticket.priority === 'critical'
                ? 'bg-red-100 text-red-700'
                : ticket.priority === 'high'
                  ? 'bg-orange-100 text-orange-700'
                  : ticket.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
            }`}
          >
            {ticket.priority}
          </span>
        </div>
        <h1 className="text-xl font-bold text-army-dark mb-1">{ticket.subcategory || ticket.category}</h1>
        <p className="text-sm text-gray-400">{ticket.category}</p>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Filed', value: format(new Date(ticket.filedDate), 'd MMM yyyy') },
          {
            label: 'Priority',
            value: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
            color:
              ticket.priority === 'critical'
                ? 'text-red-600'
                : ticket.priority === 'high'
                  ? 'text-amber-600'
                  : undefined,
          },
          { label: 'Days Open', value: `${daysOpen} days` },
          {
            label: 'SLA',
            value: slaBreach ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`,
            color: slaBreach ? 'text-red-600' : 'text-green-600',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${color ?? 'text-army-dark'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* SLA breach alert */}
      {slaBreach && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">
            SLA exceeded by {Math.abs(daysLeft)} days. This ticket requires immediate attention.
          </p>
        </div>
      )}

      {/* Filer info card */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center shrink-0">
            <UserIcon className="w-4 h-4 text-army" />
          </div>
          <h3 className="text-sm font-bold text-army-dark">Filer Details</h3>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Name</dt>
            <dd className="font-semibold text-army-dark">{ticket.userName}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Army Number</dt>
            <dd className="font-semibold text-army-dark">{ticket.userArmyNumber}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Division</dt>
            <dd className="font-semibold text-army-dark">{ticket.userDivision}</dd>
          </div>
        </dl>
        <Link
          to="/admin/users/$userId"
          params={{ userId: ticket.userId }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-army hover:text-army-gold transition-colors mt-3"
        >
          View full profile →
        </Link>
      </div>

      {/* Description card */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Voice Recording Playback */}
      {ticket.voiceRecording && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Voice Recording</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoicePlayback}
              className="w-8 h-8 rounded-full bg-army flex items-center justify-center shrink-0 hover:bg-army-dark transition-colors"
            >
              {isPlayingVoice ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
            </button>
            <div>
              <p className="text-sm font-medium text-army-dark">Voice recording</p>
              <p className="text-xs text-gray-500">{formatDuration(ticket.voiceRecording.duration)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attachments card */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Attachments ({ticket.attachments.length})
          </h3>
          <div>
            {ticket.attachments.map((att) => {
              const isImg = att.type.startsWith('image/')
              return (
                <div key={att.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
                  {isImg ? (
                    <img src={att.dataUrl} alt={att.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <File className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-army-dark truncate">{att.name}</p>
                    <p className="text-xs text-gray-400">{(att.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {att.source && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        att.source === 'response'
                          ? 'bg-army-gold/10 text-army-gold'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {att.source === 'response' ? 'Response' : 'Submission'}
                    </span>
                  )}
                  <a
                    href={att.dataUrl}
                    download={att.name}
                    className="text-gray-400 hover:text-army transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activity</h3>
        <TimelineView events={sortedTimeline} filerName={ticket.userName} />
      </div>

      {/* Admin response section */}
      {!isClosed && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-sm font-bold text-army-dark mb-3">Respond</p>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="Type your response, note, or action..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
          />

          {/* Attachment preview */}
          {noteAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {noteAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-600"
                >
                  {att.type.startsWith('image/') ? (
                    <img src={att.dataUrl} alt={att.name} className="w-5 h-5 rounded object-cover" />
                  ) : (
                    <File className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className="truncate max-w-32">{att.name}</span>
                  <button
                    onClick={() => setNoteAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3">
            {/* Left: attach + add response */}
            <div className="flex items-center gap-3">
              <input
                ref={noteFileRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleNoteFileSelect}
                className="hidden"
              />
              <button
                onClick={() => noteFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Attach file
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() && noteAttachments.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-army-gold-light transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Add Response
              </button>
            </div>

            {/* Right: request info, status change */}
            <div className="flex items-center gap-2">
              {canRequestInfo && (
                <button
                  onClick={handleRequestInfo}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  Request Info
                </button>
              )}

              {availableStatuses.length > 0 && (
                <>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <option value="">Change status...</option>
                    {availableStatuses.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusChange}
                    disabled={!selectedStatus}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-army-dark text-white hover:bg-army-dark/90 disabled:opacity-40 transition-colors"
                  >
                    Update
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
