"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Briefcase, MapPin, DollarSign, Loader2, Info, Building2, TrendingUp, Copy, Check } from "lucide-react"
import { formatCNPJ, formatCurrency, formatQuantity, cn } from "@/lib/utils";
import { LeadDetailsSheet } from "@/components/LeadDetailsSheet";
import { LeadsFilter, UFSelector, AdvancedFiltersTrigger, SITUACOES } from "@/components/LeadsFilter";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";
import { TableSkeleton, ChartSkeleton } from "@/components/common/Skeletons";
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
import { formatCNAE, formatNaturezaJuridica } from "@/lib/utils";

interface Lead {
    cnpj_basico: string;
    cnpj_ordem: string;
    cnpj_dv: string;
    razao_social: string | null;
    nome_fantasia: string | null;
    uf: string;
    municipio: string;
    capital_social: number | null;
    ddd1: string | null;
    telefone1: string | null;
    correio_eletronico: string | null;
    situacao_cadastral: string;
    data_inicio_atividade: string | null;
    cnae_fiscal_principal: string | null;
    tipo_logradouro: string | null;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    natureza_juridica: string | null;
}

interface LeadStats {
    nature: { label: string, total: number }[];
    capital: { label: string, total: number }[];
    cnaes: { label: string, total: number }[];
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [stats, setStats] = useState<LeadStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [filters, setFilters] = useState({
        cnae: '',
        uf: 'TODOS',
        municipio: '',
        situacao: '02',
        capital_min: '',
        capital_max: '',
        excludeMEI: false,
        ageRange: ''
    });

    const handleOpenDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    const fetchLeads = async (currentFilters = filters) => {
        setLoading(true);
        setStatsLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.cnae) params.append('cnae', currentFilters.cnae);
            if (currentFilters.uf !== 'TODOS') params.append('uf', currentFilters.uf);
            if (currentFilters.municipio) params.append('municipio', currentFilters.municipio);
            if (currentFilters.situacao !== 'TODOS') params.append('situacao', currentFilters.situacao);
            if (currentFilters.capital_min) params.append('capital_min', currentFilters.capital_min);
            if (currentFilters.capital_max) params.append('capital_max', currentFilters.capital_max);
            if (currentFilters.excludeMEI) params.append('excludeMEI', 'true');
            if (currentFilters.ageRange) params.append('ageRange', currentFilters.ageRange);

            // Fetch Leads
            const leadsPromise = fetch(`/api/leads?${params.toString()}`).then(res => res.json());

            // Fetch Stats
            const statsPromise = fetch(`/api/leads/stats?${params.toString()}`).then(res => res.json());

            const [leadsData, statsData] = await Promise.all([leadsPromise, statsPromise]);

            if (Array.isArray(leadsData)) {
                setLeads(leadsData);
            } else {
                setLeads([]);
            }

            if (statsData && !statsData.error && Array.isArray(statsData.nature)) {
                setStats(statsData);
            } else {
                setStats(null);
            }
        } catch (err) {
            console.error("Failed to fetch leads or stats:", err);
            setLeads([]);
            setStats(null);
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    const clearFilters = () => {
        setFilters({ cnae: '', uf: 'TODOS', municipio: '', situacao: '02', capital_min: '', capital_max: '', excludeMEI: false, ageRange: '' });
    };

    const getSituacaoBadge = (code: string) => {
        const style = code === '02' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
            code === '08' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-muted text-muted-foreground border-border';
        const label = SITUACOES.find(s => s.value === code)?.label || code;
        return <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${style}`}>{label}</span>;
    };

    const [copiedCnpj, setCopiedCnpj] = useState<string | null>(null);

    const handleCopyCnpj = (cnpj: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(cnpj);
        setCopiedCnpj(cnpj);
        setTimeout(() => setCopiedCnpj(null), 2000);
    };

    return (
        <PageContent>
            <PageHeader
                title="Prospecção B2B"
                description="Filtre e identifique leads qualificados com base nos dados oficiais da Receita Federal."
                icon={<Briefcase className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Exploração", href: "/leads" },
                    { label: "Prospecção B2B" }
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <UFSelector
                            value={filters.uf}
                            onChange={(val: string) => {
                                const newFilters = { ...filters, uf: val };
                                setFilters(newFilters);
                                // Trigger search automatically when UF changes
                                fetchLeads(newFilters);
                            }}
                        />
                        <AdvancedFiltersTrigger
                            filters={filters}
                            setFilters={setFilters}
                            onSearch={() => fetchLeads(filters)}
                            onClear={clearFilters}
                            loading={loading}
                        />
                        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                        <Button variant="outline" size="sm" className="h-9 shadow-sm hover:bg-primary/5 transition-all rounded-xl border-primary/10 font-bold text-xs gap-2">
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Exportar</span>
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Building2 className="h-3 w-3" /> Natureza Jurídica
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 p-2">
                        {statsLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin opacity-20" /></div> : stats && (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={stats.nature || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        dataKey="total"
                                        nameKey="label"
                                    >
                                        {stats.nature?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.9 - index * 0.15})`} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number, name: string) => [formatQuantity(value), formatNaturezaJuridica(name)]}
                                        contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <DollarSign className="h-3 w-3" /> Capital Social
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 p-4">
                        {statsLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin opacity-20" /></div> : stats && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.capital || []} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="label" type="category" hide />
                                    <RechartsTooltip
                                        formatter={(value: number) => [formatQuantity(value), "Empresas"]}
                                        contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} label={{ position: 'insideLeft', fill: '#fff', fontSize: 9 }}>
                                        {stats.capital?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.8 - index * 0.2})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Briefcase className="h-3 w-3" /> Top CNAE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 px-4">
                        {statsLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-6 bg-muted animate-pulse rounded" />)}
                            </div>
                        ) : stats && (
                            <div className="space-y-2">
                                {stats.cnaes?.map((cnae, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <span className="text-[10px] font-bold text-foreground/70 truncate max-w-[150px]" title={formatCNAE(cnae.label)}>
                                            {formatCNAE(cnae.label).split(' ').slice(0, 3).join(' ')}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 rounded">
                                            {formatQuantity(cnae.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-primary/5 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                    <CardTitle className="text-lg">Empresas Encontradas</CardTitle>
                    <CardDescription>Visualizando {formatQuantity(leads.length)} leads qualificados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        <Table className="min-w-[800px] md:min-w-full">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3" /> Empresa
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-3 w-3" /> Identificação
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> Localização
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <DollarSign className="h-3 w-3" /> Capital
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-4 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <TableSkeleton rows={10} />
                                        </TableCell>
                                    </TableRow>
                                ) : leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Info className="h-8 w-8 opacity-20" />
                                                <span>Nenhuma empresa encontrada com os filtros aplicados.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.map((lead) => (
                                        <TableRow
                                            key={`${lead.cnpj_basico}${lead.cnpj_ordem}${lead.cnpj_dv}`}
                                            className="group cursor-pointer hover:bg-primary/[0.02] transition-colors"
                                            onClick={() => handleOpenDetails(lead)}
                                        >
                                            <TableCell className="max-w-[300px]">
                                                <div className="font-semibold group-hover:text-primary transition-colors uppercase text-[11px] truncate" title={lead.razao_social || 'SEM RAZÃO SOCIAL'}>
                                                    {lead.razao_social || 'Sem Razão Social'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground uppercase truncate">
                                                    {lead.nome_fantasia || lead.razao_social}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 group/cnpj">
                                                    <div className="text-[11px] font-mono font-medium text-foreground/80">
                                                        {formatCNPJ(lead.cnpj_basico + lead.cnpj_ordem + lead.cnpj_dv)}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 opacity-0 group-hover/cnpj:opacity-100 transition-opacity"
                                                        onClick={(e) => handleCopyCnpj(`${lead.cnpj_basico}${lead.cnpj_ordem}${lead.cnpj_dv}`, e)}
                                                    >
                                                        {copiedCnpj === `${lead.cnpj_basico}${lead.cnpj_ordem}${lead.cnpj_dv}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {getSituacaoBadge(lead.situacao_cadastral)}
                                            </TableCell>
                                            <TableCell className="text-[11px] uppercase">
                                                <div className="font-medium">{lead.municipio}</div>
                                                <div className="text-muted-foreground">{lead.uf}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="text-[11px] font-bold text-primary">
                                                    {lead.capital_social && lead.capital_social > 0 ? formatCurrency(lead.capital_social) : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDetails(lead);
                                                    }}
                                                >
                                                    Detalhes
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <LeadDetailsSheet
                lead={selectedLead}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </PageContent>
    )
}
