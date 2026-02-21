import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    success: 'bg-green-950 border-green-800',
    warning: 'bg-yellow-950 border-yellow-800',
    danger: 'bg-red-950 border-red-800',
  }

  const textColors = {
    default: 'text-foreground',
    success: 'text-green-200',
    warning: 'text-yellow-200',
    danger: 'text-red-200',
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-6 backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-bold mt-2', textColors[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
