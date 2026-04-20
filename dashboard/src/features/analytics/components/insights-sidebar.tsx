"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"

import { useFilterStore } from "@/store/use-filter-store";
import { useDataStore } from "@/store/use-data-store";
import { formatNumber } from "@/lib/utils";

export function InsightsSidebar() {
    const { uf, city } = useFilterStore()
    const { data: statsData } = useDataStore(s => s.stats)
    const stats = statsData || { capital: 0, natalidade: 0, survival: 0 }

    return (
        <div className="space-y-4 h-full overflow-y-auto pr-2">
            <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-tight uppercase">Métricas Macro ({city || uf})</h3>
                <div className="space-y-3">
                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Volume de Capital</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold tracking-tight">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.capital)}
                            </div>
                            <div className="text-[10px] text-emerald-600 flex items-center mt-1">
                                <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
                                Baseado em empresas ativas
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Unidades Locais</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold tracking-tight">{formatNumber(stats.natalidade)}</div>
                            <div className="text-[10px] text-blue-500 flex items-center mt-1">
                                <TrendingUp className="h-2.5 w-2.5 mr-1" />
                                Novos entrantes identificados
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Sobrevivência Média</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold tracking-tight">{(stats.survival || 0).toFixed(1)} anos</div>
                            <div className="text-[10px] text-muted-foreground flex items-center mt-1 italic">
                                Tempo médio antes da baixa
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-tight">ALERTAS ATIVOS</h3>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-[10px] text-amber-800 leading-tight">
                    <strong>Insights:</strong> Analisando mercado em {city || uf}. Verifique o ranking de bairros para micro-segmentação.
                </div>
            </div>
        </div>
    )
}
