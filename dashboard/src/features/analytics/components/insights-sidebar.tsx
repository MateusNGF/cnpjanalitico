"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"

export function InsightsSidebar() {
    return (
        <div className="space-y-4 h-full overflow-y-auto pr-2">
            <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-tight">MACRO METRICS</h3>
                <div className="space-y-3">
                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Capital Social</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold tracking-tight">R$ 42.5B</div>
                            <div className="text-xs text-emerald-600 flex items-center mt-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +5.2% vs ano anterior
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Natalidade Mensal</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold tracking-tight">8,450</div>
                            <div className="text-xs text-red-500 flex items-center mt-1">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                -1.5% desaceleração
                            </div>
                            {/* Mini Sparkline Placeholder */}
                            <div className="h-8 w-full bg-slate-100 mt-2 rounded-sm relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-100" />
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Sobrevivência (2 anos)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold tracking-tight">76%</div>
                            <div className="text-xs text-emerald-600 flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Alta resiliência (TI)
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-tight">ACTIVE ALERTS</h3>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-xs text-amber-800">
                    <strong>Atenção:</strong> Alta taxa de mortalidade identificada no setor de Varejo em Belo Horizonte.
                </div>
            </div>
        </div>
    )
}
