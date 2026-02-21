'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function BackgroundMesh() {
    return (
        <>
            <div className="mesh-gradient">
                <div className="mesh-ball bg-primary/20 top-[-10%] left-[-10%] h-[800px] w-[800px]" />
                <motion.div
                    className="mesh-ball bg-accent/15 top-[20%] right-[10%] h-[600px] w-[600px]"
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -100, 50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="mesh-ball bg-blue-500/10 bottom-[10%] left-[20%] h-[700px] w-[700px]"
                    animate={{
                        x: [0, -150, 100, 0],
                        y: [0, 50, -100, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>
            <div className="noise-overlay" />
        </>
    )
}
