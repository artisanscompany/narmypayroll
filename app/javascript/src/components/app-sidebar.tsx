import { Link, useMatchRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
} from '#/components/ui/sidebar'
import { LayoutDashboard, Wallet, MessageCircle, HelpCircle, Ticket, BarChart3, Users, Shield, LogOut, UserRound, Banknote } from 'lucide-react'

const personnelItems = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', to: '/profile', icon: UserRound },
  { label: 'Pay Slips', to: '/pay', icon: Wallet },
  { label: 'Inquiries', to: '/complaints', icon: MessageCircle },
  { label: 'Help Center', to: '/help', icon: HelpCircle },
]

const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', to: '/admin/tickets', icon: Ticket },
  { label: 'Payroll', to: '/admin/payroll', icon: Banknote },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'RBAC', to: '/admin/rbac', icon: Shield },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const matchRoute = useMatchRoute()

  if (!user) return null

  const items = user.role === 'personnel' ? personnelItems : adminItems

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-army-gold/10 border border-army-gold/25 flex items-center justify-center shadow-inner shadow-army-gold/5">
            <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-7 h-7 drop-shadow-[0_0_3px_rgba(200,168,75,0.3)]" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.2em] text-white">Nigeria Army</div>
            <div className="text-[10px] tracking-wider text-white/40 uppercase">
              {user.role === 'personnel' ? 'Pay Self-Service' : 'Admin Console'}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {items.map((item) => {
                const isActive = matchRoute({ to: item.to, fuzzy: true })
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={!!isActive} className={isActive ? 'bg-white/[0.12] text-white font-semibold' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}>
                      <Link to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative">
                        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-army-gold" />}
                        <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-army-gold' : ''}`} />
                        <span className="text-[13px] flex-1">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.08] px-3 py-3">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-9 h-9 bg-linear-to-br from-army-mid to-army rounded-lg flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-semibold truncate">{user.name}</div>
            <div className="text-white/30 text-[10px] font-mono truncate">{user.armyNumber}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 text-white/35 hover:text-red-400 text-xs w-full px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
