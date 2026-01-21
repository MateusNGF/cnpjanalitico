"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Search, Clock, BadgeCheck, Users, Loader2 } from "lucide-react"
import { formatCNPJ, formatCurrency, formatDate, formatQuantity } from "@/lib/utils"
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

interface SerialEntrepreneur {
    nome_socio: string;
    total_empresas: string;
    total_capital_social: string;
}

interface SerialData {
    serialEntrepreneurs: SerialEntrepreneur[];
    stats: {
        total_serial_entrepreneurs: string;
        max_empresas_por_socio: string;
        avg_empresas_por_socio: string;
    };
}

export default function CompliancePage() {
    const [data, setData] = useState<SerialData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/serial-entrepreneurs?limit=15')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch serial entrepreneurs:", err);
                setLoading(false);
            });
    }, []);

    return (
        <PageContent>
            <PageHeader
                title="Compliance & Risco"
                description="Analise a saúde financeira e o histórico de regularidade de seus parceiros comerciais com dados oficiais."
                icon={<ShieldAlert className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Segurança", href: "/compliance" },
                    { label: "Compliance" }
                ]}
            />

            <div className="grid gap-[var(--section-gap)] grid-cols-1 lg:grid-cols-5">
                <Card className="col-span-1 lg:col-span-3 border-primary/5 bg-muted/5 backdrop-blur-sm shadow-xl shadow-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Consulta Estratégica de CNPJ
                        </CardTitle>
                        <CardDescription>Verifique a situação cadastral, capital social e score de risco institucional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Input placeholder="Digite o CNPJ da empresa..." className="pl-10 h-11 bg-background/50 border-primary/20 focus:ring-primary shadow-inner" />
                                <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button className="h-11 px-8 font-extrabold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                Consultar Base
                            </Button>
                        </div>

                        <div className="mt-8 border border-primary/10 rounded-2xl p-8 bg-background/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <h3 className="font-extrabold text-2xl tracking-tighter uppercase bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">EMPRESA ESTRATÉGICA S.A.</h3>
                                    <p className="text-xs font-mono text-muted-foreground mt-1 tracking-wider">{formatCNPJ("00000000000191")}</p>
                                </div>
                                <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-green-500/20 shadow-sm shadow-green-500/10">
                                    ATIVA
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mt-10 text-center relative z-10">
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5 transition-colors group-hover/item:text-primary">Idade Operacional</p>
                                    <p className="font-bold text-xl tracking-tight">12 Anos</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5 transition-colors group-hover/item:text-primary">Capital Integralizado</p>
                                    <p className="font-bold text-xl tracking-tight">{formatCurrency(5000000)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 border-dashed animate-pulse-slow">
                                    <p className="text-[9px] text-primary uppercase font-black tracking-widest mb-1.5">Score de Risco</p>
                                    <p className="font-black text-3xl text-primary tracking-tighter">9.8</p>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex items-center gap-4 relative z-10">
                                <div className="bg-green-500/20 p-2 rounded-lg">
                                    <BadgeCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-green-500 uppercase tracking-tight">Perfil de Baixo Risco</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">Empresa com histórico estável de governança e regularidade fiscal plena identificada na base analítica.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2 border-primary/5 bg-muted/5 backdrop-blur-sm shadow-xl shadow-primary/[0.01]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Linha do Tempo
                        </CardTitle>
                        <CardDescription>Eventos societários e alterações estruturais recentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-primary/20 ml-4 space-y-8 pb-4">
                            {[
                                { date: "2026-01-15", msg: "Aumento de Capital Social integralizado via reservas estratégicas.", type: "capital" },
                                { date: "2024-10-24", msg: "Alteração no quadro de sócios e administradores (QSA) registrada.", type: "socio" },
                                { date: "2022-05-02", msg: "Atualização de endereço de filial estratégica em Curitiba/PR.", type: "address" },
                            ].map((item, i) => (
                                <div key={i} className="relative pl-8 group">
                                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-background border-2 border-primary transition-transform group-hover:scale-125 z-10 shadow-sm" />
                                    <div className="absolute -left-[12px] top-0 h-6 w-6 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <p className="text-[9px] font-black text-primary/70 tracking-widest uppercase mb-1.5">{formatDate(item.date)}</p>
                                    <p className="text-[13px] font-medium leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">{item.msg}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6 text-[10px] h-10 font-black uppercase tracking-widest border-primary/10 hover:bg-primary/5 shadow-sm transition-all hover:border-primary/30">
                            Visualizar Dossiê Completo
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-[var(--section-gap)] grid-cols-1 md:grid-cols-2">
                <Card className="border-orange-500/10 bg-orange-500/[0.02] shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
                            <Users className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Empreendedores Seriais</CardTitle>
                            <CardDescription>Sócios com múltiplas empresas (3+ CNPJs)</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500 opacity-50" />
                                <span className="text-xs text-muted-foreground">Carregando dados...</span>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {(data?.serialEntrepreneurs || []).map((person, index) => {
                                    const empresas = parseInt(person.total_empresas) || 0;
                                    const capital = parseFloat(person.total_capital_social) || 0;

                                    return (
                                        <div key={index} className="group p-3 rounded-lg border border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate group-hover:text-orange-500 transition-colors">
                                                        {person.nome_socio}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatQuantity(empresas)} empresas
                                                        </span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">
                                                            R$ {formatQuantity(capital / 1000000)}M
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`text-[10px] font-black px-2 py-1 rounded ${empresas >= 10
                                                        ? 'bg-red-500/10 text-red-500'
                                                        : empresas >= 5
                                                            ? 'bg-orange-500/10 text-orange-500'
                                                            : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {empresas >= 10 ? 'ALTO' : empresas >= 5 ? 'MÉDIO' : 'BAIXO'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-primary/5 bg-muted/5 shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">Dossiês Recentes</CardTitle>
                        <CardDescription>Atividade recente de auditoria.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border/50">
                        <div className="divide-y divide-border/40">
                            {[
                                { name: "Audit Tech Soluções LTDA", time: "Há 2 horas", cnpj: "12345678000190" },
                                { name: "Logística Global Brasil S.A.", time: "Há 5 horas", cnpj: "98765432000101" },
                                { name: "Consultoria Premium Group", time: "Ontem às 14:00", cnpj: "55444333000211" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 hover:bg-primary/[0.03] cursor-pointer transition-colors group">
                                    <div>
                                        <div className="text-[13px] font-bold group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</div>
                                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5 tracking-tighter">{formatCNPJ(item.cnpj)}</div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 py-1 px-2 bg-muted/50 rounded">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContent>
    )
}
