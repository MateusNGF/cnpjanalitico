"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
    const pathname = usePathname()

    const menuItems = [
        { href: "/", label: "Visão Geral", icon: LayoutDashboard },
        { href: "/leads", label: "Prospecção B2B", icon: Users },
        { href: "/market", label: "Inteligência de Mercado", icon: TrendingUp },
        { href: "/compliance", label: "Compliance & Risco", icon: ShieldCheck },
    ]

    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/40 transition-all">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="tracking-tight">CNPJ Analítico</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4 text-sm font-medium">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted/30"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <nav className="grid gap-1 text-sm font-medium">
                    <Link
                        href="/docs"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname === "/docs"
                                ? "bg-muted text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted/30"
                        )}
                    >
                        <HelpCircle className="h-4 w-4" />
                        Documentação
                    </Link>
                </nav>
            </div>
        </div>
    )
}
