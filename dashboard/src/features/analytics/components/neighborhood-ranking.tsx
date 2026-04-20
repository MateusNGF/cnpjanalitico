"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFilterStore } from "@/store/use-filter-store"
import { MapPin } from "lucide-react"

interface RankingItem {
    label: string
    value: number
}

export function NeighborhoodRanking({ municipioId }: { municipioId?: string }) {
    const { uf } = useFilterStore()
    const [data, setData] = useState<RankingItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const url = `/api/geo/ranking-bairros?uf=${uf}${municipioId ? `&municipio_id=${municipioId}` : ''}`
                const response = await fetch(url)
                const result = await response.json()
                setData(result)
            } catch (error) {
                console.error("Failed to fetch neighborhood ranking:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [uf, municipioId])

    if (loading) {
        return (
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Top Bairros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (data.length === 0) return null

    return (
        <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                    <MapPin className="h-4 w-4 text-primary" /> Top 10 Bairros
                </CardTitle>
                <CardDescription className="text-[10px]">
                    Concentração por volume de CNPJs
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-2">
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-muted-foreground/50 w-4">
                                    {(index + 1).toString().padStart(2, '0')}
                                </span>
                                <span className="text-xs font-medium text-slate-600 truncate max-w-[140px] group-hover:text-primary transition-colors">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-800">
                                    {item.value.toLocaleString('pt-BR')}
                                </span>
                                <div className="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                    <div 
                                        className="h-full bg-primary/60 rounded-full" 
                                        style={{ width: `${(item.value / data[0].value) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
