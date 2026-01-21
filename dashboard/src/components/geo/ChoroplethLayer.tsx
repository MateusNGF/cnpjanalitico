'use client';

import React, { useEffect, useState } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';

interface ChoroplethLayerProps {
    uf?: string;
    densityData: any[]; // Array of { id: string, total: number }
}

const ChoroplethLayer = ({ uf = 'SP', densityData }: ChoroplethLayerProps) => {
    const [geoJson, setGeoJson] = useState<any>(null);
    const { theme, resolvedTheme } = useTheme();
    const currentTheme = theme === 'system' ? resolvedTheme : theme;

    useEffect(() => {
        const fetchGeoJson = async () => {
            try {
                // Fetching simplified IBGE malhas for performance
                const url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio`;
                const response = await fetch(url);
                const data = await response.json();
                setGeoJson(data);
            } catch (error) {
                console.error('Error fetching IBGE GeoJSON:', error);
            }
        };

        if (uf) {
            fetchGeoJson();
        }
    }, [uf]);

    const getDensityColor = (count: number) => {
        if (currentTheme === 'dark') {
            return count > 10000 ? '#7c3aed' :
                count > 5000 ? '#8b5cf6' :
                    count > 2000 ? '#a78bfa' :
                        count > 1000 ? '#c4b5fd' :
                            count > 500 ? '#ddd6fe' :
                                count > 100 ? '#ede9fe' :
                                    '#f5f3ff';
        }
        return count > 10000 ? '#7f1d1d' :
            count > 5000 ? '#b91c1c' :
                count > 2000 ? '#dc2626' :
                    count > 1000 ? '#ef4444' :
                        count > 500 ? '#f87171' :
                            count > 100 ? '#fca5a5' :
                                '#fee2e2';
    };

    const style = (feature: any) => {
        const municipioId = String(feature.properties?.codarea || feature.properties?.code || feature.id);
        const data = densityData.find(d => String(d.id) === municipioId);
        const count = data ? Number(data.total) : 0;

        return {
            fillColor: getDensityColor(count),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        const municipioId = String(feature.properties?.codarea || feature.properties?.code || feature.id);
        const data = densityData.find(d => String(d.id) === municipioId);
        const count = data ? Number(data.total) : 0;
        const name = data?.municipio || feature.properties?.nome || feature.properties?.name || 'Município';

        layer.bindTooltip(
            `<div class="p-1 font-sans">
                <div class="font-bold text-primary">${name}</div>
                <div class="text-xs text-muted-foreground">${count.toLocaleString('pt-BR')} empresas</div>
            </div>`,
            { sticky: true, className: 'leaflet-tooltip-custom' }
        );
    };



    if (!geoJson) return null;

    return (
        <GeoJSON
            key={uf} // Re-render when UF changes
            data={geoJson}
            style={style}
            onEachFeature={onEachFeature}
        />
    );
};

export default ChoroplethLayer;
