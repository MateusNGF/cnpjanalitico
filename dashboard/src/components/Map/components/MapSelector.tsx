import React, { useState } from 'react';
import { Search, ChevronDown, Check, Globe2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { State } from '../types';

interface MapSelectorProps {
    uf: string;
    setUf: (uf: string) => void;
    estados: State[];
    currentUF: any;
}

export const MapSelector = ({ uf, setUf, estados, currentUF }: MapSelectorProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEstados = estados.filter(e =>
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sigla.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="absolute top-6 right-6 z-[1000]">
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-2 px-4 rounded-xl flex items-center gap-3 text-white hover:bg-zinc-900 transition-all shadow-2xl min-w-[200px] justify-between"
                >
                    <div className="flex items-center gap-3">
                        {currentUF?.flag_url ? (
                            <img src={currentUF.flag_url} alt={currentUF.nome} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                        ) : (
                            <Globe2 className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm font-bold tracking-tight">{currentUF?.nome || uf}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[1001]">
                        <div className="p-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar estado..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-zinc-800">
                            {filteredEstados.map((estado) => (
                                <button
                                    key={estado.sigla}
                                    onClick={() => {
                                        setUf(estado.sigla);
                                        setOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={cn(
                                        "w-full px-4 py-2.5 flex items-center gap-3 text-xs hover:bg-white/5 transition-colors text-left",
                                        uf === estado.sigla ? "text-blue-400 font-bold bg-white/5" : "text-zinc-400"
                                    )}
                                >
                                    <div className="w-7 h-5 rounded-sm bg-zinc-900 overflow-hidden flex items-center justify-center border border-white/5 shadow-sm">
                                        {estado.flag_url ? (
                                            <img src={estado.flag_url} alt={estado.sigla} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] font-black">{estado.sigla}</span>
                                        )}
                                    </div>
                                    <span className="flex-1 truncate">{estado.nome}</span>
                                    {uf === estado.sigla && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
