"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapClientProps {
    center?: [number, number]
    zoom?: number
    onRegionClick?: (regionName: string) => void
    geoJsonData?: any
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

export default function MapClient({ center = [-15.79, -47.88], zoom = 4, onRegionClick, geoJsonData }: MapClientProps) {

    const getColor = (d: number, max: number) => {
        const ratio = max > 0 ? d / max : 0;
        return ratio > 0.8 ? '#1e3a8a' :
            ratio > 0.5 ? '#2563eb' :
                ratio > 0.2 ? '#60a5fa' :
                    ratio > 0.05 ? '#93c5fd' :
                        '#eff6ff';
    }

    const style = (feature: any) => {
        // Find max density in the whole collection for relative scaling
        const features = geoJsonData?.features || [];
        const maxDensity = Math.max(...features.map((f: any) => f.properties.density || 0), 10);

        return {
            fillColor: getColor(feature.properties.density, maxDensity),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
        };
    }

    const onEachFeature = (feature: any, layer: any) => {
        const density = feature.properties.density || 0;
        const name = feature.properties.nomemunicipio || feature.properties.name || "Município";

        layer.bindTooltip(`
            <div class="px-2 py-1">
                <div class="font-bold text-slate-800">${name}</div>
                <div class="text-xs text-slate-600">${density.toLocaleString()} empresas ativas</div>
            </div>
        `, { sticky: true, className: 'custom-tooltip' });

        layer.on({
            mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 1
                });
            },
            mouseout: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.8
                });
            },
            click: (e: any) => {
                if (onRegionClick) {
                    onRegionClick(name)
                }
            }
        });
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%", background: "#f8fafc" }}
            zoomControl={false}
        >
            <MapController center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {geoJsonData && (
                <GeoJSON
                    data={geoJsonData}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    )
}
