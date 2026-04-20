import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { useFilterStore } from '@/store/use-filter-store';
import { useDataStore } from '@/store/use-data-store';
import { State, MunicipalData } from '../types';

export function useMapData() {
    const { uf, setUf } = useFilterStore();
    const { data: stateStats, loading: statsLoading } = useDataStore(s => s.stats);
    const { data: mapData, loading: mapLoading } = useDataStore(s => s.map);
    const fetchStats = useDataStore(s => s.fetchStats);
    const fetchMap = useDataStore(s => s.fetchMap);

    const [estados, setEstados] = useState<State[]>([]);
    const [geoData, setGeoData] = useState<any>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
    const [municipalStats, setMunicipalStats] = useState<Map<string, MunicipalData>>(new Map());

    const loading = statsLoading || mapLoading || geoLoading;

    // Load States with Next.js caching
    useEffect(() => {
        fetch('/api/estados', { cache: 'force-cache' })
            .then(res => res.json())
            .then(data => {
                const filteredStates = data.filter((s: State) => s.sigla !== 'BR');
                setEstados(filteredStates);
            })
            .catch(err => console.error("Erro ao carregar estados:", err));
    }, []);

    // Load GeoJSON and trigger Business Data Fetch
    useEffect(() => {
        setGeoLoading(true);
        setGeoData(null);

        const geoUrl = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio`;

        fetchStats({ uf });
        fetchMap({ uf });

        // IBGE requests can be cached
        fetch(geoUrl, { cache: 'force-cache' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(geo => {
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

    // Process Business Data
    useEffect(() => {
        const statsMap = new Map();
        if (Array.isArray(mapData)) {
            mapData.forEach((item: any) => {
                const cleanId = String(item.id).trim();
                statsMap.set(cleanId, {
                    id: cleanId,
                    nome: item.nome || "Município",
                    value: Number(item.value) || 0
                });
            });
        }
        setMunicipalStats(statsMap);
    }, [mapData]);

    const maxDensity = useMemo(() => {
        const values = Array.from(municipalStats.values()).map(v => v.value);
        return values.length > 0 ? Math.max(...values) : 100;
    }, [municipalStats]);

    const currentUF = useMemo(() =>
        estados.find(e => e.sigla === uf) || { sigla: uf, nome: uf, flag_url: '' }
        , [estados, uf]);

    return {
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
    };
}
