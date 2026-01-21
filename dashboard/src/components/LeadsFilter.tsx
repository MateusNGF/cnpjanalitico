"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Filter,
    X,
    Loader2,
    MapPin,
    Briefcase,
    Activity,
    DollarSign,
    Settings2
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const UFS = ["TODOS", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export const SITUACOES = [
    { value: "02", label: "ATIVA" },
    { value: "04", label: "INAPTA" },
    { value: "08", label: "BAIXADA" },
    { value: "03", label: "SUSPENSA" },
    { value: "01", label: "NULA" },
    { value: "TODOS", label: "TODAS" },
];

interface FilterState {
    cnae: string;
    uf: string;
    municipio: string;
    situacao: string;
    capital_min: string;
}

interface UFSelectorProps {
    value: string;
    onChange: (val: string) => void;
}

export function UFSelector({ value, onChange }: UFSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-9 max-w-[200px] bg-background/50 border-primary/10 hover:border-primary/30 transition-all font-bold text-xs rounded-xl shadow-sm">
                <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <SelectValue placeholder="UF" />
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
                {UFS.map(uf => (
                    <SelectItem key={uf} value={uf} className="font-medium text-xs">
                        {uf === 'TODOS' ? 'BR (Todos)' : uf}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

interface AdvancedFiltersTriggerProps {
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    onSearch: () => void;
    onClear: () => void;
    loading: boolean;
}

export function AdvancedFiltersTrigger({ filters, setFilters, onSearch, onClear, loading }: AdvancedFiltersTriggerProps) {
    const activeFiltersCount = [
        filters.cnae,
        filters.municipio,
        filters.situacao !== '02' && filters.situacao !== 'TODOS' ? filters.situacao : null,
        filters.capital_min
    ].filter(Boolean).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-9 px-3 gap-2 rounded-xl transition-all font-bold text-xs border-primary/10",
                        activeFiltersCount > 0 ? "text-primary bg-primary/5 hover:bg-primary/10 border-primary/20" : "text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md rounded-l-[32px] border-l bg-background/95 backdrop-blur-xl p-8 shadow-2xl">
                <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Filter className="h-5 w-5 text-primary" />
                        </div>
                        Filtros Avançados
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" /> Município
                        </label>
                        <Input
                            placeholder="Buscar por município..."
                            className="h-12 bg-muted/30 border-primary/5 hover:border-primary/20 rounded-xl focus:bg-background transition-all"
                            value={filters.municipio}
                            onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" /> CNAE / Atividade
                        </label>
                        <Input
                            placeholder="Ex: 6201501"
                            className="h-12 bg-muted/30 border-primary/5 hover:border-primary/20 rounded-xl focus:bg-background transition-all"
                            value={filters.cnae}
                            onChange={(e) => setFilters({ ...filters, cnae: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" /> Situação Cadastral
                        </label>
                        <Select
                            value={filters.situacao}
                            onValueChange={(val) => setFilters({ ...filters, situacao: val })}
                        >
                            <SelectTrigger className="h-12 bg-muted/30 border-primary/5 rounded-xl">
                                <SelectValue placeholder="Situação" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {SITUACOES.map(s => (
                                    <SelectItem key={s.value} value={s.value} className="font-medium text-sm">{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5" /> Capital Social Mínimo
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                            <Input
                                type="number"
                                placeholder="0,00"
                                className="h-12 pl-12 bg-muted/30 border-primary/5 rounded-xl"
                                value={filters.capital_min}
                                onChange={(e) => setFilters({ ...filters, capital_min: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-primary/10 flex flex-col gap-3">
                    <Button
                        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-xl shadow-primary/20"
                        onClick={onSearch}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Aplicar Filtros"}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-2xl border-primary/10 hover:bg-muted/50 text-muted-foreground font-bold"
                        onClick={onClear}
                    >
                        <X className="mr-2 h-4 w-4" /> Limpar Filtros
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function LeadsFilter(props: any) {
    return null;
}
