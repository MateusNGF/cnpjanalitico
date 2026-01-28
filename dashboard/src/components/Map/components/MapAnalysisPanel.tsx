import React, { memo } from 'react';
import { TrendingUp, Briefcase, Landmark, ShieldCheck } from 'lucide-react';
import { formatNumber } from "@/lib/utils";
import { StateStats } from '../types';

interface MapAnalysisPanelProps {
    stats: StateStats | null;
}

export const MapAnalysisPanel = memo(({ stats }: MapAnalysisPanelProps) => {
    const formatCurrency = (val: number) => {
        if (!val || isNaN(val)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val);
    };

    return (
        <div className="absolute top-6 left-6 z-[1000] w-72 flex flex-col gap-4 pointer-events-none">
            <div className="bg-zinc-950/60 backdrop-blur-xl border border-white/5 p-5 rounded-3xl shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">
                        Análise territorial
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="group transition-all">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5 opacity-70">Empresas Ativas no Estado</p>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                                {stats ? (stats.natalidade?.toLocaleString() ?? '0') : '---'}
                            </p>
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>

                        {/* Porte Distribution */}
                        {/* <div className="space-y-4">
                            <div className="flex h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                {stats?.porteDist?.map((p: any, i: number) => {
                                    const colors = {
                                        'MEI': 'bg-blue-500',
                                        'PEQUENA': 'bg-emerald-500',
                                        'GRANDE': 'bg-orange-500',
                                        'OUTROS': 'bg-zinc-700'
                                    };
                                    const width = (p.value / stats.natalidade) * 100;
                                    return (
                                        <div
                                            key={i}
                                            className={`h-full ${colors[p.label as keyof typeof colors] || 'bg-zinc-700'} transition-all`}
                                            style={{ width: `${width}%` }}
                                            title={`${p.label}: ${formatNumber(p.value)}`}
                                        />
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {['MEI', 'PEQUENA', 'GRANDE'].map(label => {
                                    const p = stats?.porteDist?.find((d: any) => d.label === label);
                                    const colors = {
                                        'MEI': 'text-blue-400',
                                        'PEQUENA': 'text-emerald-400',
                                        'GRANDE': 'text-orange-400'
                                    };
                                    return (
                                        <div key={label} className="flex flex-col">
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${colors[label as keyof typeof colors]}`}>
                                                {label}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-white">
                                                {p ? formatNumber(p.value) : '0'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div> */}
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                                <Briefcase className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest opacity-70">Top 5 Setores (CNAE)</p>
                        </div>
                        <div className="space-y-3">
                            {stats?.topCnaes?.map((cnae: any, idx: number) => (
                                <div key={idx} className="flex flex-col gap-1 group/item">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-zinc-400 font-bold pr-4 group-hover/item:text-white transition-colors whitespace-normal leading-tight">
                                            {idx + 1}. {cnae.label}
                                        </span>
                                        <span className="text-orange-400/80 font-mono font-bold">{formatNumber(cnae.value)}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500/40 group-hover/item:bg-orange-500/60 transition-all rounded-full"
                                            style={{ width: `${(cnae.value / stats.topCnaes[0].value) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-[10px] text-zinc-600 italic">Carregando setores...</p>
                                )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <Landmark className="w-3.5 h-3.5 text-blue-400 mb-1" />
                            <p className="text-[8px] text-zinc-500 uppercase font-bold leading-none">Cap. Social</p>
                            <p className="text-xs font-black text-white">
                                {stats ? formatCurrency(stats.capital) : '---'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                            <p className="text-[8px] text-zinc-500 uppercase font-bold leading-none">Sobrevivência</p>
                            <p className="text-xs font-black text-white">
                                {stats ? `${(stats.survival ?? 0).toFixed(1)} anos` : '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
