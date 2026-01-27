'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useMapData } from './hooks/use-map-data';
import { MapLegend } from './components/MapLegend';
import { MapSelector } from './components/MapSelector';
import { MapAnalysisPanel } from './components/MapAnalysisPanel';
import { CityDetailSheet } from './components/CityDetailSheet';
import { HoveredCity } from './types';

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

const MapaMalha = () => {
    const {
        uf,
        setUf,
        estados,
        stateStats,
        geoData,
        mapBounds,
        municipalStats,
        maxDensity,
        currentUF,
        loading,
        mapLoading
    } = useMapData();

    const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null);
    const [selectedCity, setSelectedCity] = useState<HoveredCity | null>(null);

    const getColor = (density: number) => {
        if (!density || density === 0) return '#ffffff05';

        const logMax = Math.log10(maxDensity + 2);
        const logVal = Math.log10(density + 1);
        const ratio = logVal / logMax;

        if (ratio > 0.9) return '#172554';
        if (ratio > 0.7) return '#1e3a8a';
        if (ratio > 0.5) return '#2563eb';
        if (ratio > 0.3) return '#3b82f6';
        return '#60a5fa';
    };

    const geoJsonStyle = (feature: any) => {
        const codigo = String(feature.properties?.codarea || feature.id || feature.properties?.id || "").trim();
        const mData = municipalStats.get(codigo);
        const density = mData?.value || 0;
        const isHovered = hoveredCity?.codigo === codigo;

        const logMax = Math.log10(maxDensity + 1);
        const logVal = Math.log10(density + 1);
        const ratio = density === 0 ? 0 : logVal / logMax;

        return {
            fillColor: getColor(density),
            weight: isHovered ? 3 : 0.1,
            opacity: 1,
            color: isHovered ? '#ffffff' : '#ffffff30',
            fillOpacity: isHovered ? 0.95 : (ratio === 0 ? 0 : 0.2 + (ratio * 0.75)),
        };
    };

    return (
        <div className="relative w-full h-full bg-[#050505] overflow-hidden font-sans">
            <MapSelector uf={uf} setUf={setUf} estados={estados} currentUF={currentUF} />
            <MapAnalysisPanel stats={stateStats} />

            <CityDetailSheet
                selectedCity={selectedCity}
                uf={uf}
                onClose={() => setSelectedCity(null)}
            />


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
                style={{ height: '100%', width: '100%', background: '#050505' }}
                zoomControl={false}
                attributionControl={false}
            >
                {geoData && (
                    <>
                        <GeoJSON
                            key={`${uf}-${mapLoading}-${municipalStats.size}`}
                            data={geoData}
                            style={geoJsonStyle}
                            onEachFeature={(feature, layer) => {
                                const codigo = String(feature.properties?.codarea || feature.id || feature.properties?.id || "").trim();
                                const mData = municipalStats.get(codigo);
                                const nome = mData?.nome || feature.properties.NM_MUN || feature.properties.name || "Município";
                                const densidade = mData?.value || 0;

                                const logMax = Math.log10(maxDensity + 1);
                                const logVal = Math.log10(densidade + 1);
                                const ratio = densidade === 0 ? 0 : logVal / logMax;

                                layer.on({
                                    mouseover: (e) => {
                                        const l = e.target;
                                        l.setStyle({
                                            weight: 3,
                                            color: '#ffffff',
                                            fillOpacity: 0.95,
                                            opacity: 1
                                        });
                                        l.bringToFront();
                                        setHoveredCity({ nome, codigo, densidade });
                                    },
                                    mouseout: (e) => {
                                        const l = e.target;
                                        l.setStyle({
                                            weight: 0.1,
                                            color: '#ffffff30',
                                            fillOpacity: ratio === 0 ? 0 : 0.2 + (ratio * 0.75)
                                        });
                                        setHoveredCity(null);
                                    },
                                    click: () => {
                                        setSelectedCity({ nome, codigo, densidade });
                                    }
                                });

                                layer.bindTooltip(`
                                  <div style="background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 12px; color: white; font-family: inherit;">
                                    <div style="font-size: 11px; font-weight: 800; color: #fff; margin-bottom: 4px;">${nome.toUpperCase()}</div>
                                    <div style="font-size: 10px; color: #60a5fa; font-weight: 600;">Empresas: ${densidade.toLocaleString()}</div>
                                    <div style="font-size: 8px; color: #555; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">COD: ${codigo}</div>
                                  </div>
                                `, { sticky: true, direction: 'top', offset: [0, -10], opacity: 1, className: 'minimal-tooltip' });

                                if (maxDensity > 0 && densidade > (maxDensity * 0.85)) {
                                    layer.bindTooltip(`${nome}`, {
                                        permanent: true,
                                        direction: 'center',
                                        className: 'permanent-city-label',
                                        opacity: 0.5
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
