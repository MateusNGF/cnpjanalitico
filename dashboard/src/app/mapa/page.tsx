'use client';

import dynamic from 'next/dynamic';

const MapaMalha = dynamic(() => import('@/components/Map/MapaMalha'), {
    ssr: false,
    loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-zinc-500 font-mono">Inicializando...</div>
});

export default function AnaliseGeoPage() {
    return (
        <div className="h-screen w-screen bg-black overflow-hidden">
            <MapaMalha />
        </div>
    );
}
