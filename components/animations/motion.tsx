'use client'

import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Stagger Container ─────────────────────────────────────────
export function StaggerContainer({
    children,
    className,
    delay = 0,
    staggerDelay = 0.08,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    staggerDelay?: number
}) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        delayChildren: delay,
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    )
}

// ── Fade Slide In ──────────────────────────────────────────────
export function FadeSlideIn({
    children,
    className,
    direction = 'up',
    delay = 0,
    duration = 0.4,
}: {
    children: React.ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    duration?: number
}) {
    const offsets = {
        up: { x: 0, y: 16 },
        down: { x: 0, y: -16 },
        left: { x: 16, y: 0 },
        right: { x: -16, y: 0 },
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...offsets[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    )
}

// ── Stagger Child (used inside StaggerContainer) ────────────────
export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
                },
            }}
        >
            {children}
        </motion.div>
    )
}

// ── Hover Lift Card ────────────────────────────────────────────
export function HoverLiftCard({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            className={className}
            whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(74, 222, 128, 0.08)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            {children}
        </motion.div>
    )
}

// ── Animated Counter ───────────────────────────────────────────
export function AnimatedCounter({
    value,
    duration = 1.2,
    prefix = '',
    suffix = '',
    className,
    locale = 'en-IN',
}: {
    value: number
    duration?: number
    prefix?: string
    suffix?: string
    className?: string
    locale?: string
}) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(0)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (isInView) {
            const controls = animate(motionValue, value, {
                duration,
                ease: [0.25, 0.46, 0.45, 0.94],
            })
            return controls.stop
        }
    }, [isInView, value, duration, motionValue])

    useEffect(() => {
        const unsubscribe = motionValue.on('change', (v) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${Math.round(v).toLocaleString(locale)}${suffix}`
            }
        })
        return unsubscribe
    }, [motionValue, prefix, suffix, locale])

    return <span ref={ref} className={className}>{prefix}0{suffix}</span>
}

// ── Animated Progress Bar ──────────────────────────────────────
export function AnimatedProgressBar({
    value,
    className,
    barClassName,
    duration = 0.8,
}: {
    value: number
    className?: string
    barClassName?: string
    duration?: number
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <div ref={ref} className={className}>
            <motion.div
                className={barClassName}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${value}%` } : { width: 0 }}
                transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            />
        </div>
    )
}

// ── Table Row Animation ────────────────────────────────────────
export function AnimatedTableRow({
    children,
    index = 0,
    className,
}: {
    children: React.ReactNode
    index?: number
    className?: string
}) {
    return (
        <motion.tr
            className={className}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}
        >
            {children}
        </motion.tr>
    )
}

// ── Animated Button ────────────────────────────────────────────
export function AnimatedButton({
    children,
    className,
    onClick,
    disabled = false,
    type = 'button',
}: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit'
}) {
    return (
        <motion.button
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {children}
        </motion.button>
    )
}

// ── Page Transition Wrapper ────────────────────────────────────
export function PageTransition({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.main
            className={className}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.main>
    )
}

// ── Skeleton Shimmer ───────────────────────────────────────────
export function SkeletonShimmer({ className }: { className?: string }) {
    return (
        <motion.div
            className={`bg-secondary/60 rounded-lg ${className || ''}`}
            animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
            style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                backgroundSize: '200% 100%',
            }}
        />
    )
}

// ── Icon Spin on Hover ─────────────────────────────────────────
export function HoverSpin({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            className={className}
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    )
}

// ── Magnetic Button (high-end interaction) ───────────────────────
export function MagneticButton({
    children,
    className,
    onClick,
    disabled = false,
    type = 'button',
    strength = 30,
}: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit'
    strength?: number
}) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2
        const distanceX = clientX - centerX
        const distanceY = clientY - centerY
        x.set(distanceX * (strength / (width / 2)))
        y.set(distanceY * (strength / (height / 2)))
    }

    const handleMouseLeave = () => {
        animate(x, 0, { type: 'spring', stiffness: 150, damping: 15 })
        animate(y, 0, { type: 'spring', stiffness: 150, damping: 15 })
    }

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
        >
            <motion.button
                className={className}
                onClick={onClick}
                disabled={disabled}
                type={type}
                style={{ x, y }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            >
                {children}
            </motion.button>
        </div>
    )
}

// ── Glare Card (lighting that follows mouse) ─────────────────────
export function GlareCard({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const isHovered = useMotionValue(0)

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
        isHovered.set(1)
    }

    return (
        <motion.div
            className={`glass-card relative overflow-hidden group ${className || ''}`}
            onMouseMove={onMouseMove}
            onMouseLeave={() => isHovered.set(0)}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 80%)`
                    ),
                }}
            />
            {children}
        </motion.div>
    )
}

export { motion, AnimatePresence }
