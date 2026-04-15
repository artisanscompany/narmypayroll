import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { COMPLAINT_CATEGORIES } from '#/data/categories'
import { Textarea } from '#/components/ui/textarea'
import { Paperclip, X, File, FileImage, Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import type { Complaint, Attachment, VoiceRecording } from '#/types/complaint'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ComplaintForm() {
  const { user } = useAuth()
  const { addComplaint } = useData()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  if (!user) return null

  const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === categoryId)
  const showSubcategory = categoryId === 'pay' && selectedCategory && selectedCategory.subcategories.length > 0

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) return
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
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
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  // Voice recording handlers
  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          setVoiceRecording({
            id: `vr-${Date.now()}`,
            dataUrl: reader.result as string,
            duration: recordingDuration,
            recordedAt: new Date().toISOString(),
          })
        }
        reader.readAsDataURL(blob)
        stopAllTracks()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      setVoiceRecording(null)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch {
      // User denied mic access or not available
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setVoiceRecording(null)
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (!voiceRecording) return
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }
    const audio = new Audio(voiceRecording.dataUrl)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    audio.play()
    setIsPlaying(true)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks()
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) audioRef.current.pause()
    }
  }, [stopAllTracks])

  const getAutoPriority = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (categoryId === 'pay') return 'high'
    return 'medium'
  }

  const canSubmit = categoryId && (categoryId !== 'pay' || subcategoryId) && description.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    const year = new Date().getFullYear()
    const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()
    const complaint: Complaint = {
      id: `TKT-${year}-${uid}`,
      userId: user.id,
      userName: user.name,
      userArmyNumber: user.armyNumber,
      userDivision: user.division,
      category: selectedCategory?.label ?? '',
      subcategory: selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.label ?? '',
      description,
      status: 'open',
      priority: getAutoPriority(),
      filedDate: now,
      lastUpdated: now,
      slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: now,
          type: 'submission',
          description: `Inquiry submitted via Personnel Portal.${attachments.length > 0 ? ` ${attachments.length} file${attachments.length > 1 ? 's' : ''} attached.` : ''}${voiceRecording ? ' Voice recording attached.' : ''}`,
          actor: user.name,
        },
      ],
      attachments: attachments.length > 0 ? attachments.map(a => ({ ...a, source: 'submission' as const, uploadedAt: now })) : undefined,
      voiceRecording: voiceRecording ?? undefined,
    }
    addComplaint(complaint)
    navigate({ to: '/complaints/$complaintId', params: { complaintId: complaint.id } })
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-army-dark mb-1">New Inquiry</h2>
        <p className="text-sm text-gray-500">Provide the details of your inquiry below</p>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Category</label>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId('') }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        >
          <option value="">Select a category...</option>
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Subcategory — only for Pay */}
      {showSubcategory && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Subcategory</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
          >
            <option value="">Select a subcategory...</option>
            {selectedCategory?.subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Description</label>
        <Textarea
          placeholder="Describe your inquiry in detail. Include dates, reference numbers, and any supporting information..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="resize-none rounded-xl border-gray-200 focus:ring-army/15 focus:border-army/30"
        />
      </div>

      {/* File Attachments */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Attachments</label>

        {attachments.length > 0 && (
          <div className="space-y-2 mb-3">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5">
                {isImage(att.type) ? (
                  <img src={att.dataUrl} alt={att.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5 text-red-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-army-dark truncate">{att.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                </div>
                <button onClick={() => removeAttachment(att.id)} className="text-gray-500 hover:text-red-500 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center transition-all group cursor-pointer ${
            isDragging ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army/30 hover:bg-army/2'
          }`}
        >
          <Paperclip className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isDragging ? 'text-army' : 'text-gray-300 group-hover:text-army'}`} />
          <p className={`text-sm transition-colors ${isDragging ? 'text-army-dark' : 'text-gray-500 group-hover:text-army-dark'}`}>
            {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">PDF or images, max 20MB each</p>
        </div>
      </div>

      {/* Voice Recording */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Voice Recording</label>

        {!voiceRecording && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-army/30 hover:text-army-dark transition-all"
          >
            <Mic className="w-4 h-4" />
            Record voice note
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-700">Recording {formatDuration(recordingDuration)}</span>
            <button
              type="button"
              onClick={stopRecording}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          </div>
        )}

        {voiceRecording && !isRecording && (
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-army flex items-center justify-center shrink-0 hover:bg-army-dark transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-army-dark">Voice recording</p>
              <p className="text-xs text-gray-500">{formatDuration(voiceRecording.duration)}</p>
            </div>
            <button
              type="button"
              onClick={() => { deleteRecording(); }}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { deleteRecording(); startRecording(); }}
              className="text-xs text-gray-500 hover:text-army transition-colors shrink-0"
            >
              Re-record
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-6 py-3 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Inquiry
        </button>
      </div>
    </div>
  )
}
