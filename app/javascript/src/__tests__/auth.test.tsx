import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '#/contexts/AuthContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('logs in with valid credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let loginResult: ReturnType<typeof result.current.login>
    act(() => {
      loginResult = result.current.login('NA/23/01234', 'demo1234')
    })
    expect(loginResult!.user).not.toBeNull()
    expect(loginResult!.error).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.name).toBe('Captain James Adeyemi')
  })

  it('rejects invalid credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let loginResult: ReturnType<typeof result.current.login>
    act(() => {
      loginResult = result.current.login('INVALID', 'INVALID')
    })
    expect(loginResult!.user).toBeNull()
    expect(loginResult!.error).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('checks roles correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('SA/05/00123', 'demo1234')
    })
    expect(result.current.hasRole('superAdmin')).toBe(true)
    expect(result.current.hasRole('personnel')).toBe(false)
    expect(result.current.hasRole('divisionAdmin', 'superAdmin')).toBe(true)
  })

  it('logs out and clears state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => { result.current.login('NA/23/01234', 'demo1234') })
    expect(result.current.isAuthenticated).toBe(true)
    act(() => { result.current.logout() })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
