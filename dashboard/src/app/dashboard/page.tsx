"use client"

import { useEffect, useState } from "react"
import { formatNumber } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { KpiCard } from "@/components/shared/kpi-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutDashboard, Terminal, Waves, ExternalLink, MapPin } from "lucide-react"
import { useFilterStore } from "@/store/use-filter-store"
import { useDataStore } from "@/store/use-data-store"

export default function Page() {
    const { uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange } = useFilterStore()
    const { data: statsData, loading, error } = useDataStore(s => s.stats)
    const fetchStats = useDataStore(s => s.fetchStats)
    const [density, setDensity] = useState<{ label: string, value: number }[]>([])

    useEffect(() => {
        fetchStats({ uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange })
    }, [uf, city, cnae, situacao, naturezaJuridica, capitalSocial, idadeRange, fetchStats])

    // Specific density fetch (if not in stats)
    useEffect(() => {
        async function fetchDensity() {
            try {
                const response = await fetch(`/api/geo/density?uf=${uf}`)
                const data = await response.json()
                if (Array.isArray(data)) setDensity(data)
            } catch (e) {
                console.error("Density fetch error", e)
            }
        }
        fetchDensity()
    }, [uf])

    const stats = statsData || { capital: 0, natalidade: 0, survival: 0 }

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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Alert className="border-primary/10 bg-primary/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Terminal className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold text-sm mb-0">Oportunidade Detectada</AlertTitle>
                    </div>
                    <AlertDescription className="text-[11px] text-muted-foreground leading-relaxed">
                        O setor de Tecnologia em <strong>Belo Horizonte</strong> cresceu 15% acima da média estadual no último trimestre.
                    </AlertDescription>
                </Alert>
                <Alert className="border-rose-500/10 bg-rose-500/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Waves className="h-4 w-4 text-rose-500" />
                        <AlertTitle className="font-bold text-sm mb-0">Alerta de Risco</AlertTitle>
                    </div>
                    <AlertDescription className="text-[11px] text-muted-foreground leading-relaxed">
                        Alta taxa de mortalidade identificada no varejo de rua em <strong>Divinópolis</strong>.
                    </AlertDescription>
                </Alert>
                
                {/* Hotspots de CEP */}
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold">Hotspots de CEP</CardTitle>
                            <CardDescription className="text-[10px]">Maiores concentrações (5 dígitos)</CardDescription>
                        </div>
                        <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                            <MapPin className="h-3.5 w-3.5" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                         {loading ? (
                             <div className="space-y-2">
                                 {[1,2,3].map(i => <Skeleton key={i} className="h-3 w-full" />)}
                             </div>
                         ) : density.length > 0 ? (
                             <div className="space-y-1.5">
                                 {density.slice(0, 3).map((item, i) => (
                                     <div key={i} className="flex items-center justify-between text-[11px]">
                                         <span className="font-mono bg-muted px-1 rounded">{item.label}-***</span>
                                         <span className="font-bold">{item.value} <span className="font-normal text-muted-foreground ml-0.5">unid.</span></span>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <p className="text-[10px] text-muted-foreground italic">Dados geográficos não disponíveis.</p>
                         )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                <CardHeader className="py-4">
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
