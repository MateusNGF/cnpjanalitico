"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className={cn("h-9 w-9 rounded-xl bg-muted/20 animate-pulse", !collapsed && "w-full")} />

    const currentTheme = theme === 'system' ? resolvedTheme : theme

    if (collapsed) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
                className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
            </Button>
        )
    }

    return (
        <div className="flex h-9 w-full items-center gap-1 rounded-xl bg-muted/20 p-1 backdrop-blur-sm border border-border/50">
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-1 text-xs font-bold transition-all duration-300",
                    currentTheme === "light"
                        ? "bg-white text-black shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
            >
                <Sun className="h-3.5 w-3.5" />
                Claro
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-1 text-xs font-bold transition-all duration-300",
                    currentTheme === "dark"
                        ? "bg-[#1e293b] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                )}
            >
                <Moon className="h-3.5 w-3.5" />
                Escuro
            </button>
        </div>
    )
}
