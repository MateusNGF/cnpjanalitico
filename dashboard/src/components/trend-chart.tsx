"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { useDashboard } from "@/components/dashboard-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TrendData {
    month: string
    natalidade: number
    mortalidade: number
}

export function TrendChart() {
    const { uf } = useDashboard()
    const [chartData, setChartData] = useState<TrendData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTrends() {
            setLoading(true)
            try {
                const response = await fetch(`/api/trends?uf=${uf}`)
                if (!response.ok) throw new Error("Trends fetch failed")
                const data = await response.json()

                if (Array.isArray(data)) {
                    // Format months to shorter versions
                    const formattedData = data.map((item: TrendData) => ({
                        ...item,
                        month: format(new Date(item.month), "MMM", { locale: ptBR })
                    }))

                    setChartData(formattedData)
                }
            } catch (error) {
                console.error("Failed to fetch trends:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTrends()
    }, [uf])

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Movimentação Cadastral</CardTitle>
                        <CardDescription>
                            Aberturas vs Encerramentos (Mortalidade) ao longo do tempo.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-xs bg-secondary px-3 py-1 rounded-md font-medium">Trimestre</button>
                        <button className="text-xs border px-3 py-1 rounded-md hover:bg-muted">Ano</button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorNatalidade" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMortalidade" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12, fill: "#888888" }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="natalidade"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorNatalidade)"
                                strokeWidth={2}
                                name="Aberturas"
                            />
                            <Area
                                type="monotone"
                                dataKey="mortalidade"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorMortalidade)"
                                strokeWidth={2}
                                name="Encerramentos"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
