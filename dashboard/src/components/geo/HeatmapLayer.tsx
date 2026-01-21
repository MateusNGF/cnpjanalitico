'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: { lat: number, lng: number, weight: number }[];
}

const HeatmapLayer = ({ points }: HeatmapLayerProps) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !points || points.length === 0) return;

        // Ensure leaflet.heat is loaded (it patches L)
        // Note: import 'leaflet.heat' is already at the top

        try {
            // Convert points to Heatmap format: [lat, lng, intensity]
            const heatData = points.map(p => [p.lat, p.lng, Number(p.weight)] as [number, number, number]);

            // @ts-ignore
            if (!L.heatLayer) {
                console.warn('L.heatLayer not found. Ensure leaflet.heat is correctly loaded.');
                return;
            }

            // @ts-ignore
            const heatLayer = L.heatLayer(heatData, {
                radius: 20,
                blur: 15,
                maxZoom: 13,
                max: Math.max(...points.map(p => Number(p.weight))),
                gradient: {
                    0.2: 'blue',
                    0.4: 'cyan',
                    0.6: 'lime',
                    0.8: 'yellow',
                    1.0: 'red'
                }
            });

            heatLayer.addTo(map);

            return () => {
                if (map) map.removeLayer(heatLayer);
            };
        } catch (error) {
            console.error('Error creating heatmap layer:', error);
        }
    }, [map, points]);

    return null;
};


export default HeatmapLayer;
