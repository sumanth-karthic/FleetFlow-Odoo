import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: 'available' | 'on-trip' | 'in-shop' | 'pending' | 'completed' | 'error'
  children?: React.ReactNode
  className?: string
}

const statusStyles = {
  'available': 'bg-green-900/30 text-green-300 border-green-800',
  'on-trip': 'bg-blue-900/30 text-blue-300 border-blue-800',
  'in-shop': 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
  'pending': 'bg-orange-900/30 text-orange-300 border-orange-800',
  'completed': 'bg-green-900/30 text-green-300 border-green-800',
  'error': 'bg-red-900/30 text-red-300 border-red-800',
}

const statusLabels = {
  'available': 'Available',
  'on-trip': 'On Trip',
  'in-shop': 'In Shop',
  'pending': 'Pending',
  'completed': 'Completed',
  'error': 'Error',
}

export function StatusPill({ status, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        statusStyles[status],
        className
      )}
    >
      {children || statusLabels[status]}
    </span>
  )
}
