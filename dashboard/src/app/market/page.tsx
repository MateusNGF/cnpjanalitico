"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Map, BarChart3, PieChart, Loader2, AlertTriangle } from "lucide-react"
import { formatNumber, formatQuantity, formatCNAE, formatNaturezaJuridica } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";
import MarketMap from "@/components/geo/MarketMap";

interface MarketData {
    density: { uf: string, total: string }[];
    hotSectors: { cnae_fiscal_principal: string, total: string }[];
    natureDistribution: { natureza_juridica: string, total: string }[];
    insights: {
        blueOcean: { location: string, reason: string };
        hotSector: { name: string, growth: string };
        highRisk: { location: string, rate: string };
    };
}

export default function MarketPage() {
    const [data, setData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/market')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch market data:", err);
                setError(true);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <span className="text-sm text-muted-foreground animate-pulse">Cruzando dados demográficos...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <BarChart3 className="h-12 w-12 text-destructive opacity-50" />
                <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">Insights Indisponíveis</h3>
                    <p className="text-sm text-muted-foreground">Não foi possível processar as métricas de mercado.</p>
                </div>
                <button onClick={() => window.location.reload()} className="text-xs font-bold text-primary hover:underline">Tentar novamente</button>
            </div>
        );
    }

    const COLORS = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
        'var(--sidebar-accent-foreground)'
    ];

    return (
        <PageContent>
            <PageHeader
                title="Inteligência de Mercado"
                description="Análise estratégica de densidade empresarial, setores aquecidos e zonas de saturação."
                icon={<BarChart3 className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Inteligência" }
                ]}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <MarketMap uf="MG" />
                </div>


                <div className="flex flex-col gap-4">
                    <Card className="border-green-500/10 bg-gradient-to-br from-background to-green-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Oceano Azul
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500 tracking-tight">{data.insights?.blueOcean?.location || "N/A"}</div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.insights?.blueOcean?.reason || "--"}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-500/10 bg-gradient-to-br from-background to-blue-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                                Setor Aquecido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500 tracking-tight">{formatCNAE(data.insights?.hotSector?.name || "")}</div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                <span className="text-blue-500 font-bold">
                                    {formatQuantity(parseInt(data.insights?.hotSector?.growth || "0"))}
                                </span> registros de aberturas recentes em escala nacional.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-500/10 bg-gradient-to-br from-background to-red-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-500">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Alerta de Saturação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500 tracking-tight">{data.insights?.highRisk?.location || "N/A"}</div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                Taxa de mortalidade de <span className="text-red-500 font-bold">
                                    {formatQuantity(parseInt(data.insights?.highRisk?.rate || "0"))}
                                </span> baixas identificada neste setor/região.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Top Setores em Crescimento
                        </CardTitle>
                        <CardDescription>CNAEs com maior volume de registros nos últimos 180 dias.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(data.hotSectors || []).map(s => ({ name: s.cnae_fiscal_principal, total: parseInt(s.total) || 0 }))} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                                <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} width={100} tickFormatter={(value) => formatCNAE(value)} />
                                <RechartsTooltip
                                    formatter={(value: number) => [formatQuantity(value), "Empresas"]}
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" />
                            Natureza Jurídica
                        </CardTitle>
                        <CardDescription>Distribuição por tipo de constituição empresarial.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={(data.natureDistribution || []).map(n => ({ name: n.natureza_juridica, value: parseInt(n.total) || 0 }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${formatNaturezaJuridica(name.split(' ')[0])} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(data.natureDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => [formatQuantity(value), "Empresas"]}
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </PageContent>
    )
}
