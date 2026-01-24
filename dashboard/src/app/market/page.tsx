"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Map, BarChart3, PieChart, Loader2, AlertTriangle, Building2 } from "lucide-react"
import { formatNumber, formatQuantity, formatCNAE, formatNaturezaJuridica } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton, ListSkeleton } from "@/components/common/Skeletons";
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
import { UFSelector } from "@/components/LeadsFilter";

interface MarketData {
    density: { uf: string, total: string }[];
    hotSectors: { cnae_fiscal_principal: string, total: string }[];
    natureDistribution: { natureza_juridica: string, total: string }[];
    economicGdp: { codigo: string, nome: string, uf: string, pib_empresarial: string, total_empresas: string }[];
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
    const [selectedUF, setSelectedUF] = useState('TODOS');

    useEffect(() => {
        setLoading(true);
        setError(false);

        const params = new URLSearchParams();
        if (selectedUF !== 'MG') {
            params.append('uf', selectedUF);
        }

        fetch(`/api/market?${params.toString()}`)
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
    }, [selectedUF]);

    if (loading) {
        return (
            <PageContent>
                <PageHeader
                    title="Inteligência de Mercado"
                    description="Análise estratégica de densidade empresarial, setores aquecidos e zonas de saturação."
                    icon={<BarChart3 className="h-6 w-6" />}
                    breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inteligência" }]}
                    actions={<Skeleton className="h-9 w-48" />}
                />
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="border-primary/5">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32 mb-2" />
                                    <Skeleton className="h-3 w-48" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <ChartSkeleton />
                <div className="grid gap-4 md:grid-cols-2">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            </PageContent>
        );
    }

    if (error || !data) {
        return (
            <PageContent>
                <PageHeader
                    title="Inteligência de Mercado"
                    description="Análise estratégica de densidade empresarial, setores aquecidos e zonas de saturação."
                    icon={<BarChart3 className="h-6 w-6" />}
                    breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inteligência" }]}
                />
                <Card className="flex h-[400px] flex-col items-center justify-center gap-4 border-dashed border-destructive/20 bg-destructive/5">
                    <BarChart3 className="h-12 w-12 text-destructive opacity-50" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-foreground">Insights Indisponíveis</h3>
                        <p className="text-sm text-muted-foreground">Não foi possível processar as métricas de mercado.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="font-bold border-destructive/20 hover:bg-destructive/10 text-destructive"
                    >
                        Tentar novamente
                    </Button>
                </Card>
            </PageContent>
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
                actions={
                    <UFSelector
                        value={selectedUF}
                        onChange={(val: string) => setSelectedUF(val)}
                    />
                }
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <MarketMap
                        key={selectedUF}
                        uf={selectedUF === 'TODOS' ? undefined : selectedUF}
                    />
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

            {/* PIB Empresarial Municipal */}
            <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        PIB Empresarial por Município
                    </CardTitle>
                    <CardDescription>
                        Ranking de municípios por capital social total - Indicador de força econômica local
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(data.economicGdp || []).slice(0, 15).map((city, index) => {
                            const pib = parseFloat(city.pib_empresarial) || 0;
                            const empresas = parseInt(city.total_empresas) || 0;
                            const maxPib = parseFloat(data.economicGdp?.[0]?.pib_empresarial || '1');
                            const percentage = (pib / maxPib) * 100;

                            return (
                                <div key={city.codigo} className="group">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-muted-foreground w-5">#{index + 1}</span>
                                            <span className="font-semibold group-hover:text-primary transition-colors">
                                                {city.nome || 'Desconhecido'}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground">{city.uf}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatQuantity(empresas)} empresas
                                            </span>
                                            <span className="font-mono font-bold text-primary">
                                                R$ {formatNumber(pib / 1000000)}M
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary/80 to-primary"
                                            style={{
                                                width: `${percentage}%`,
                                                boxShadow: '0 0 8px var(--primary)'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {(!data.economicGdp || data.economicGdp.length === 0) && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto opacity-20 mb-2" />
                            <p className="text-sm">Nenhum dado disponível para a região selecionada</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
