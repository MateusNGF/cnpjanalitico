import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Building2, MapPin, Phone, Mail, FileText,
    Calendar, DollarSign, Activity, Copy, Check,
    Globe, Smartphone, CreditCard
} from "lucide-react"
import { formatCNPJ, formatCurrency } from "@/lib/utils"

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

interface LeadDetailsSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!lead) return null;

    const fullCNPJ = `${lead.cnpj_basico}${lead.cnpj_ordem}${lead.cnpj_dv}`;
    const formattedCNPJ = formatCNPJ(fullCNPJ);

    const handleCopy = (text: string | null, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getSituacaoLabel = (code: string) => {
        const map: Record<string, string> = {
            "02": "ATIVA",
            "04": "INAPTA",
            "08": "BAIXADA",
            "03": "SUSPENSA",
            "01": "NULA"
        };
        return map[code] || code;
    };

    const getSituacaoStyle = (code: string) => {
        if (code === '02') return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25";
        if (code === '08') return "bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/25";
        return "bg-slate-500/15 text-slate-600 border-slate-500/20 hover:bg-slate-500/25";
    };

    const CopyButton = ({ text, field }: { text: string | null, field: string }) => {
        if (!text) return null;
        return (
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(text, field)}
                title="Copiar"
            >
                {copiedField === field ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 overflow-hidden flex flex-col gap-0 border-l border-border/40 shadow-2xl">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b p-6 pb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Building2 className="h-32 w-32" />
                    </div>

                    <div className="flex justify-between items-start relative z-10 mb-4">
                        <Badge variant="outline" className={`px-2.5 py-1 text-xs font-bold tracking-wide ${getSituacaoStyle(lead.situacao_cadastral)}`}>
                            {getSituacaoLabel(lead.situacao_cadastral)}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground bg-background/50 backdrop-blur px-2 py-1 rounded border">
                            Última atualização: Hoje
                        </span>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 leading-tight mb-1 pr-8">
                            {lead.razao_social || "RAZÃO SOCIAL NÃO INFORMADA"}
                        </h2>
                        {lead.nome_fantasia && lead.nome_fantasia !== lead.razao_social && (
                            <p className="text-muted-foreground uppercase text-sm font-medium tracking-wide mb-2">
                                {lead.nome_fantasia}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/5 w-fit">
                            <FileText className="h-4 w-4 text-primary/70" />
                            <span className="font-mono text-sm text-foreground/80">{formattedCNPJ}</span>
                            <CopyButton text={formattedCNPJ} field="cnpj" />
                        </div>
                    </div>
                </div>

                {/* Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Contact Section */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <span className="bg-primary/10 p-1 rounded-sm"><Phone className="h-3 w-3 text-primary" /></span>
                            Canais de Contato
                        </h3>
                        <div className="grid gap-3">
                            <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between group hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">E-mail Corporativo</span>
                                        <span className="text-sm font-medium truncate" title={lead.correio_eletronico || ""}>
                                            {lead.correio_eletronico ? lead.correio_eletronico.toLowerCase() : <span className="text-muted-foreground italic">Não informado</span>}
                                        </span>
                                    </div>
                                </div>
                                <CopyButton text={lead.correio_eletronico} field="email" />
                            </div>

                            <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between group hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Smartphone className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Telefone Principal</span>
                                        <span className="text-sm font-medium font-mono">
                                            {lead.ddd1 && lead.telefone1
                                                ? `(${lead.ddd1}) ${lead.telefone1}`
                                                : <span className="text-muted-foreground italic">Não informado</span>}
                                        </span>
                                    </div>
                                </div>
                                <CopyButton text={lead.ddd1 && lead.telefone1 ? `${lead.ddd1}${lead.telefone1}` : null} field="phone" />
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Financial & Corporate Data */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <span className="bg-primary/10 p-1 rounded-sm"><Building2 className="h-3 w-3 text-primary" /></span>
                            Dados Corporativos
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        <span className="text-[10px] uppercase font-bold">Capital Social</span>
                                    </div>
                                    <span className="text-lg font-bold text-primary">
                                        {lead.capital_social ? formatCurrency(lead.capital_social) : "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span className="text-[10px] uppercase font-bold">Natureza</span>
                                    </div>
                                    <span className="text-sm font-medium leading-tight">
                                        Empresarial
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Location */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <span className="bg-primary/10 p-1 rounded-sm"><MapPin className="h-3 w-3 text-primary" /></span>
                            Localização
                        </h3>
                        <div className="relative rounded-lg border bg-muted/10 p-4">
                            <div className="absolute top-4 right-4 bg-primary/10 p-2 rounded-full">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-4 pr-12">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Município / UF</p>
                                    <p className="text-lg font-medium">{lead.municipio} - <span className="text-primary font-bold">{lead.uf}</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Logradouro</p>
                                        <p className="text-sm text-foreground/80">-</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Bairro</p>
                                        <p className="text-sm text-foreground/80">-</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
