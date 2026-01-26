"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
    { month: "Jan", natalidade: 400, mortalidade: 240 },
    { month: "Feb", natalidade: 300, mortalidade: 139 },
    { month: "Mar", natalidade: 200, mortalidade: 980 },
    { month: "Apr", natalidade: 278, mortalidade: 390 },
    { month: "May", natalidade: 189, mortalidade: 480 },
    { month: "Jun", natalidade: 239, mortalidade: 380 },
    { month: "Jul", natalidade: 349, mortalidade: 430 },
]

export function TrendChart() {
    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Movimentação Cadastral (Natalidade vs Mortalidade)</CardTitle>
                        <CardDescription>
                            Abertura e fechamento de empresas nos últimos 7 meses.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-xs bg-secondary px-3 py-1 rounded-md">Last 3 months</button>
                        <button className="text-xs border px-3 py-1 rounded-md">Last 30 days</button>
                        <button className="text-xs border px-3 py-1 rounded-md">Last 7 days</button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
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
                                name="Baixas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
