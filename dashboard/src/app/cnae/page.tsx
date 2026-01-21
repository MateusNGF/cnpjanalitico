"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Search, Loader2, ArrowUpRight } from "lucide-react"
import { formatNumber, formatQuantity, formatCNAE } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

interface CNAEData {
    codigo: string;
    descricao: string;
    total: number;
}

export default function CNAEPage() {
    const [data, setData] = useState<CNAEData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/cnae?search=${debouncedSearch}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch CNAE data:", err);
                setLoading(false);
            });
    }, [debouncedSearch]);

    return (
        <PageContent>
            <PageHeader
                title="Consulta CNAE"
                description="Explore as atividades econômicas em escala nacional e identifique nichos de mercado."
                icon={<BarChart3 className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Exploração", href: "/leads" },
                    { label: "CNAE" }
                ]}
                actions={
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar código ou nome..."
                            className="pl-10 h-9 bg-muted/50 border-primary/10 focus-visible:ring-primary/20 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                }
            />

            <div className="grid gap-[var(--section-gap)] grid-cols-1 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-2 border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Ranking de Atividades
                        </CardTitle>
                        <CardDescription>Top setores por volume de empresas registradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px] pt-4">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.slice(0, 15)} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                                    <YAxis
                                        dataKey="codigo"
                                        type="category"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        width={80}
                                        tickFormatter={(value) => formatCNAE(value)}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number, name: string, props: any) => [
                                            formatQuantity(value),
                                            props.payload.descricao
                                        ]}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${Math.max(0.3, 1 - index * 0.05)})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Dicionário de Atividades</CardTitle>
                        <CardDescription>Listagem técnica e volumes ativos.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 border-t border-border/50">
                        {loading ? (
                            <div className="flex p-8 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {data.map((item) => (
                                    <div key={item.codigo} className="p-4 hover:bg-primary/[0.03] transition-colors group cursor-pointer">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-tighter">
                                                {formatCNAE(item.codigo)}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                                                {formatQuantity(item.total)} <ArrowUpRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-foreground/80 line-clamp-2 leading-relaxed uppercase">
                                            {item.descricao}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume de Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">
                            {data.length > 0 ? formatQuantity(data.reduce((acc, curr) => acc + (curr.total || 0), 0)) : "0"}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            Base nacional consolidada
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PageContent>
    )
}
