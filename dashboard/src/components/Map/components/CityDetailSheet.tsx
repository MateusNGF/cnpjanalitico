import React, { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { HoveredCity } from '../types';
import { BarChart3, Building2, Users, MapPin, TrendingUp, ShieldCheck, Landmark, Wallet, Coins, Briefcase } from 'lucide-react';
import { formatNumber } from "@/lib/utils";

interface CityDetailSheetProps {
    selectedCity: HoveredCity | null;
    onClose: () => void;
}

export const CityDetailSheet = ({ selectedCity, onClose }: CityDetailSheetProps) => {
    const [ibgeStats, setIbgeStats] = useState<{
        population: number;
        pib: number;
        pib_per_capita: number;
        formal_jobs: number;
        avg_salary: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedCity) {
            setIbgeStats(null);
            return;
        }

        setLoading(true);
        fetch(`/api/ibge/stats?ibge_code=${selectedCity.codigo}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setIbgeStats(data);
            })
            .catch(err => console.error("IBGE Fetch Error:", err))
            .finally(() => setLoading(false));
    }, [selectedCity?.codigo]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(val);
    };

    return (
        <Sheet open={!!selectedCity} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-white/10 text-white p-0 overflow-y-auto">
                {selectedCity && (
                    <div className="flex flex-col h-full">
                        {/* Header Image/Pattern */}
                        <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <Building2 className="w-64 h-64 -rotate-12 translate-x-12 translate-y-8" />
                            </div>
                            <div className="relative z-10 p-8 text-left w-full h-full flex flex-col justify-end">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-blue-200" />
                                    <span className="text-[10px] text-blue-100 uppercase font-black tracking-widest opacity-80">Painel do Município</span>
                                </div>
                                <SheetHeader className="p-0 text-left">
                                    <SheetTitle className="text-3xl font-black tracking-tighter text-white m-0">
                                        {selectedCity.nome}
                                    </SheetTitle>
                                    <SheetDescription className="text-blue-100/60 font-mono text-[10px] m-0">
                                        CÓDIGO IBGE: {selectedCity.codigo}
                                    </SheetDescription>
                                </SheetHeader>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 flex-1">
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2 group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Empresas Ativas</span>
                                    </div>
                                    <p className="text-3xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                                        {formatNumber(selectedCity.densidade)}
                                    </p>
                                </div>
                                <div className={`p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2 transition-all ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <Users className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-black tracking-widest">População (2022)</span>
                                    </div>
                                    <p className="text-3xl font-black tracking-tighter text-white">
                                        {ibgeStats ? formatNumber(ibgeStats.population) : (loading ? '...' : 'N/D')}
                                    </p>
                                </div>
                            </div>

                            {/* Section: Economic Performance */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <h4 className="text-sm font-black uppercase italic tracking-tighter text-zinc-300">Resumo de Atividade</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className={`flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group ${loading ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20">
                                                <Landmark className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">PIB Municipal</span>
                                        </div>
                                        <span className="text-sm font-black text-orange-400">
                                            {ibgeStats ? formatCurrency(ibgeStats.pib) : (loading ? '...' : 'N/D')}
                                        </span>
                                    </div>

                                    <div className={`flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group ${loading ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                                                <Coins className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">PIB Per Capita</span>
                                        </div>
                                        <span className="text-sm font-black text-blue-400">
                                            {ibgeStats ? formatCurrency(ibgeStats.pib_per_capita) : (loading ? '...' : 'N/D')}
                                        </span>
                                    </div>

                                    <div className={`flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group ${loading ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
                                                <Wallet className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">Salário Médio</span>
                                        </div>
                                        <span className="text-sm font-black text-emerald-400">
                                            {ibgeStats ? `${ibgeStats.avg_salary.toFixed(1)} SM` : (loading ? '...' : 'N/D')}
                                        </span>
                                    </div>

                                    <div className={`flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group ${loading ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center group-hover:bg-zinc-500/20">
                                                <Briefcase className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">Pessoal Ocupado</span>
                                        </div>
                                        <span className="text-sm font-black text-zinc-300">
                                            {ibgeStats ? formatNumber(ibgeStats.formal_jobs) : (loading ? '...' : 'N/D')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder for deeper insights */}
                            <div className="p-8 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-zinc-900/30">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                                    <BarChart3 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white tracking-tight">Análise Setorial por Bairro</p>
                                    <p className="text-[10px] text-zinc-500 max-w-[220px]">Estamos conectando as fontes de dados para liberar a visão detalhada de bairros e logradouros.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-8 border-t border-white/5 bg-zinc-950/50">
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Visualizar Relatório Completo
                            </button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
