'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Truck, Users, MapPin, Wrench, Fuel, FileText, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Vehicle Registry', href: '/vehicles', icon: <Truck className="w-5 h-5" /> },
  { name: 'Driver Management', href: '/drivers', icon: <Users className="w-5 h-5" /> },
  { name: 'Trip Dispatcher', href: '/trips', icon: <MapPin className="w-5 h-5" /> },
  { name: 'Maintenance Logs', href: '/maintenance', icon: <Wrench className="w-5 h-5" /> },
  { name: 'Fuel & Expenses', href: '/expenses', icon: <Fuel className="w-5 h-5" /> },
  { name: 'Reports & Analytics', href: '/reports', icon: <FileText className="w-5 h-5" /> },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border pt-6 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 pb-8 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">FleetFlow</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="px-3 py-6 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
