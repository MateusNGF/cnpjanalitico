"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, Search, Loader2, Info, Building2, Globe } from "lucide-react"
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Municípios</h1>
                    <p className="text-muted-foreground">Análise de densidade empresarial por cidade e região.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cidade..."
                            className="pl-10 bg-muted/50 border-primary/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={uf} onValueChange={setUf}>
                        <SelectTrigger className="w-24 bg-muted/50 border-primary/10">
                            <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {UFS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-2 border-primary/5 bg-muted/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-primary" />
                            Distribuição Geográfica
                        </CardTitle>
                        <CardDescription>Principais pólos econômicos identificados.</CardDescription>
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
                                    <XAxis dataKey="descricao" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                                    <RechartsTooltip
                                        formatter={(value: number) => [formatQuantity(value), "Empresas"]}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px'
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
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                Visão Regional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {uf === "all" ? "Brasil" : uf}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {uf === "all" ? "Análise nacional consolidada" : `Dados filtrados para o estado de ${uf}`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 border-primary/5 bg-muted/5 backdrop-blur-sm overflow-hidden flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Top Cidades</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0 border-t border-border/50">
                            {loading ? (
                                <div className="flex p-8 items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary opacity-20" />
                                </div>
                            ) : (
                                <div className="divide-y divide-border/30">
                                    {data.map((item, index) => (
                                        <div key={item.codigo} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground w-4">{index + 1}</span>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground leading-none">{item.descricao}</p>
                                                    <p className="text-[10px] text-muted-foreground">{item.uf}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-primary">{formatQuantity(item.total)}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase">Unidades</p>
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
