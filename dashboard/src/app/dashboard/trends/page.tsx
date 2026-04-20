"use client"

import { TrendChart } from "@/features/analytics/components/trend-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { LocalFilterBar } from "@/components/shared/LocalFilterBar"
import { TrendingUp } from "lucide-react"
import { DateRangePicker } from "@/components/shared/date-range-picker"

import { useFilterStore } from "@/store/use-filter-store"
import { useDataStore } from "@/store/use-data-store"
import { useEffect } from "react"
import { formatNumber } from "@/lib/utils"

export default function TrendsPage() {
    const { uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange } = useFilterStore()
    const { data: statsData } = useDataStore(s => s.stats)
    const fetchStats = useDataStore(s => s.fetchStats)

    useEffect(() => {
        fetchStats({ uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange })
    }, [uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange, fetchStats])

    const stats = statsData || { capital: 0, natalidade: 0, survival: 0, topCnaes: [] }
    const topCnaes = stats.topCnaes || []
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
                            <CardTitle className="text-sm font-semibold">Volume por Setor (Top 5)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topCnaes.length > 0 ? (
                                topCnaes.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="truncate max-w-[200px]">{item.label}</span>
                                        <span className="font-bold">{formatNumber(item.value)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs italic text-muted-foreground text-center py-4">Carregando dados...</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-rose-500">Indicadores de Mortalidade</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-rose-50 rounded-lg border border-rose-100 flex flex-col items-center justify-center gap-2">
                                <span className="text-3xl font-bold text-rose-600">{(stats.survival || 0).toFixed(1)}</span>
                                <span className="text-[10px] text-rose-500 uppercase font-bold">Anos em média</span>
                                <p className="text-[10px] text-rose-400 text-center mt-2 px-4">
                                    Média de tempo entre a abertura e baixa definitiva das empresas no filtro selecionado.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContent>
    )
}
