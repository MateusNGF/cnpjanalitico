"use client"

import { MapContainer } from "@/components/map-container"
import { LeadDrawer } from "@/components/lead-drawer"
import { InsightsSidebar } from "@/components/insights-sidebar"
import { PageHeader } from "@/components/common/PageHeader"
import { PageContent } from "@/components/common/PageContent"
import { Map } from "lucide-react"

export default function GeoPage() {
    return (
        <PageContent className="h-[calc(100vh-4rem)] flex flex-col p-4">
            <PageHeader
                title="Geointeligência"
                description="Exploração visual do mercado."
                icon={<Map className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Geo" }
                ]}
                className="pb-2"
            />
            <div className="flex flex-1 gap-4 overflow-hidden">
                <div className="flex flex-1 gap-4 overflow-hidden h-full">
                    {/* Center: Map Container (Discovery Engine) */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <MapContainer />
                    </div>

                    {/* Right: Context Sidebar (Specific to Geo) */}
                    {/* We reuse InsightsSidebar for now, but conceptually this could be "Region Details" */}
                    <div className="w-[300px] flex-none hidden md:block overflow-y-auto pr-1 bg-white rounded-lg border p-4 shadow-sm">
                        <h3 className="font-semibold mb-4">Contexto Regional</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Selecione um município no mapa para ver estatísticas detalhadas e oportunidades de negócio.
                        </p>
                        <InsightsSidebar />
                    </div>
                </div>

                {/* Operational Layer: Drawer (Controlled by Context) */}
                <LeadDrawer />
            </div>
        </PageContent>
    )
}
