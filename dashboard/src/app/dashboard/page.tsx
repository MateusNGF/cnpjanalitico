"use client"

import { useEffect, useState } from "react"
import { useDashboard } from "@/components/shared/dashboard-context"
import { formatNumber } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { KpiCard } from "@/components/shared/kpi-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Terminal, Waves, ExternalLink } from "lucide-react"

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
        <PageContent>
            <PageHeader
                title="Visão Geral do Mercado"
                description="Métricas de alto nível para análise estratégica de mercado."
                icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Capital Social Total"
                    value={formatCurrency(stats.capital)}
                    percentage={+5.2}
                    trend="up"
                    trendDescription="Crescimento no período"
                    loading={loading}
                />
                <KpiCard
                    title="Novos CNPJs (Mês)"
                    value={formatNumber(stats.natalidade)}
                    percentage={-1.5}
                    trend="down"
                    trendDescription="Aberturas vs mês anterior"
                    loading={loading}
                />
                <KpiCard
                    title="Taxa de Sobrevivência"
                    value={`${(stats.survival || 0).toFixed(1)} anos`}
                    percentage={+2.1}
                    trend="up"
                    trendDescription="Média de tempo de vida"
                    loading={loading}
                />
                <KpiCard
                    title="Saldo (MOCK)"
                    value="+2,100"
                    percentage={+4.5}
                    trend="up"
                    trendDescription="Expansão líquida do mercado"
                    loading={loading}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Alert className="border-primary/10 bg-primary/5">
                    <Terminal className="h-4 w-4 text-primary" />
                    <AlertTitle className="font-bold">Oportunidade Detectada</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        O setor de Tecnologia em <strong>Belo Horizonte</strong> cresceu 15% acima da média estadual no último trimestre.
                    </AlertDescription>
                </Alert>
                <Alert className="border-rose-500/10 bg-rose-500/5">
                    <Waves className="h-4 w-4 text-rose-500" />
                    <AlertTitle className="font-bold">Alerta de Risco</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        Alta taxa de mortalidade identificada no varejo de rua em <strong>Divinópolis</strong>.
                    </AlertDescription>
                </Alert>
            </div>

            <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Próximos Passos</CardTitle>
                    <CardDescription>Utilize as ferramentas especializadas para aprofundar sua análise.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div
                        className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-1 cursor-pointer hover:bg-blue-500/20 transition-all group"
                        onClick={() => window.location.href = '/dashboard/geo'}
                    >
                        <h4 className="font-bold text-blue-700 flex items-center gap-2">
                            Explorar Mapa <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-xs text-blue-600/80 mt-1">Identifique polos e densidade empresarial por região.</p>
                    </div>
                    <div
                        className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex-1 cursor-pointer hover:bg-emerald-500/20 transition-all group"
                        onClick={() => window.location.href = '/dashboard/leads'}
                    >
                        <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                            Gerar Leads <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-xs text-emerald-600/80 mt-1">Extraia listas qualificadas utilizando filtros avançados.</p>
                    </div>
                </CardContent>
            </Card>
        </PageContent>
    )
}
