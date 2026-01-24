"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, TrendingUp, ShieldCheck, HelpCircle, BarChart3, Map, Menu, X, ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Close mobile side nav on navigation
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    const menuGroups = [
        {
            label: "Dashboard",
            items: [
                { href: "/", label: "Home", icon: LayoutDashboard },
                { href: "/market", label: "Mercado", icon: TrendingUp },
            ]
        },
        {
            label: "Exploração",
            items: [
                { href: "/leads", label: "Leads", icon: Users },
                { href: "/cnae", label: "CNAE", icon: BarChart3 },
                { href: "/municipios", label: "Municípios", icon: Map },
            ]
        },
        {
            label: "Segurança",
            items: [
                { href: "/compliance", label: "Risco", icon: ShieldCheck },
            ]
        }
    ]

    const NavContent = ({ collapsed = false, isMobile = false }) => (
        <div className="flex h-full flex-col">
            <div className={cn(
                "flex h-20 items-center border-b px-4 shrink-0",
                collapsed ? "justify-center" : "justify-between"
            )}>
                <Link href="/" className="flex items-center gap-3 font-bold hover:opacity-80 transition-opacity overflow-hidden whitespace-nowrap">
                    <div className="bg-primary rounded-xl p-2 shadow-lg shadow-primary/20 shrink-0">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {(!collapsed || isMobile) && (
                        <span className="tracking-tighter text-xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            CNPJ Analítico
                        </span>
                    )}
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-6 px-3">
                <nav className="grid gap-6 text-sm font-medium">
                    {menuGroups.map((group) => (
                        <div key={group.label} className="flex flex-col gap-1.5">
                            {(!collapsed || isMobile) && (
                                <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">
                                    {group.label}
                                </h3>
                            )}
                            {(collapsed && !isMobile) && <div className="h-px bg-border/50 mx-2 mb-2" />}

                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                const link = (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center rounded-xl p-2.5 transition-all duration-300 relative group w-full",
                                            (collapsed && !isMobile) ? "justify-center" : "gap-3 px-4",
                                            isActive
                                                ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        {(!collapsed || isMobile) && <span className="truncate font-bold">{item.label}</span>}
                                        {isActive && !isMobile && !collapsed && (
                                            <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                        )}
                                    </Link>
                                )

                                if (collapsed && !isMobile) {
                                    return (
                                        <Tooltip key={item.href}>
                                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                                            <TooltipContent side="right" sideOffset={10} className="bg-primary text-primary-foreground font-bold border-none shadow-xl z-[9999]">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                }
                                return link
                            })}
                        </div>
                    ))}
                </nav>
            </div>

            <div className={cn(
                "mt-auto p-4 border-t border-border/50 bg-muted/20",
                (collapsed && !isMobile) && "flex flex-col items-center px-2 py-4"
            )}>
                <nav className="grid gap-1 w-full mb-4">
                    <Link
                        href="/docs"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                            (collapsed && !isMobile) && "justify-center px-0",
                            pathname === "/docs" && "bg-muted text-primary"
                        )}
                    >
                        <HelpCircle className="h-5 w-5 shrink-0" />
                        {(!collapsed || isMobile) && <span className="font-bold">Documentação</span>}
                    </Link>
                </nav>

                {(!collapsed || isMobile) ? (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status do Sistema</p>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[11px] font-bold">ClickHouse Online</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Activity className="h-4 w-4 text-green-500" />
                    </div>
                )}

                <div className={cn("mt-4 w-full flex justify-center", (!collapsed || isMobile) && "px-1")}>
                    <ThemeToggle collapsed={collapsed && !isMobile} />
                </div>
            </div>
        </div>
    )

    return (
        <TooltipProvider delayDuration={0}>
            {/* Mobile Header Top */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-[60] flex items-center px-6 justify-between">
                <Link href="/" className="flex items-center gap-2.5 font-bold">
                    <div className="bg-primary rounded-lg p-1.5 shadow-sm shadow-primary/20">
                        <TrendingUp className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="tracking-tighter text-lg font-bold">CNPJ Analítico</span>
                </Link>

                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 w-72 border-l bg-background/95 backdrop-blur-xl">
                        <NavContent isMobile />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Mobile Header Spacer */}
            <div className="lg:hidden h-16 w-full shrink-0" />

            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden lg:flex fixed inset-y-0 left-0 z-[80] lg:relative lg:z-0 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20 lg:w-[104px]" : "w-64 lg:w-[288px]"
            )}>
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "absolute right-4 cursor-pointer top-12 z-[100] flex",
                        "h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:scale-110 active:scale-95 transition-all duration-300",
                        "border-border/50 text-muted-foreground translate-x-1/2"
                    )}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>

                <div className={cn(
                    "flex h-full w-full flex-col lg:m-4 lg:rounded-3xl lg:border bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden shadow-primary/5"
                )}>
                    <NavContent collapsed={isCollapsed} />
                </div>
            </div>
        </TooltipProvider>
    )
}
