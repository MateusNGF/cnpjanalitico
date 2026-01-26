"use client"

import * as React from "react"
import {
    GalleryVerticalEnd,
    Settings2,
    LayoutDashboard,
    TrendingUp,
    Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
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
            title: "Dashboards",
            url: "/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "Visão Geral",
                    url: "/dashboard",
                },
                {
                    title: "Mapas de Calor (Geo)",
                    url: "/dashboard/geo",
                },
            ],
        },
        {
            title: "Inteligência",
            url: "#",
            icon: TrendingUp,
            items: [
                {
                    title: "Tendências de Mercado",
                    url: "/dashboard/trends",
                },
                {
                    title: "Comparativo (Em Breve)",
                    url: "#",
                },
            ],
        },
        {
            title: "Prospecção",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Gerador de Leads",
                    url: "/dashboard/leads",
                },
                {
                    title: "Minhas Listas",
                    url: "#",
                },
            ],
        },
        {
            title: "Sistema",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "Configurações",
                    url: "/dashboard/settings",
                },
                {
                    title: "Exportar Relatórios",
                    url: "/dashboard/reports",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
