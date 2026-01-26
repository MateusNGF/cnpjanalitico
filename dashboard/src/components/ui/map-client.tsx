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

    const getColor = (d: number) => {
        return d > 1000 ? '#1e3a8a' : // blue-900 (High)
            d > 500 ? '#2563eb' : // blue-600 (Medium)
                d > 200 ? '#60a5fa' : // blue-400 (Low)
                    '#bfdbfe';  // blue-200 (Very Low)
    }

    const style = (feature: any) => {
        return {
            fillColor: getColor(feature.properties.density),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    const onEachFeature = (feature: any, layer: any) => {
        layer.on({
            mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.9
                });
            },
            mouseout: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                });
            },
            click: (e: any) => {
                if (onRegionClick) {
                    onRegionClick(feature.properties.name)
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
