'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { GlareCard } from '@/components/animations/motion'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
  index?: number
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
  index = 0,
}: KPICardProps) {
  const textColors = {
    default: 'text-foreground',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      <GlareCard className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{title}</p>
            <motion.p
              className={cn('text-3xl font-bold mt-2 font-mono', textColors[variant])}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/60 mt-2 italic">{subtitle}</p>
            )}
          </div>
          {icon && (
            <motion.div
              className="text-muted-foreground/40"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </GlareCard>
    </motion.div>
  )
}
