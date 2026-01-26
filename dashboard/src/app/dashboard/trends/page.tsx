"use client"

import { TrendChart } from "@/components/trend-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/PageHeader"
import { PageContent } from "@/components/common/PageContent"
import { TrendingUp, Filter } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"

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

            {/* Trends Filter Bar */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-primary/5 bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Período de Análise:</span>
                </div>
                <DateRangePicker />
                <div className="flex-1" />
                <p className="text-[10px] text-muted-foreground italic">
                    Afeta gráficos de natalidade e mortalidade.
                </p>
            </div>

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
