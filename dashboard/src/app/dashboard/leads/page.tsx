import { CompaniesTable } from "@/features/leads/components/companies-table"
import { Button } from "@/components/ui/button"
import { Download, Users, Filter } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { NaturezaSelector } from "@/components/shared/natureza-selector"
import { CapitalSocialSelector } from "@/components/shared/capital-social-selector"
import { SimplesSelector } from "@/components/shared/simples-selector"
import { IdadeSelector } from "@/components/shared/idade-selector"
import { LocalFilterBar } from "@/components/shared/LocalFilterBar"
import { LeadDrawer } from "@/features/leads/components/lead-drawer"

export default function LeadsPage() {
    return (
        <PageContent>
            <PageHeader
                title="Prospecção de Leads"
                description="Motor de busca avançada para prospecção e qualificação corporativa."
                icon={<Users className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Leads" }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </div>
                }
            />

            <LocalFilterBar title="Prospectar">
                <NaturezaSelector />
                <CapitalSocialSelector />
                <IdadeSelector />
                <SimplesSelector />
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 text-[10px] font-bold animate-in fade-in slide-in-from-left-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    BUSCA AUTOMÁTICA
                </div>
            </LocalFilterBar>

            <div className="bg-background rounded-xl border p-6 flex-1 overflow-hidden flex flex-col">
                <CompaniesTable />
            </div>

            <LeadDrawer />
        </PageContent>
    )
}
