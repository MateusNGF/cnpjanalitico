"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, Search, Loader2, Globe } from "lucide-react"
import { formatNumber, formatQuantity } from "@/lib/utils";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/common/PageHeader";

interface MunicipioData {
    codigo: string;
    descricao: string;
    uf: string;
    total: number;
}

const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function MunicipiosPage() {
    const [data, setData] = useState<MunicipioData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [uf, setUf] = useState("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setLoading(true);
        const ufParam = uf === "all" ? "" : uf;
        fetch(`/api/municipios?search=${debouncedSearch}&uf=${ufParam}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch Municipios data:", err);
                setLoading(false);
            });
    }, [debouncedSearch, uf]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Municípios"
                description="Análise estratégica de densidade empresarial e pólos econômicos por cidade e região."
                icon={<Map className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Exploração", href: "/leads" },
                    { label: "Municípios" }
                ]}
                actions={
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cidade..."
                                className="pl-10 h-9 bg-muted/50 border-primary/10 shadow-sm focus-visible:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={uf} onValueChange={setUf}>
                            <SelectTrigger className="w-24 h-9 bg-muted/50 border-primary/10 shadow-sm font-bold text-xs uppercase tracking-wider">
                                <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">Todas</SelectItem>
                                {UFS.map(u => <SelectItem key={u} value={u} className="text-xs font-bold uppercase tracking-wider">{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-2 border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-primary" />
                            Distribuição Geográfica
                        </CardTitle>
                        <CardDescription>Principais pólos econômicos identificados na região selecionada.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px] pt-4">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.slice(0, 15)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="descricao" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 12 ? val.substring(0, 10) + '...' : val} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                                    <RechartsTooltip
                                        formatter={(value: number) => [formatQuantity(value), "Empresas"]}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${Math.max(0.3, 1 - index * 0.05)})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Globe className="h-3 w-3 text-primary animate-pulse" />
                                Monitoramento Regional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {uf === "all" ? "Brasil" : uf}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                {uf === "all" ? "Consolidado nacional de todas as unidades federativas." : `Dados específicos para a geolocalização de ${uf}.`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 border-primary/5 bg-muted/5 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Top Cidades</CardTitle>
                            <CardDescription className="text-[10px]">Rankeamento por volume operacional.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                            {loading ? (
                                <div className="flex p-8 items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary opacity-20" />
                                </div>
                            ) : (
                                <div className="divide-y divide-border/30">
                                    {data.map((item, index) => (
                                        <div key={item.codigo} className="p-4 hover:bg-primary/[0.02] transition-colors flex items-center justify-between gap-3 group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-muted-foreground/40 w-4 group-hover:text-primary transition-colors">{index + 1}</span>
                                                <div>
                                                    <p className="text-[11px] font-extrabold text-foreground leading-none uppercase tracking-tight">{item.descricao}</p>
                                                    <p className="text-[9px] text-muted-foreground font-mono mt-1 opacity-70">{item.uf} | IBGE {item.codigo}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-primary tracking-tighter">{formatQuantity(item.total)}</p>
                                                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Empresas</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
