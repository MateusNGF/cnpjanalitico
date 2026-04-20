"use client"

import { TrendChart } from "@/features/analytics/components/trend-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { LocalFilterBar } from "@/components/shared/LocalFilterBar"
import { TrendingUp } from "lucide-react"
import { DateRangePicker } from "@/components/shared/date-range-picker"

export default function TrendsPage() {
    return (
        <PageContent>
            <PageHeader
                title="Inteligência de Mercado"
                description="Análise temporal de aberturas, fechamentos e sobrevivência."
                icon={<TrendingUp className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Trends" }
                ]}
            />

            <LocalFilterBar title="Período de Análise">
                <DateRangePicker />
            </LocalFilterBar>

            <div className="grid gap-6 md:grid-cols-1">
                {/* Main Trend Chart */}
                <TrendChart />

                {/* Secondary Analytics Placeholders (Scenario Comparison) */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ranking por CNAE (Top 5)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md m-4">
                            Gráfico de Barras Horizontais
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Matriz de Risco (Probabilidade de Baixa)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md m-4">
                            Heatmap (Idade x Setor)
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContent>
    )
}
