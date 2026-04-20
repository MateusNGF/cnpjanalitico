import { CompaniesTable } from "@/components/companies-table"
import { Button } from "@/components/ui/button"
import { Download, Users, Filter } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { PageContent } from "@/components/common/PageContent"
import { NaturezaSelector } from "@/components/natureza-selector"
import { CapitalSocialSelector } from "@/components/capital-social-selector"
import { SimplesSelector } from "@/components/simples-selector"
import { IdadeSelector } from "@/components/idade-selector"
import { CnaeSelector } from "@/components/cnae-selector"

import { LeadDrawer } from "@/components/lead-drawer"

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

            {/* Leads Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-primary/5 bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Prospectar:</span>
                </div>
                <CnaeSelector />
                <NaturezaSelector />
                <CapitalSocialSelector />
                <IdadeSelector />
                <SimplesSelector />
                <div className="flex-1" />
                <Button size="sm" className="h-8 shadow-lg shadow-primary/20">Aplicar Filtros</Button>
            </div>

            <div className="bg-background rounded-xl border p-6 flex-1 overflow-hidden flex flex-col">
                <CompaniesTable />
            </div>

            <LeadDrawer />
        </PageContent>
    )
}
