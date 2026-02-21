'use client'

import { Bell, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { HoverSpin } from '@/components/animations/motion'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-transparent border-b border-white/5 flex items-center justify-between px-8 z-30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{subtitle}</p>}
      </motion.div>

      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[Bell, Settings, User].map((Icon, i) => (
          <HoverSpin key={i}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Icon className="w-5 h-5" />
            </Button>
          </HoverSpin>
        ))}
      </motion.div>
    </header>
  )
}
