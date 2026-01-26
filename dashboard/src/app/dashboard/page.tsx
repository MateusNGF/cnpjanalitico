import { KpiCard } from "@/components/kpi-card"
import { TrendChart } from "@/components/trend-chart"
import { CompaniesTable } from "@/components/companies-table"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

            {/* 1. Painel Superior: Os "North Star" Metrics (KPIs) */}
            {/* Mapped from user request */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Capital Social Acumulado"
                    value="R$ 1.25B"
                    percentage={+12.5}
                    trend="up"
                    trendDescription="Crescimento este mês"
                />
                <KpiCard
                    title="Natalidade Empresarial"
                    value="1,234"
                    percentage={-2.0}
                    trend="down"
                    trendDescription="Queda vs mês anterior"
                />
                <KpiCard
                    title="Empresas Ativas"
                    value="45,678"
                    percentage={+0.8}
                    trend="up"
                    trendDescription="Retenção forte"
                />
                <KpiCard
                    title="Saldo Líquido (Growth)"
                    value="+4.5%"
                    percentage={+4.5}
                    trend="up"
                    trendDescription="Crescimento sustentável"
                />
            </div>

            {/* 2. Área Central: O Gráfico de Tendências */}
            <div className="grid gap-4 md:grid-cols-1">
                <TrendChart />
            </div>

            {/* 3. Tabela de Detalhes: O "Gerador de Leads" */}
            <div className="bg-background rounded-xl border p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Gerador de Leads Qualificados</h2>
                    <p className="text-muted-foreground">
                        Explore a base de empresas com filtros avançados baseados na `v_lead_completo`.
                    </p>
                </div>
                <CompaniesTable />
            </div>
        </div>
    )
}
