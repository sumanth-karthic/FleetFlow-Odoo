'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatusPillProps {
  status: 'available' | 'on-trip' | 'in-shop' | 'pending' | 'completed' | 'error' | 'cancelled'
  children?: React.ReactNode
  className?: string
}

const statusStyles = {
  'available': 'bg-green-900/30 text-green-300 border-green-800',
  'on-trip': 'bg-blue-900/30 text-blue-300 border-blue-800',
  'in-shop': 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
  'pending': 'bg-orange-900/30 text-orange-300 border-orange-800',
  'completed': 'bg-green-900/30 text-green-300 border-green-800',
  'cancelled': 'bg-red-900/30 text-red-300 border-red-800',
  'error': 'bg-red-900/30 text-red-300 border-red-800',
}

const statusLabels = {
  'available': 'Available',
  'on-trip': 'On Trip',
  'in-shop': 'In Shop',
  'pending': 'Pending',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'error': 'Error',
}

// Statuses that should have a soft pulse glow
const activeStatuses = new Set(['on-trip', 'pending', 'in-shop'])

const glowColors: Record<string, string> = {
  'on-trip': 'rgba(96, 165, 250, 0.25)',
  'pending': 'rgba(251, 146, 60, 0.25)',
  'in-shop': 'rgba(250, 204, 21, 0.25)',
}

export function StatusPill({ status, children, className }: StatusPillProps) {
  const shouldPulse = activeStatuses.has(status)

  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        statusStyles[status],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: shouldPulse
          ? [
            `0 0 0px ${glowColors[status] || 'transparent'}`,
            `0 0 12px ${glowColors[status] || 'transparent'}`,
            `0 0 0px ${glowColors[status] || 'transparent'}`,
          ]
          : undefined,
      }}
      transition={
        shouldPulse
          ? {
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          }
          : { duration: 0.3 }
      }
    >
      {children || statusLabels[status]}
    </motion.span>
  )
}
