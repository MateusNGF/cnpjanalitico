"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Briefcase, MapPin, DollarSign, Loader2, Info, Building2 } from "lucide-react"
import { formatCNPJ, formatCurrency, formatQuantity } from "@/lib/utils";
import { LeadDetailsSheet } from "@/components/LeadDetailsSheet";
import { LeadsFilter, UFS, SITUACOES } from "@/components/LeadsFilter";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

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
                    <Button variant="outline" size="sm" className="h-9 shadow-sm hover:bg-primary/5 transition-all">
                        <Download className="mr-2 h-4 w-4" /> Exportar Dados
                    </Button>
                }
            />

            <LeadsFilter
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                onClear={clearFilters}
                loading={loading}
            />

            <Card className="border-primary/5 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                    <div>
                        <CardTitle className="text-lg">Empresas Encontradas</CardTitle>
                        <CardDescription>Visualizando {formatQuantity(leads.length)} leads qualificados.</CardDescription>
                    </div>
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
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-sm text-muted-foreground animate-pulse">Consultando ClickHouse...</span>
                                            </div>
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
        </PageContent>
    )
}
