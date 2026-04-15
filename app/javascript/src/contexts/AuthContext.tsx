import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { DEMO_USERS } from '#/data/users'
import { loadFromStorage, saveToStorage } from '#/lib/localStorage'
import type { User, UserRole, PasswordResetRequest } from '#/types/user'

function generateToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getStoredUsers(): User[] {
  return loadFromStorage<User[]>('users', DEMO_USERS)
}

function saveUsers(users: User[]): void {
  saveToStorage('users', users)
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (armyNumber: string, password: string) => { user: User | null; error: string | null }
  logout: () => void
  hasRole: (...roles: UserRole[]) => boolean
  completeSetup: (newPassword: string, newPin: string) => void
  resetRequests: PasswordResetRequest[]
  requestPasswordReset: (armyNumber: string) => { success: boolean; error: string | null }
  adminResetPassword: (userId: string, newPassword: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = loadFromStorage<User | null>('auth_user', null)
    if (!stored) return null
    // Validate session token matches stored user record
    const users = getStoredUsers()
    const match = users.find((u) => u.id === stored.id && u.sessionToken === stored.sessionToken)
    if (!match || !match.sessionToken) {
      // Invalid session — clear it
      saveToStorage('auth_user', null)
      return null
    }
    return match
  })

  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(() =>
    loadFromStorage<PasswordResetRequest[]>('reset_requests', []),
  )

  const login = useCallback((armyNumber: string, password: string): { user: User | null; error: string | null } => {
    const users = getStoredUsers()
    const found = users.find((u) => u.armyNumber === armyNumber)
    if (!found) {
      return { user: null, error: 'Invalid credentials. Please check your Army Number and Password.' }
    }
    if (found.password !== password) {
      return { user: null, error: 'Invalid credentials. Please check your Army Number and Password.' }
    }

    // Generate session token
    const token = generateToken()
    const updatedUser = { ...found, sessionToken: token }

    // Update user in stored users list
    const updatedUsers = users.map((u) => (u.id === found.id ? updatedUser : u))
    saveUsers(updatedUsers)

    setUser(updatedUser)
    saveToStorage('auth_user', updatedUser)
    return { user: updatedUser, error: null }
  }, [])

  const logout = useCallback(() => {
    if (user) {
      // Clear session token from stored user
      const users = getStoredUsers()
      const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, sessionToken: null } : u))
      saveUsers(updatedUsers)
    }
    setUser(null)
    saveToStorage('auth_user', null)
  }, [user])

  const completeSetup = useCallback(
    (newPassword: string, newPin: string) => {
      if (!user) return
      const users = getStoredUsers()
      const updatedUser = {
        ...user,
        password: newPassword,
        pin: newPin,
        isFirstLogin: false,
      }
      const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))
      saveUsers(updatedUsers)
      setUser(updatedUser)
      saveToStorage('auth_user', updatedUser)
    },
    [user],
  )

  const requestPasswordReset = useCallback(
    (armyNumber: string): { success: boolean; error: string | null } => {
      const users = getStoredUsers()
      const found = users.find((u) => u.armyNumber === armyNumber)
      if (!found) {
        return { success: false, error: 'Army number not found. Please check and try again.' }
      }

      // De-duplicate: if a pending request already exists, return success silently
      const existing = resetRequests.find((r) => r.armyNumber === armyNumber && r.status === 'pending')
      if (existing) {
        return { success: true, error: null }
      }

      const newRequest: PasswordResetRequest = {
        id: `reset_${Date.now()}`,
        userId: found.id,
        armyNumber: found.armyNumber,
        userName: found.name,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      }

      const updatedRequests = [...resetRequests, newRequest]
      setResetRequests(updatedRequests)
      saveToStorage('reset_requests', updatedRequests)
      return { success: true, error: null }
    },
    [resetRequests],
  )

  const adminResetPassword = useCallback(
    (userId: string, newPassword: string) => {
      const users = getStoredUsers()
      const updatedUsers = users.map((u) =>
        u.id === userId ? { ...u, password: newPassword, isFirstLogin: true, pin: null, sessionToken: null } : u,
      )
      saveUsers(updatedUsers)

      // Mark matching reset requests as completed
      const updatedRequests = resetRequests.map((r) =>
        r.userId === userId && r.status === 'pending' ? { ...r, status: 'completed' as const } : r,
      )
      setResetRequests(updatedRequests)
      saveToStorage('reset_requests', updatedRequests)
    },
    [resetRequests],
  )

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        hasRole,
        completeSetup,
        resetRequests,
        requestPasswordReset,
        adminResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
