import { createFileRoute } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import type { UserRole } from '#/types/user'

export const Route = createFileRoute('/_authenticated/admin/rbac')({
  component: AdminRBAC,
})

interface Permission {
  action: string
  description: string
  roles: UserRole[]
}

const PERMISSIONS: Permission[] = [
  { action: 'View Own Tickets', description: 'View complaints filed by the user', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'File Ticket', description: 'Submit a new complaint or grievance', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'View Own Payslips', description: 'Access personal payslip records', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'View Division Tickets', description: 'View all tickets in own division', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Update Ticket Status', description: 'Change status of tickets in scope', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Add Notes to Tickets', description: 'Add admin notes to tickets', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Escalate Tickets', description: 'Escalate tickets to higher authority', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'View Division Analytics', description: 'Access analytics for own division', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'View All Tickets', description: 'View tickets across all divisions', roles: ['superAdmin'] },
  { action: 'View System Analytics', description: 'Access system-wide analytics', roles: ['superAdmin'] },
  { action: 'Manage Users', description: 'View and manage user accounts', roles: ['superAdmin'] },
  { action: 'Change User Roles', description: 'Assign or change user roles', roles: ['superAdmin'] },
  { action: 'View RBAC Matrix', description: 'View role-based access control settings', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Upload Payslips', description: 'Upload payslip records for personnel', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Change User Status', description: 'Update service status (Active/AWOL/Suspended/Retired)', roles: ['divisionAdmin', 'superAdmin'] },
]

const ROLE_LABELS: Record<UserRole, string> = {
  personnel: 'Personnel',
  divisionAdmin: 'Division Admin',
  superAdmin: 'Super Admin',
}

const ALL_ROLES: UserRole[] = ['personnel', 'divisionAdmin', 'superAdmin']

function AdminRBAC() {
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div>
        <h1 className="text-2xl font-bold text-army-dark">Role-Based Access Control</h1>
        <p className="text-sm text-gray-400 mt-0.5">Permission matrix for all system roles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-gray-300 shrink-0" />
            <div className="flex-1 px-4 py-3.5">
              <p className="text-sm font-bold text-army-dark mb-0.5">Personnel</p>
              <p className="text-xs text-gray-400">Regular army personnel who can file complaints, view their own tickets and payslips.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-army-gold shrink-0" />
            <div className="flex-1 px-4 py-3.5">
              <p className="text-sm font-bold text-army-dark mb-0.5">Division Admin</p>
              <p className="text-xs text-gray-400">Division-level administrators who manage tickets, view analytics, and escalate issues within their division.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-army shrink-0" />
            <div className="flex-1 px-4 py-3.5">
              <p className="text-sm font-bold text-army-dark mb-0.5">Super Admin</p>
              <p className="text-xs text-gray-400">System-wide administrators with full access to all divisions, user management, and system analytics.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Permission</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{ROLE_LABELS[role]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm) => (
              <tr key={perm.action} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <p className="text-sm font-medium text-army-dark">{perm.action}</p>
                  <p className="text-[11px] text-gray-400">{perm.description}</p>
                </td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="px-4 py-2.5 text-center">
                    {perm.roles.includes(role)
                      ? <Check className="w-4 h-4 text-green-600 mx-auto" />
                      : <X className="w-4 h-4 text-gray-200 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
