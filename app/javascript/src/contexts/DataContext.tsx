import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { SEED_COMPLAINTS } from '#/data/complaints'
import { PAYSLIPS } from '#/data/payslips'
import { DEMO_USERS } from '#/data/users'
import { loadFromStorage, saveToStorage } from '#/lib/localStorage'
import type { Complaint, ComplaintStatus, TimelineEvent, Attachment } from '#/types/complaint'
import type { Payslip } from '#/types/payslip'
import type { User, UserRole, ServiceStatus } from '#/types/user'

interface DataContextValue {
  complaints: Complaint[]
  payslips: Payslip[]
  users: User[]
  addComplaint: (complaint: Complaint) => void
  updateComplaintStatus: (complaintId: string, newStatus: ComplaintStatus, actor: string, note: string) => void
  addNote: (complaintId: string, note: string, actor: string, attachments?: Attachment[]) => void
  updateUserRole: (userId: string, newRole: UserRole) => void
  addPayslip: (payslip: Payslip) => void
  updatePayslip: (payslipId: string, updates: Partial<Payslip>) => void
  updateUserStatus: (userId: string, newStatus: ServiceStatus) => void
  getComplaintsForUser: (userId: string) => Complaint[]
  getComplaintsForDivision: (division: string) => Complaint[]
  getPayslipsForUser: (userId: string) => Payslip[]
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    loadFromStorage('complaints', SEED_COMPLAINTS),
  )
  const [payslips, setPayslips] = useState<Payslip[]>(() => loadFromStorage('payslips', PAYSLIPS))
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', DEMO_USERS))

  const persistComplaints = useCallback((updated: Complaint[]) => {
    setComplaints(updated)
    saveToStorage('complaints', updated)
  }, [])

  const addComplaint = useCallback(
    (complaint: Complaint) => {
      const updated = [complaint, ...complaints]
      persistComplaints(updated)
    },
    [complaints],
  )

  const updateComplaintStatus = useCallback(
    (complaintId: string, newStatus: ComplaintStatus, actor: string, note: string) => {
      const updated = complaints.map((c) => {
        if (c.id !== complaintId) return c
        const event: TimelineEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'status-change',
          description: note,
          actor,
          newStatus,
        }
        return { ...c, status: newStatus, lastUpdated: event.timestamp, timeline: [...c.timeline, event] }
      })
      persistComplaints(updated)
    },
    [complaints],
  )

  const addNote = useCallback(
    (complaintId: string, note: string, actor: string, noteAttachments?: Attachment[]) => {
      const updated = complaints.map((c) => {
        if (c.id !== complaintId) return c
        const event: TimelineEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'note',
          description: note,
          actor,
        }
        const existingAttachments = c.attachments ?? []
        const newAttachments = noteAttachments && noteAttachments.length > 0
          ? [...existingAttachments, ...noteAttachments]
          : existingAttachments
        return {
          ...c,
          lastUpdated: event.timestamp,
          timeline: [...c.timeline, event],
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
        }
      })
      persistComplaints(updated)
    },
    [complaints],
  )

  const updateUserRole = useCallback(
    (userId: string, newRole: UserRole) => {
      const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      setUsers(updated)
      saveToStorage('users', updated)
    },
    [users],
  )

  const addPayslip = useCallback(
    (payslip: Payslip) => {
      // Replace existing payslip for same user/month/year, or add new
      const exists = payslips.some(p => p.userId === payslip.userId && p.month === payslip.month && p.year === payslip.year)
      const updated = exists
        ? payslips.map(p => (p.userId === payslip.userId && p.month === payslip.month && p.year === payslip.year) ? payslip : p)
        : [payslip, ...payslips]
      setPayslips(updated)
      saveToStorage('payslips', updated)
    },
    [payslips],
  )

  const updatePayslip = useCallback(
    (payslipId: string, updates: Partial<Payslip>) => {
      const updated = payslips.map((p) => (p.id === payslipId ? { ...p, ...updates } : p))
      setPayslips(updated)
      saveToStorage('payslips', updated)
    },
    [payslips],
  )

  const updateUserStatus = useCallback(
    (userId: string, newStatus: ServiceStatus) => {
      const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      setUsers(updated)
      saveToStorage('users', updated)
    },
    [users],
  )

  const getComplaintsForUser = useCallback(
    (userId: string) => complaints.filter((c) => c.userId === userId),
    [complaints],
  )

  const getComplaintsForDivision = useCallback(
    (division: string) => complaints.filter((c) => c.userDivision === division),
    [complaints],
  )

  const getPayslipsForUser = useCallback(
    (userId: string) => payslips.filter((p) => p.userId === userId),
    [payslips],
  )

  return (
    <DataContext.Provider
      value={{
        complaints, payslips, users,
        addComplaint, updateComplaintStatus,
        addNote, updateUserRole, addPayslip, updatePayslip, updateUserStatus,
        getComplaintsForUser, getComplaintsForDivision, getPayslipsForUser,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
