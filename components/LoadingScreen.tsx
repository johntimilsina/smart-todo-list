'use client'

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
    loading: boolean
}

export function LoadingScreen({ loading }: LoadingScreenProps) {
    const [dots, setDots] = useState('')

    useEffect(() => {
        if (!loading) return

        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
        }, 500)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!loading) return null

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="text-center space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-border border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-4 border-transparent border-b-primary/50 animate-spin animation-delay-150"></div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                        Setting up your workspace{dots}
                    </h2>
                    <p className="text-muted-foreground">
                        Preparing AI-powered task management
                    </p>
                </div>
            </div>
        </div>
    )
}
