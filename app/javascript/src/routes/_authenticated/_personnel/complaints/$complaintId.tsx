import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { TimelineView } from '#/components/timeline-view'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { ArrowLeft, AlertTriangle, File, Download, Paperclip, Send, X, Lock, Eye, Play, Pause } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { useState, useRef } from 'react'
import type { Attachment } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/$complaintId')({
  component: ComplaintDetailPage,
})

const priorityConfig: Record<string, { label: string }> = {
  critical: { label: 'Critical' },
  high: { label: 'High' },
  medium: { label: 'Medium' },
  low: { label: 'Low' },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ComplaintDetailPage() {
  const { complaintId } = Route.useParams()
  const { user } = useAuth()
  const { complaints, addNote } = useData()
  const complaint = complaints.find((c) => c.id === complaintId)
  const [noteText, setNoteText] = useState('')
  const [noteAttachments, setNoteAttachments] = useState<Attachment[]>([])
  const noteFileRef = useRef<HTMLInputElement>(null)
  const [docsUnlocked, setDocsUnlocked] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockCode, setUnlockCode] = useState('')
  const [unlockError, setUnlockError] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  const DEMO_PIN = '0000'

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm text-gray-500 mb-3">Inquiry not found</p>
        <Link to="/complaints" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
          Back to inquiries
        </Link>
      </div>
    )
  }

  const daysOpen = differenceInDays(new Date(), new Date(complaint.filedDate))
  const isClosed = ['resolved', 'closed'].includes(complaint.status)
  const priority = priorityConfig[complaint.priority] ?? priorityConfig.medium

  const handleNoteFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) return
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
      const reader = new FileReader()
      reader.onload = () => {
        setNoteAttachments((prev) => [...prev, {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name, type: file.type, size: file.size, dataUrl: reader.result as string,
        }])
      }
      reader.readAsDataURL(file)
    })
    if (noteFileRef.current) noteFileRef.current.value = ''
  }

  const handleAddNote = () => {
    if ((!noteText.trim() && noteAttachments.length === 0) || !user) return
    const fileNames = noteAttachments.map(a => a.name).join(', ')
    const message = noteText.trim() || `Attached: ${fileNames}`
    addNote(complaintId, message, user.name, noteAttachments.length > 0 ? noteAttachments.map(a => ({ ...a, source: 'response' as const, uploadedAt: new Date().toISOString() })) : undefined)
    setNoteText('')
    setNoteAttachments([])
  }

  const toggleVoicePlayback = () => {
    if (!complaint.voiceRecording) return
    if (isPlayingVoice && voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      setIsPlayingVoice(false)
      return
    }
    const audio = new Audio(complaint.voiceRecording.dataUrl)
    voiceAudioRef.current = audio
    audio.onended = () => setIsPlayingVoice(false)
    audio.play()
    setIsPlayingVoice(true)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        All inquiries
      </Link>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
          <StatusBadge status={complaint.status} />
        </div>
        <h1 className="text-xl font-bold text-army-dark mb-1">{complaint.subcategory || complaint.category}</h1>
        <p className="text-sm text-gray-500">{complaint.category}</p>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Filed', value: format(new Date(complaint.filedDate), 'd MMM yyyy') },
          { label: 'Priority', value: priority.label, color: complaint.priority === 'critical' ? 'text-red-600' : complaint.priority === 'high' ? 'text-amber-600' : undefined },
          { label: 'Open', value: `${daysOpen} days` },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${color ?? 'text-army-dark'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>
      </div>

      {/* Voice Recording Playback */}
      {complaint.voiceRecording && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Voice Recording</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoicePlayback}
              className="w-8 h-8 rounded-full bg-army flex items-center justify-center shrink-0 hover:bg-army-dark transition-colors"
            >
              {isPlayingVoice ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
            </button>
            <div>
              <p className="text-sm font-medium text-army-dark">Voice recording</p>
              <p className="text-xs text-gray-500">{formatDuration(complaint.voiceRecording.duration)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attachments — encrypted at rest */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Attachments {complaint.attachments && complaint.attachments.length > 0 ? `(${complaint.attachments.length})` : ''}
            </h3>
            {complaint.attachments && complaint.attachments.length > 0 && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${docsUnlocked ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {docsUnlocked ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {docsUnlocked ? 'Unlocked' : 'Encrypted'}
              </span>
            )}
          </div>
          {complaint.attachments && complaint.attachments.length > 0 && !docsUnlocked && (
            <button
              onClick={() => { setShowUnlockModal(true); setUnlockCode(''); setUnlockError(false) }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-army-gold hover:text-army-gold-light transition-colors"
            >
              <Lock className="w-3 h-3" />
              Unlock to view
            </button>
          )}
          {docsUnlocked && (
            <button
              onClick={() => setDocsUnlocked(false)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-600 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Re-lock
            </button>
          )}
        </div>

        {complaint.attachments && complaint.attachments.length > 0 ? (
          docsUnlocked ? (
            <div className="space-y-2">
              {complaint.attachments.map((att) => {
                const isImg = att.type.startsWith('image/')
                const isResponse = att.source === 'response'
                return (
                  <div key={att.id} className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 ${isResponse ? 'border-army-gold/20 bg-army-gold/3' : 'border-gray-100'}`}>
                    {isImg ? (
                      <img src={att.dataUrl} alt={att.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-army-dark truncate">{att.name}</p>
                        {isResponse && (
                          <span className="text-[10px] font-medium text-army-gold bg-army-gold/10 px-1.5 py-0.5 rounded shrink-0">Response</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {att.uploadedAt ? format(new Date(att.uploadedAt), "d MMM yyyy · HH:mm") : 'Uploaded with submission'}
                      </p>
                    </div>
                    <a href={att.dataUrl} download={att.name} className="text-gray-500 hover:text-army transition-colors shrink-0">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Locked state — blurred placeholders */
            <div className="space-y-2">
              {complaint.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => { setShowUnlockModal(true); setUnlockCode(''); setUnlockError(false) }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 truncate">{att.name.replace(/[a-zA-Z0-9]/g, (c, i) => i > 4 && i < att.name.lastIndexOf('.') ? '*' : c)}</p>
                    <p className="text-xs text-gray-300">Encrypted — enter PIN to view</p>
                  </div>
                  <Lock className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <Paperclip className="w-3.5 h-3.5" />
            <p className="text-xs">No attachments</p>
          </div>
        )}
      </div>

      {/* Unlock Modal */}
      <Dialog open={showUnlockModal} onOpenChange={(open) => { if (!open) { setShowUnlockModal(false); setUnlockCode(''); setUnlockError(false) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decrypt Attachments</DialogTitle>
            <DialogDescription>
              Attachments are encrypted at rest. Enter your verification PIN to decrypt and view.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="password"
              maxLength={4}
              value={unlockCode}
              aria-label="Verification PIN"
              onChange={(e) => { setUnlockCode(e.target.value); setUnlockError(false) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (unlockCode === DEMO_PIN) {
                    setDocsUnlocked(true)
                    setShowUnlockModal(false)
                    setUnlockCode('')
                  } else {
                    setUnlockError(true)
                  }
                }
              }}
              placeholder="0000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army transition-all"
              autoFocus
            />
            {unlockError && (
              <p className="text-xs text-red-600 mt-2 text-center font-medium">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (unlockCode === DEMO_PIN) {
                  setDocsUnlocked(true)
                  setShowUnlockModal(false)
                  setUnlockCode('')
                } else {
                  setUnlockError(true)
                }
              }}
              className="bg-army-dark text-white hover:bg-army transition-colors"
            >
              Decrypt & View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline + Reply */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Activity</h3>
        <TimelineView events={[...complaint.timeline].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())} filerName={complaint.userName} />

        {/* Add response */}
        {!isClosed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Add Response</p>
            {complaint.status === 'action-required' && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">Action Required</p>
                  <p className="text-xs text-orange-600 mt-0.5">Admin has requested more information. Please respond below.</p>
                </div>
              </div>
            )}
            <textarea
              placeholder="Provide additional information, upload supporting documents, or respond to a request..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all resize-none mb-3"
            />

            {/* Attached files */}
            {noteAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {noteAttachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                    {att.type.startsWith('image/') ? (
                      <img src={att.dataUrl} alt={att.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <File className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs text-army-dark font-medium truncate max-w-32">{att.name}</span>
                    <button onClick={() => setNoteAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-gray-500 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <input ref={noteFileRef} type="file" accept="image/*,.pdf" multiple onChange={handleNoteFileSelect} className="hidden" />
                <button
                  onClick={() => noteFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Attach file
                </button>
              </div>
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() && noteAttachments.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
