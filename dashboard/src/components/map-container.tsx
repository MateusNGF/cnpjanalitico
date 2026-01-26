"use client"

import dynamic from "next/dynamic"
import { useDashboard } from "@/components/dashboard-context"
import { Card } from "@/components/ui/card"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { MOCK_GEOJSON } from "@/lib/mock-geojson"

interface MapStats {
    municipio: string
    total_active_companies: number
    density_value: number
}

// Dynamic import to avoid SSR issues with Leaflet
const DynamicMap = dynamic<any>(() => import("@/components/ui/map-client"), {
    loading: () => <Skeleton className="w-full h-full bg-slate-100" />,
    ssr: false,
})

export function MapContainer() {
    const { uf, setCity } = useDashboard()
    const [geoData, setGeoData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadMap() {
            if (!uf || uf === "BR") {
                setGeoData(null)
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                // 1. Fetch geometry from IBGE
                const geoUrl = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo+json&qualidade=minima&resolucao=municipio`;
                const statsUrl = `/api/stats/map?uf=${uf}`; // Adjusted endpoint name for clarity

                const [geoRes, statsRes] = await Promise.all([
                    fetch(geoUrl),
                    fetch(`/api/map?uf=${uf}`)
                ]);

                if (!geoRes.ok || !statsRes.ok) throw new Error("Failed to fetch map data");

                const geoJson = await geoRes.json();
                const stats = await statsRes.json();

                // 2. Merge data
                const statsMap = new Map(stats.map((s: any) => [s.id, s.value]));

                const enrichedGeoJson = {
                    ...geoJson,
                    features: geoJson.features.map((feature: any) => ({
                        ...feature,
                        properties: {
                            ...feature.properties,
                            density: statsMap.get(feature.id) || 0,
                            name: feature.properties.codarea // Initially name is code, we could map to name if available
                        }
                    }))
                };

                setGeoData(enrichedGeoJson);
            } catch (error) {
                console.error("Error loading map:", error);
            } finally {
                setLoading(false)
            }
        }
        loadMap()
    }, [uf])

    const handleRegionClick = (regionName: string) => {
        setCity(regionName)
    }

    const mapCenter: [number, number] = useMemo(() => {
        const centers: Record<string, [number, number]> = {
            "BR": [-15.79, -47.88],
            "SP": [-23.55, -46.63],
            "RJ": [-22.90, -43.17],
            "MG": [-19.81, -43.95],
            "RS": [-30.03, -51.21],
            "PR": [-25.42, -49.27],
            "SC": [-27.59, -48.54],
            "BA": [-12.97, -38.50],
            "PE": [-8.05, -34.88],
            "CE": [-3.71, -38.54],
            "DF": [-15.79, -47.88],
            "GO": [-16.68, -49.25],
            "ES": [-20.31, -40.31],
            "AL": [-9.66, -35.73],
            "AM": [-3.11, -60.02],
            "AP": [0.03, -51.06],
            "MA": [-2.53, -44.30],
            "MT": [-15.60, -56.09],
            "MS": [-20.44, -54.61],
            "PA": [-1.45, -48.50],
            "PB": [-7.11, -34.86],
            "PI": [-5.08, -42.80],
            "RN": [-5.79, -35.20],
            "RO": [-8.76, -63.90],
            "RR": [2.82, -60.67],
            "SE": [-10.91, -37.07],
            "TO": [-10.16, -48.33],
            "AC": [-9.97, -67.81]
        }
        return centers[uf] || [-15.79, -47.88]
    }, [uf])

    const mapZoom = uf === "BR" ? 4 : 6

    return (
        <Card className="flex-1 min-h-[500px] flex flex-col bg-slate-50 relative overflow-hidden border shadow-sm h-full">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <span className="text-xs font-medium">Carregando mapa do IBGE...</span>
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-sm text-sm font-medium text-slate-700 border">
                Visualizando: {uf === "BR" ? "Brasil" : uf}
            </div>

            <div className="flex-1 w-full h-full">
                <DynamicMap
                    key={uf} // Re-mount when state changes to fly correctly
                    center={mapCenter}
                    zoom={mapZoom}
                    onRegionClick={handleRegionClick}
                    geoJsonData={geoData}
                />
            </div>

            <div className="absolute bottom-4 right-4 z-[400] flex flex-col items-end gap-1 pointer-events-none">
                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded border text-[10px] text-slate-500 shadow-sm pointer-events-auto">
                    Camada: Densidade Comercial
                </div>
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded border shadow-sm pointer-events-auto">
                    <div className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></div> <span className="text-[10px] text-slate-600">Alta</span>
                    <div className="w-3 h-3 bg-[#2563eb] rounded-sm ml-1"></div>
                    <div className="w-3 h-3 bg-[#60a5fa] rounded-sm ml-1"></div>
                    <div className="w-3 h-3 bg-[#bfdbfe] rounded-sm ml-1"></div> <span className="text-[10px] text-slate-600">Baixa</span>
                </div>
            </div>
        </Card>
    )
}
