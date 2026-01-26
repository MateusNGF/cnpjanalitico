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
const Map = dynamic(() => import("@/components/ui/map-client"), {
    loading: () => <Skeleton className="w-full h-full bg-slate-100" />,
    ssr: false,
})

export function MapContainer() {
    const { uf, setCity } = useDashboard()
    const [mapStats, setMapStats] = useState<MapStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMapData() {
            setLoading(true)
            try {
                const response = await fetch(`/api/map?uf=${uf}`)
                if (!response.ok) throw new Error("Map fetch failed")
                const data = await response.json()
                if (Array.isArray(data)) {
                    setMapStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch map data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchMapData()
    }, [uf])

    const handleRegionClick = (regionName: string) => {
        setCity(regionName)
    }

    // Determine center based on UF (approximate centers)
    const center = useMemo<[number, number]>(() => {
        switch (uf) {
            case "SP": return [-23.55, -46.63];
            case "MG": return [-19.92, -43.94]; // BH Center
            case "RJ": return [-22.90, -43.17];
            case "RS": return [-30.03, -51.22];
            default: return [-15.79, -47.88]; // Brasilia
        }
    }, [uf])

    // Determine zoom based on UF
    const zoom = useMemo(() => {
        return uf === "BR" ? 4 : 12; // Zoom closer for city view if State logic was finer
    }, [uf])

    // Pass data only if in relevant context (e.g. MG for this mock)
    // In production, fetch based on UF
    const mapData = (uf === "MG" || uf === "BR") ? MOCK_GEOJSON : null;

    return (
        <Card className="flex-1 min-h-[500px] flex flex-col bg-slate-50 relative overflow-hidden border shadow-sm h-full">
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-sm text-sm font-medium text-slate-700 border">
                Visualizando: {uf === "BR" ? "Brasil" : "Belo Horizonte (Mock Demo)"}
            </div>

            <div className="flex-1 w-full h-full">
                <Map
                    // Force re-render on center change to fly to new location
                    key={`${uf}-${center[0]}-${center[1]}`}
                    center={center}
                    zoom={zoom}
                    onRegionClick={handleRegionClick}
                    geoJsonData={mapData}
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
