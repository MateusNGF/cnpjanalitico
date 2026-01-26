"use client"

import { KpiCard } from "@/components/kpi-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Waves } from "lucide-react"
import { useEffect, useState } from "react"
import { useDashboard } from "@/components/dashboard-context"
import { formatNumber } from "@/lib/utils"

export default function Page() {
    const { uf } = useDashboard()
    const [stats, setStats] = useState({ capital: 0, natalidade: 0, survival: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                const response = await fetch(`/api/stats?uf=${uf}`)
                if (!response.ok) throw new Error("Stats fetch failed")
                const data = await response.json()
                if (data && !data.error) {
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [uf])

    const formatCurrency = (val: number | undefined | null) => {
        if (val === undefined || val === null || isNaN(val)) return "R$ 0"
        if (val >= 1e9) return `R$ ${(val / 1e9).toFixed(1)}B`
        if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1)}M`
        return `R$ ${formatNumber(val)}`
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            {/* 1. North Star Metrics (KPIs) */}
            <h2 className="text-2xl font-bold tracking-tight">Visão Geral do Mercado</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Capital Social Total"
                    value={loading ? "..." : formatCurrency(stats.capital)}
                    percentage={+5.2}
                    trend="up"
                    trendDescription="Crescimento no período"
                />
                <KpiCard
                    title="Novos CNPJs (Mês)"
                    value={loading ? "..." : formatNumber(stats.natalidade)}
                    percentage={-1.5}
                    trend="down"
                    trendDescription="Aberturas vs mês anterior"
                />
                <KpiCard
                    title="Taxa de Sobrevivência"
                    value={loading ? "..." : `${(stats.survival || 0).toFixed(1)} anos`}
                    percentage={+2.1}
                    trend="up"
                    trendDescription="Média de tempo de vida"
                />
                <KpiCard
                    title="Saldo (MOCK)"
                    value="+2,100"
                    percentage={+4.5}
                    trend="up"
                    trendDescription="Expansão líquida do mercado"
                />
            </div>

            {/* 2. Market Alerts / Highlights */}
            <div className="grid gap-4 md:grid-cols-2">
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Oportunidade Detectada</AlertTitle>
                    <AlertDescription>
                        O setor de Tecnologia em <strong>Belo Horizonte</strong> cresceu 15% acima da média estadual no último trimestre.
                    </AlertDescription>
                </Alert>
                <Alert>
                    <Waves className="h-4 w-4" />
                    <AlertTitle>Alerta de Risco</AlertTitle>
                    <AlertDescription>
                        Alta taxa de mortalidade identificada no varejo de rua em <strong>Divinópolis</strong>.
                    </AlertDescription>
                </Alert>
            </div>

            {/* 3. Quick Links / Call to Action */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Próximos Passos</h3>
                <p className="text-sm text-muted-foreground mb-4">Utilize as ferramentas especializadas para aprofundar sua análise.</p>
                <div className="flex gap-4">
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-100 flex-1 cursor-pointer hover:bg-blue-100 transition-colors">
                        <h4 className="font-medium text-blue-900">Explorar Mapa</h4>
                        <p className="text-xs text-blue-700 mt-1">Identifique polos e densidade.</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-md border border-emerald-100 flex-1 cursor-pointer hover:bg-emerald-100 transition-colors">
                        <h4 className="font-medium text-emerald-900">Gerar Leads</h4>
                        <p className="text-xs text-emerald-700 mt-1">Extraia listas qualificadas.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
