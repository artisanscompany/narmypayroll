export type UserRole = 'personnel' | 'divisionAdmin' | 'superAdmin'
export type PersonnelType = 'officer' | 'soldier'
export type ServiceStatus = 'active' | 'awol' | 'retired' | 'suspended'

export interface User {
  id: string
  name: string
  armyNumber: string
  salaryAccountNo: string
  role: UserRole
  personnelType: PersonnelType | null
  rank: string
  gradeLevel: string
  step: number
  corps: string
  division: string
  status: ServiceStatus
  dateOfEnlistment: string
  trade: string
  nin: string
  bvn: string
  dateOfBirth: string
  stateOfOrigin: string
  phone: string
  unit: string
  password: string
  pin: string | null
  isFirstLogin: boolean
  sessionToken: string | null
}

export interface PasswordResetRequest {
  id: string
  userId: string
  armyNumber: string
  userName: string
  requestedAt: string
  status: 'pending' | 'completed'
}
