'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart3, TrendingUp, ShieldCheck, Landmark, Globe2, Briefcase, ChevronDown, Check, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useFilterStore } from '@/store/use-filter-store';
import { useDataStore } from '@/store/use-data-store';

// Componente para auto-ajuste do mapa
const AutoZoom = ({ bounds }: { bounds: L.LatLngBounds | null }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20], duration: 1.5 });
        }
    }, [bounds, map]);
    return null;
};

const MapLegend = () => {
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

interface State {
    codigo_uf: number;
    nome: string;
    sigla: string;
    flag_url: string;
    regiao: string;
}

interface MunicipalData {
    id: string;
    nome: string;
    value: number;
}

const MapaMalha = () => {
    const { uf, setUf } = useFilterStore();
    const { data: stateStats, loading: statsLoading } = useDataStore(s => s.stats);
    const { data: mapData, loading: mapLoading } = useDataStore(s => s.map);
    const fetchStats = useDataStore(s => s.fetchStats);
    const fetchMap = useDataStore(s => s.fetchMap);

    const [estados, setEstados] = useState<State[]>([]);
    const [geoData, setGeoData] = useState<any>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loading = statsLoading || mapLoading || geoLoading;

    // Dados de Negócio
    const [municipalStats, setMunicipalStats] = useState<Map<string, MunicipalData>>(new Map());
    const [hoveredCity, setHoveredCity] = useState<any>(null);

    // Carregar Estados do DB
    useEffect(() => {
        fetch('/api/estados')
            .then(res => res.json())
            .then(data => setEstados(data))
            .catch(err => console.error("Erro ao carregar estados:", err));
    }, []);

    useEffect(() => {
        setGeoLoading(true);
        setGeoData(null);
        setMunicipalStats(new Map());

        const isNational = uf === 'BR';
        const geoUrl = isNational
            ? `https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=estado`
            : `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio`;

        // Fetch Business Data via Store
        fetchStats({ uf });
        fetchMap({ uf });

        // Fetch GeoJSON locally (as it's a direct IBGE call)
        fetch(geoUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(geo => {
                if (!geo || typeof geo !== 'object' || (!geo.features && geo.type !== 'Feature')) {
                    throw new Error("Invalid GeoJSON received from IBGE");
                }
                setGeoData(geo);
                try {
                    const layer = L.geoJSON(geo);
                    setMapBounds(layer.getBounds());
                } catch (e) {
                    console.error("Error creating Leaflet layer:", e);
                }
                setGeoLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar malha:", err);
                setGeoLoading(false);
            });
    }, [uf, fetchStats, fetchMap]);

    // Processar dados do mapa quando o store atualizar
    useEffect(() => {
        const statsMap = new Map();
        if (Array.isArray(mapData)) {
            mapData.forEach((item: any) => {
                statsMap.set(String(item.id), {
                    id: item.id,
                    nome: item.nome || "Município",
                    value: item.value || 0
                });
            });
        }
        setMunicipalStats(statsMap);
    }, [mapData]);

    const currentUF = estados.find(e => e.sigla === uf) || { sigla: uf, nome: uf, flag_url: '' };

    const maxDensity = useMemo(() => {
        const values = Array.from(municipalStats.values()).map(v => v.value);
        return values.length > 0 ? Math.max(...values) : 100;
    }, [municipalStats]);

    const getColor = (density: number) => {
        if (density === 0) return 'transparent';

        const logMax = Math.log10(maxDensity + 1);
        const logVal = Math.log10(density + 1);
        const ratio = logVal / logMax;

        // "Darker = Denser" Logic
        if (ratio > 0.9) return '#172554'; // Midnight Blue (Peak)
        if (ratio > 0.7) return '#1e3a8a';
        if (ratio > 0.5) return '#2563eb';
        if (ratio > 0.3) return '#3b82f6';
        return '#60a5fa'; // Light Blue (Residual)
    };

    const geoJsonStyle = (feature: any) => {
        const codigo = String(feature.properties?.codarea || feature.id || feature.properties?.id || "");
        const mData = municipalStats.get(codigo);
        const density = mData?.value || 0;

        const logMax = Math.log10(maxDensity + 1);
        const logVal = Math.log10(density + 1);
        const ratio = density === 0 ? 0 : logVal / logMax;

        return {
            fillColor: getColor(density),
            weight: 0.1,
            opacity: 1,
            color: '#ffffff30', // Clearer white borders for contrast against dark navy
            fillOpacity: ratio === 0 ? 0 : 0.2 + (ratio * 0.75), // Higher density = more solid
        };
    };

    const formatCurrency = (val: number) => {
        if (!val || isNaN(val)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val);
    };

    const filteredEstados = estados.filter(e =>
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sigla.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-sans">

            {/* Seletor de Estado Dinâmico */}
            <div className="absolute top-6 right-6 z-[1000]">
                <div className="relative">
                    <button
                        onClick={() => setSelectorOpen(!selectorOpen)}
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
                        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", selectorOpen && "rotate-180")} />
                    </button>

                    {selectorOpen && (
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
                                            setSelectorOpen(false);
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

            {/* Painel de Informações (Esquerda) */}
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
                            <div className="flex items-center justify-between">
                                <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                                    {stateStats ? (stateStats.natalidade?.toLocaleString() ?? '0') : '---'}
                                </p>
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/5"></div>

                        {/* Top CNAE */}
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 flex-shrink-0 mt-0.5">
                                    <Briefcase className="w-4 h-4 text-orange-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Setor Predominante</p>
                                    <p className="text-xs font-bold text-white leading-tight truncate-2-lines">
                                        {stateStats?.topCnae || 'Carregando...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <Landmark className="w-3.5 h-3.5 text-blue-400 mb-1" />
                                <p className="text-[8px] text-zinc-500 uppercase font-bold leading-none">Cap. Social</p>
                                <p className="text-xs font-black text-white">
                                    {stateStats ? formatCurrency(stateStats.capital) : '---'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                                <p className="text-[8px] text-zinc-500 uppercase font-bold leading-none">Sobrevivência</p>
                                <p className="text-xs font-black text-white">
                                    {stateStats ? `${(stateStats.survival ?? 0).toFixed(1)} anos` : '---'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info do Município Hovered */}
                <div className={`transition-all duration-300 transform ${hoveredCity ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none'}`}>
                    <div className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden pointer-events-auto">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BarChart3 className="w-16 h-16" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[9px] text-blue-100 uppercase font-black tracking-tighter mb-1">Detalhes municipais</p>
                            <h3 className="text-xl font-bold text-white leading-tight mb-0.5">{hoveredCity?.nome}</h3>
                            <p className="text-[10px] font-mono text-blue-100 opacity-60">CÓD IBGE: {hoveredCity?.codigo}</p>

                            <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-blue-100 font-bold uppercase opacity-80">Empresas Ativas</span>
                                    <span className="text-lg font-black text-white tracking-tighter">{hoveredCity?.densidade.toLocaleString()} unid.</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Globe2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-blue-500 font-mono text-xs tracking-widest animate-pulse uppercase">Syncing Map Engine...</p>
                    </div>
                </div>
            )}

            <MapLegend />

            <MapContainer
                center={[-19.9, -43.9]}
                zoom={6}
                style={{ height: '100%', width: '100%', background: 'black' }}
                zoomControl={false}
                attributionControl={false}
            >
                {geoData && (
                    <>
                        <GeoJSON
                            key={uf}
                            data={geoData}
                            style={geoJsonStyle}
                            onEachFeature={(feature, layer) => {
                                const codigo = String(feature.properties?.codarea || feature.id || feature.properties?.id || "");
                                const mData = municipalStats.get(codigo);
                                const nome = mData?.nome || feature.properties.name || "Município";
                                const densidade = mData?.value || 0;

                                layer.on({
                                    mouseover: (e) => {
                                        const l = e.target;
                                        l.setStyle({ weight: 1.5, color: '#fff', fillOpacity: 0.9 });
                                        setHoveredCity({ nome, codigo, densidade });
                                    },
                                    mouseout: (e) => {
                                        const l = e.target;
                                        l.setStyle({ weight: 0.5, color: '#333', fillOpacity: 0.8 });
                                        setHoveredCity(null);
                                    }
                                });

                                layer.bindTooltip(`
                                  <div style="background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 12px; color: white; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                    <div style="font-size: 13px; font-weight: 800; letter-spacing: -0.01em; color: #fff;">${nome}</div>
                                    <div style="font-size: 10px; color: #3b82f6; font-weight: 700; margin-top: 2px;">Densidade: ${densidade.toLocaleString()} unid.</div>
                                    <div style="font-size: 9px; color: #555; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">IBGE: ${codigo}</div>
                                  </div>
                                `, { sticky: false, direction: 'top', offset: [0, -10], opacity: 1, className: 'minimal-tooltip' });

                                // Permanet labels for high density
                                if (densidade > (maxDensity * 0.7)) {
                                    layer.bindTooltip(`${nome}`, {
                                        permanent: true,
                                        direction: 'center',
                                        className: 'permanent-city-label',
                                        opacity: 0.7
                                    });
                                }
                            }}
                        />
                        {mapBounds && <AutoZoom bounds={mapBounds} />}
                    </>
                )}
            </MapContainer>

            <style jsx global>{`
        .leaflet-tooltip.minimal-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip.permanent-city-label {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: rgba(255,255,255,0.5) !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            pointer-events: none !important;
            text-shadow: 0 0 4px rgba(0,0,0,0.8) !important;
        }
        .leaflet-tooltip-pane { z-index: 1000 !important; }
        .truncate-2-lines {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default MapaMalha;
