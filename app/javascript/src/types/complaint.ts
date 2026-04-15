export type ComplaintStatus = 'open' | 'review' | 'action-required' | 'resolved' | 'closed'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TimelineEvent {
  id: string
  timestamp: string
  type: 'status-change' | 'note' | 'escalation' | 'submission'
  description: string
  actor: string
  newStatus?: ComplaintStatus
}

export interface Category {
  id: string
  label: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  label: string
}

export interface VoiceRecording {
  id: string
  dataUrl: string
  duration: number
  recordedAt: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  source?: 'submission' | 'response'
  uploadedAt?: string
}

export interface Complaint {
  id: string
  userId: string
  userName: string
  userArmyNumber: string
  userDivision: string
  category: string
  subcategory: string
  description: string
  status: ComplaintStatus
  priority: ComplaintPriority
  filedDate: string
  lastUpdated: string
  timeline: TimelineEvent[]
  slaDeadline: string
  attachments?: Attachment[]
  voiceRecording?: VoiceRecording
}
