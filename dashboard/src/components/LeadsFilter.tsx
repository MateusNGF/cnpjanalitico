"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    Filter,
    X,
    Loader2,
    ChevronDown,
    ChevronUp,
    MapPin,
    Briefcase,
    Activity,
    DollarSign
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";

interface LeadsFilterProps {
    filters: {
        cnae: string;
        uf: string;
        municipio: string;
        situacao: string;
        capital_min: string;
    };
    setFilters: (filters: any) => void;
    onSearch: (e: React.FormEvent) => void;
    onClear: () => void;
    loading: boolean;
}

export const UFS = ["TODOS", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export const SITUACOES = [
    { value: "02", label: "ATIVA" },
    { value: "04", label: "INAPTA" },
    { value: "08", label: "BAIXADA" },
    { value: "03", label: "SUSPENSA" },
    { value: "01", label: "NULA" },
    { value: "TODOS", label: "TODAS" },
];

export function LeadsFilter({ filters, setFilters, onSearch, onClear, loading }: LeadsFilterProps) {
    return (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
            <CardContent className="p-6">
                <form onSubmit={onSearch} className="space-y-4">
                    {/* Primary Filters Row */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Estado (UF)
                            </label>
                            <Select
                                value={filters.uf}
                                onValueChange={(val) => setFilters({ ...filters, uf: val })}
                            >
                                <SelectTrigger className="h-10 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors">
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
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Briefcase className="h-3 w-3" /> CNAE / Atividade
                            </label>
                            <div className="relative">
                                <Input
                                    placeholder="Ex: 6201501"
                                    className="h-10 pl-9 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors"
                                    value={filters.cnae}
                                    onChange={(e) => setFilters({ ...filters, cnae: e.target.value })}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="h-3 w-3" /> Situação Cadastral
                            </label>
                            <Select
                                value={filters.situacao}
                                onValueChange={(val) => setFilters({ ...filters, situacao: val })}
                            >
                                <SelectTrigger className="h-10 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors">
                                    <SelectValue placeholder="Situação" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SITUACOES.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters (Collapsible) */}
                    <Accordion type="single" collapsible className="border-none">
                        <AccordionItem value="advanced" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline text-xs text-primary font-semibold flex justify-start gap-2">
                                <Filter className="h-3 w-3" /> Filtros Avançados
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> Município
                                        </label>
                                        <Input
                                            placeholder="Ex: Curitiba"
                                            className="h-10 bg-background/50 border-primary/10"
                                            value={filters.municipio}
                                            onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                            <DollarSign className="h-3 w-3" /> Capital Social Mínimo
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Ex: 50000"
                                            className="h-10 bg-background/50 border-primary/10"
                                            value={filters.capital_min}
                                            onChange={(e) => setFilters({ ...filters, capital_min: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <X className="mr-2 h-4 w-4" /> Limpar tudo
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar Oportunidades
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
