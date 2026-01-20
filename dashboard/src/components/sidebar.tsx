"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Sidebar() {
    const pathname = usePathname()

    const menuItems = [
        { href: "/", label: "Visão Geral", icon: LayoutDashboard },
        { href: "/leads", label: "Prospecção B2B", icon: Users },
        { href: "/market", label: "Inteligência de Mercado", icon: TrendingUp },
        { href: "/compliance", label: "Compliance & Risco", icon: ShieldCheck },
    ]

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card/30 backdrop-blur-xl transition-all">
            <div className="flex h-16 items-center justify-between border-b px-6">
                <Link href="/" className="flex items-center gap-3 font-bold hover:opacity-80 transition-opacity">
                    <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="tracking-tighter text-lg bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        CNPJ Analítico
                    </span>
                </Link>
                <ThemeToggle />
            </div>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid gap-1.5 px-4 text-sm font-medium">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 relative group",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-4 w-4 transition-transform group-hover:scale-110",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )} />
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-border/50 bg-muted/20">
                <nav className="grid gap-1 text-sm font-medium">
                    <Link
                        href="/docs"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                            pathname === "/docs" && "bg-muted text-primary"
                        )}
                    >
                        <HelpCircle className="h-4 w-4" />
                        Documentação
                    </Link>
                </nav>
                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status do Sistema</p>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[11px] font-medium">ClickHouse Online</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
