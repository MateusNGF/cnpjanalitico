"use client"

import { useEffect, useRef } from 'react'
import { useFilterStore } from '@/store/use-filter-store'

export function StoreInitializer() {
    const setUf = useFilterStore(s => s.setUf)
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=5&addressdetails=1`);
                        const data = await res.json();

                        const stateMap: Record<string, string> = {
                            'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
                            'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
                            'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
                            'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
                            'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
                            'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
                            'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
                            'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
                            'Tocantins': 'TO'
                        };

                        const stateName = data.address?.state;
                        const ufCode = stateMap[stateName];

                        if (ufCode) {
                            setUf(ufCode);
                        } else {
                            setUf('MG');
                        }
                    } catch (e) {
                        setUf('MG');
                    }
                },
                () => setUf('MG') // Fallback if denied
            );
        } else {
            setUf('MG');
        }
    }, [setUf])

    return null
}
