"use client"

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

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { useDashboard } from "@/components/dashboard-context"
import { StateSelector } from "@/components/state-selector"
import { SituacaoSelector } from "@/components/situacao-selector"
import { CnaeSelector } from "@/components/cnae-selector"

export function DashboardHeader() {
    const { uf, setUf } = useDashboard()

    const getStateName = (uf: string) => {
        switch (uf) {
            case "SP": return "São Paulo";
            case "MG": return "Minas Gerais";
            case "RJ": return "Rio de Janeiro";
            case "RS": return "Rio Grande do Sul";
            default: return "Brasil";
        }
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-6 bg-background z-10">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {/* Dynamic Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>

                    </BreadcrumbList>
                </Breadcrumb>
            </div>

        </header>
    )
}
