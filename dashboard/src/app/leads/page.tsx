"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Briefcase, MapPin, DollarSign, X, Loader2, Info } from "lucide-react"
import { formatNumber, formatCNPJ, formatCurrency, formatQuantity } from "@/lib/utils";
import { LeadDetailsSheet } from "@/components/LeadDetailsSheet";

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
}

const UFS = ["TODOS", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const SITUACOES = [
    { value: "02", label: "ATIVA" },
    { value: "04", label: "INAPTA" },
    { value: "08", label: "BAIXADA" },
    { value: "03", label: "SUSPENSA" },
    { value: "01", label: "NULA" },
    { value: "TODOS", label: "TODAS" },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [filters, setFilters] = useState({
        cnae: '',
        uf: 'TODOS',
        municipio: '',
        situacao: '02',
        capital_min: ''
    });

    const handleOpenDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.cnae) params.append('cnae', filters.cnae);
            if (filters.uf !== 'TODOS') params.append('uf', filters.uf);
            if (filters.municipio) params.append('municipio', filters.municipio);
            if (filters.situacao !== 'TODOS') params.append('situacao', filters.situacao);
            if (filters.capital_min) params.append('capital_min', filters.capital_min);

            const res = await fetch(`/api/leads?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setLeads(data);
            } else {
                console.error("API returned non-array data:", data);
                setLeads([]);
            }
        } catch (err) {
            console.error("Failed to fetch leads:", err);
            setLeads([]);
        } finally {
            setLoading(false);
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
        setFilters({ cnae: '', uf: 'TODOS', municipio: '', situacao: '02', capital_min: '' });
    };

    const getSituacaoBadge = (code: string) => {
        const style = code === '02' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
            code === '08' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-muted text-muted-foreground border-border';
        const label = SITUACOES.find(s => s.value === code)?.label || code;
        return <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${style}`}>{label}</span>;
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Prospecção B2B</h1>
                <p className="text-muted-foreground">Filtre leads qualificados com base nos dados da Receita Federal.</p>
            </div>

            <Card className="border-primary/10 bg-primary/5 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Briefcase className="h-24 w-24" />
                </div>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filtros de Segmentação
                    </CardTitle>
                    <CardDescription>Refine sua busca para encontrar as melhores oportunidades de negócio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2 text-primary font-bold">
                                    <MapPin className="h-3.5 w-3.5" /> UF
                                </span>
                                <span className="text-[9px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full border border-green-500/20 animate-pulse">
                                    🚀 Alta Performance
                                </span>
                            </label>
                            <Select
                                value={filters.uf}
                                onValueChange={(val) => setFilters({ ...filters, uf: val })}
                            >
                                <SelectTrigger className="border-primary/20 focus:ring-primary bg-background/50">
                                    <SelectValue placeholder="Selecione o Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {UFS.map(uf => (
                                        <SelectItem key={uf} value={uf}>{uf === 'TODOS' ? 'Todos os Estados' : uf}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-primary" /> CNAE / Setor
                            </label>
                            <div className="relative">
                                <Input
                                    placeholder="Ex: 6201501"
                                    className="pl-9 bg-background/50"
                                    value={filters.cnae}
                                    onChange={(e) => setFilters({ ...filters, cnae: e.target.value })}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-primary" /> Situação Cadastral
                            </label>
                            <Select
                                value={filters.situacao}
                                onValueChange={(val) => setFilters({ ...filters, situacao: val })}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Situação" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SITUACOES.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> Município
                            </label>
                            <div className="relative">
                                <Input
                                    placeholder="Ex: Curitiba"
                                    className="pl-9 bg-background/50"
                                    value={filters.municipio}
                                    onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                                />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> Capital Social Mínimo
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="Mínimo (ex: 50000)"
                                    className="pl-9 bg-background/50"
                                    value={filters.capital_min}
                                    onChange={(e) => setFilters({ ...filters, capital_min: e.target.value })}
                                />
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="xl:col-span-5 flex justify-end gap-2 mt-2">
                            <Button type="button" variant="outline" onClick={clearFilters} className="h-10 px-4">
                                <X className="mr-2 h-4 w-4" /> Limpar Filtros
                            </Button>
                            <Button type="submit" className="h-10 px-8 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Buscar Leads Qualificados
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-primary/5">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                    <div>
                        <CardTitle className="text-lg">Empresas Encontradas</CardTitle>
                        <CardDescription>Visualizando {formatQuantity(leads.length)} leads qualificados.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                            <Download className="mr-2 h-4 w-4" /> Exportar CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="py-4">Razão Social / Fantasia</TableHead>
                                    <TableHead className="py-4">CNPJ / Status</TableHead>
                                    <TableHead className="py-4">Cidade / UF</TableHead>
                                    <TableHead className="py-4 text-right">Capital Social</TableHead>
                                    <TableHead className="py-4 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-sm text-muted-foreground animate-pulse">Consultando ClickHouse...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
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
                                                <div className="text-[11px] font-mono font-medium text-foreground/80 mb-1">
                                                    {formatCNPJ(lead.cnpj_basico + lead.cnpj_ordem + lead.cnpj_dv)}
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
        </div>
    )
}
