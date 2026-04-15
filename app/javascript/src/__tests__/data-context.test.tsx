import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { DataProvider, useData } from '#/contexts/DataContext'
import type { Complaint } from '#/types/complaint'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>
}

beforeEach(() => {
  localStorage.clear()
})

describe('DataContext', () => {
  it('loads seed complaints', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    expect(result.current.complaints.length).toBeGreaterThan(0)
  })

  it('adds a new complaint', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const initial = result.current.complaints.length

    const newComplaint: Complaint = {
      id: 'TKT-2026-9999',
      userId: 'user-001',
      userName: 'Captain James Adeyemi',
      userArmyNumber: 'NA/23/01234',
      userDivision: '1 Infantry Division',
      category: 'Pay & Allowances',
      subcategory: 'Delayed Payment',
      description: 'Test complaint',
      status: 'open',
      priority: 'low',
      filedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      slaDeadline: new Date().toISOString(),
      timeline: [
        { id: 'evt-test', timestamp: new Date().toISOString(), type: 'submission', description: 'Complaint submitted.', actor: 'Captain James Adeyemi' },
      ],
    }

    act(() => { result.current.addComplaint(newComplaint) })
    expect(result.current.complaints.length).toBe(initial + 1)
    expect(result.current.complaints[0].id).toBe('TKT-2026-9999')
  })

  it('updates complaint status', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const ticketId = result.current.complaints[0].id
    act(() => { result.current.updateComplaintStatus(ticketId, 'resolved', 'Test Admin', 'Issue resolved') })
    const updated = result.current.complaints.find((c) => c.id === ticketId)
    expect(updated?.status).toBe('resolved')
    expect(updated?.timeline.at(-1)?.type).toBe('status-change')
  })

  it('adds a note to a complaint', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const ticketId = result.current.complaints[0].id
    const initialTimelineLength = result.current.complaints[0].timeline.length
    act(() => { result.current.addNote(ticketId, 'Internal note for testing', 'Test Admin') })
    const updated = result.current.complaints.find((c) => c.id === ticketId)
    expect(updated?.timeline.length).toBe(initialTimelineLength + 1)
    expect(updated?.timeline.at(-1)?.type).toBe('note')
  })

  it('filters complaints by user', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const userComplaints = result.current.getComplaintsForUser('user-001')
    expect(userComplaints.every((c) => c.userId === 'user-001')).toBe(true)
  })

  it('filters payslips by user', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const payslips = result.current.getPayslipsForUser('user-001')
    expect(payslips.length).toBe(12)
    expect(payslips.every((p) => p.userId === 'user-001')).toBe(true)
  })
})
