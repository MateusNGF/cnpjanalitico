"use client"

import { useDataStore } from "@/store/use-data-store"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function GlobalLoading() {
    const isAnyLoading = useDataStore(
        (s) => s.stats.loading || s.map.loading || s.trends.loading || s.leads.loading
    )
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isAnyLoading) {
            setVisible(true)
        } else {
            const timer = setTimeout(() => setVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isAnyLoading])

    if (!visible) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 w-full bg-transparent overflow-hidden">
            <div
                className={cn(
                    "h-full bg-primary transition-all duration-300 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.5)]",
                    isAnyLoading ? "w-[70%] animate-pulse" : "w-full"
                )}
            />
        </div>
    )
}
