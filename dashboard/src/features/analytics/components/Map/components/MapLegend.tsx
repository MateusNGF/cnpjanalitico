import React from 'react';

export const MapLegend = () => {
    return (
        <div className="absolute bottom-6 right-6 z-[1000] bg-zinc-950/40 backdrop-blur-md border border-white/5 p-3 px-4 rounded-2xl shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
                <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Densidade Empresarial</span>
                <span className="text-[8px] text-zinc-600 font-mono italic text-right">Transparência p/ Intensidade</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-400 font-bold uppercase opacity-50">Residual</span>
                <div className="h-1.5 w-32 rounded-full border border-white/5 shadow-inner" style={{
                    background: 'linear-gradient(90deg, #60a5fa 0%, #2563eb 50%, #172554 100%)'
                }}></div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase">Denso</span>
            </div>
        </div>
    );
};
