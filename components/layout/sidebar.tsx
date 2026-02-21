'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Truck, Users, MapPin, Wrench, Fuel, FileText, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
    <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar pt-6 flex flex-col z-40">
      {/* Logo */}
      <motion.div
        className="px-6 pb-8 border-b border-white/5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Truck className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <h1 className="text-xl font-bold text-foreground">FleetFlow</h1>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.1 + index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Link
                href={item.href}
                className="block relative"
              >
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 relative group',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                    )}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom Logout */}
      <motion.div
        className="px-3 py-6 border-t border-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors duration-200"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <LogOut className="w-5 h-5 text-red-400/70" />
          <span className="font-medium text-sm">Logout</span>
        </motion.button>
      </motion.div>
    </aside>
  )
}
