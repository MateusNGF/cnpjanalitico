"use client"

import * as React from "react"
import {
    GalleryVerticalEnd,
    Settings2,
    LayoutDashboard,
    TrendingUp,
    Users,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const sidebarData = {
    user: {
        name: "Consultor",
        email: "admin@cnpj-analytics.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "CNPJ Analítico",
            logo: GalleryVerticalEnd,
            plan: "Pro",
        },
    ],
    navMain: [
        {
            title: "Inteligência de Mercado",
            url: "#",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                { title: "Visão Geral", url: "/dashboard" },
                { title: "Análise Geográfica", url: "/dashboard/geo" },
                { title: "Tendências (Mortalidade)", url: "/dashboard/trends" },
                { title: "Painel Mestre", url: "/dashboard/master-panel" },
            ],
        },
        {
            title: "Operacional",
            url: "#",
            icon: Users,
            items: [
                { title: "Motor de Prospecção", url: "/dashboard/leads" },
                { title: "Minhas Listas", url: "/dashboard/lists" },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <NavMain items={sidebarData.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={sidebarData.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
