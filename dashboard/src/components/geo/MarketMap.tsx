'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Map as MapIcon, Layers, Flame } from "lucide-react";

// Dynamic imports for Leaflet components to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin opacity-20" /></div>
});
const ChoroplethLayer = dynamic(() => import('./ChoroplethLayer'), { ssr: false });
const HeatmapLayer = dynamic(() => import('./HeatmapLayer'), { ssr: false });

interface MarketMapProps {
    uf?: string;
    cnae?: string;
}

const MarketMap = ({ uf = 'SP', cnae }: MarketMapProps) => {
    const [view, setView] = useState<'choropleth' | 'heatmap'>('choropleth');
    const [densityData, setDensityData] = useState<any[]>([]);
    const [pointsData, setPointsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (uf) queryParams.append('uf', uf);
                if (cnae) queryParams.append('cnae', cnae);

                if (view === 'choropleth') {
                    const res = await fetch(`/api/geo/density?${queryParams.toString()}`);
                    const data = await res.json();
                    setDensityData(data);
                } else {
                    const res = await fetch(`/api/geo/points?${queryParams.toString()}`);
                    const data = await res.json();
                    setPointsData(data);
                }
            } catch (error) {
                console.error('Error fetching map data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uf, cnae, view]);

    return (
        <Card className="col-span-2 border-primary/5 bg-muted/5 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5 text-primary" />
                        Visão Geográfica
                    </CardTitle>
                    <CardDescription>Análise espacial de concentração empresarial em {uf}.</CardDescription>
                </div>
                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="choropleth" className="flex items-center gap-1 text-[10px]">
                            <Layers className="h-3 w-3" />
                            Cidades
                        </TabsTrigger>
                        <TabsTrigger value="heatmap" className="flex items-center gap-1 text-[10px]">
                            <Flame className="h-3 w-3" />
                            Calor
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[500px] p-0 relative">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-background/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    </div>
                )}
                <LeafletMap center={uf === 'SP' ? [-23.55, -46.63] : [-15.78, -47.93]} zoom={uf === 'SP' ? 7 : 5}>
                    {view === 'choropleth' ? (
                        <ChoroplethLayer uf={uf} densityData={densityData} />
                    ) : (
                        <HeatmapLayer points={pointsData} />
                    )}
                </LeafletMap>
            </CardContent>
        </Card>
    );
};

export default MarketMap;
