"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";
import { Building2, Map as MapIcon, Layers, TrendingUp, Users, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { formatNumber, formatCNAE } from "@/lib/utils";
import { NaturezaSelector } from "@/components/natureza-selector";
import { CapitalSocialSelector } from "@/components/capital-social-selector";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

// dynamic map import
const MasterMap = dynamic(() => import("@/components/map-container").then(m => m.MapContainer), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[500px] rounded-xl animate-pulse bg-muted/20" />,
});

export default function MasterPanelPage() {
    return (
        <PageContent>
            <PageHeader
                title="Painel de Inteligência Mestre"
                description="Visão consolidada de dados demográficos, geográficos e risco em alta performance."
                icon={<Layers className="h-6 w-6 text-primary" />}
                breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Painel Mestre" }]}
            />

            {/* Local Filter Bar */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-primary/5 bg-background/50 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Refinar Painel:</span>
                </div>
                <NaturezaSelector />
                <CapitalSocialSelector />
                <div className="flex-1" />
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    Sincronizado com Global
                </Badge>
            </div>

            {/* KPI Section */}
            <div className="grid gap-[var(--section-gap)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-[var(--section-gap)]">
                <KPICard title="Market Share" value="24.5%" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} trend="+2.1%" />
                <KPICard title="Novas Empresas" value={formatNumber(124000)} icon={<Building2 className="h-4 w-4 text-blue-500" />} trend="+15%" />
                <KPICard title="Densidade Regional" value="842/km²" icon={<Users className="h-4 w-4 text-purple-500" />} />
                <KPICard title="Zonas de Risco" value="12 Áreas" icon={<ShieldAlert className="h-4 w-4 text-rose-500" />} trend="Estável" />
            </div>

            {/* Main Content: Map + Context */}
            <div className="grid gap-[var(--section-gap)] grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-primary/5 backdrop-blur-sm bg-muted/5 overflow-hidden min-h-[500px]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapIcon className="h-4 w-4 text-primary" />
                                    Geolocalização Estratégica
                                </CardTitle>
                                <CardDescription>Análise de densidade empresarial com filtros dinâmicos.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 relative">
                        <MasterMap />
                    </CardContent>
                </Card>

                <div className="space-y-[var(--section-gap)]">
                    <Card className="border-primary/5 backdrop-blur-sm bg-muted/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Top Setores na Região</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SimpleBar label={`${formatCNAE("4711301")} - Comércio Varejista`} value={75} color="var(--chart-1)" />
                            <SimpleBar label={`${formatCNAE("8211300")} - Serviços Administrativos`} value={55} color="var(--chart-2)" />
                            <SimpleBar label={`${formatCNAE("4120400")} - Construção Civil`} value={40} color="var(--chart-3)" />
                            <SimpleBar label={`${formatCNAE("8630501")} - Saúde e Bem-Estar`} value={30} color="var(--chart-4)" />
                        </CardContent>
                    </Card>

                    <Card className="border-primary/5 backdrop-blur-sm bg-muted/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Análise de Tempo</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground text-xs italic">
                            Grafico de tendencia (placeholder)
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContent>
    );
}

function KPICard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend?: string }) {
    return (
        <Card className="relative overflow-hidden border-primary/5 bg-gradient-to-br from-background/50 to-primary/5 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
                <div className="rounded-lg bg-primary/5 p-2 group-hover:bg-primary/10 transition-colors">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {trend && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span className={trend.startsWith('+') ? "text-emerald-500 font-bold" : "text-muted-foreground"}>{trend}</span> desde o último mês
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function SimpleBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span>{label}</span>
                <span className="font-mono">{value}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-primary/5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
