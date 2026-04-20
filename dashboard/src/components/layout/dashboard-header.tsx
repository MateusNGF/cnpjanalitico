"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useFilterStore } from "@/store/use-filter-store"
import { StateSelector } from "@/components/shared/state-selector"
import { CnaeSelector } from "@/components/shared/cnae-selector"
import { SituacaoSelector } from "@/components/shared/situacao-selector"
import React from "react"

export function DashboardHeader() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const routeConfig: Record<string, string> = {
        "dashboard": "Dashboard",
        "geo": "Análise Geográfica",
        "trends": "Tendências",
        "leads": "Motor de Prospecção",
        "lists": "Minhas Listas",
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                <Breadcrumb>
                    <BreadcrumbList>
                        {segments.map((segment, index) => {
                            const isLast = index === segments.length - 1
                            const href = `/${segments.slice(0, index + 1).join('/')}`
                            const title = routeConfig[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </React.Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <StateSelector />
                    <CnaeSelector />
                    <SituacaoSelector />
                </div>
                {/* <div className="h-6 w-px bg-border mx-2" /> */}
            </div>
        </header>
    )
}
