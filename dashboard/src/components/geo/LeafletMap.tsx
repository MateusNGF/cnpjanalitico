'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from 'next-themes';

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
    center?: [number, number];
    zoom?: number;
    children?: React.ReactNode;
}

const LeafletMap = ({ center = [-15.78, -47.93], zoom = 4, children }: LeafletMapProps) => {
    const { theme, resolvedTheme } = useTheme();
    const currentTheme = theme === 'system' ? resolvedTheme : theme;

    // Using CartoDB tiles which have clear light/dark variants
    const tileUrl = currentTheme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem', background: 'transparent' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={tileUrl}
            />
            {children}
            <MapAutoResizer />
        </MapContainer>
    );
};

// Component to handle map resizing when container size changes
const MapAutoResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);
    return null;
};

export default LeafletMap;
