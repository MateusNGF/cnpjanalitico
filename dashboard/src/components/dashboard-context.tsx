"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface DashboardState {
    uf: string
    city: string | null
    cnae: string | null
    situacao: string | null
    dateRange: { from: Date | undefined; to: Date | undefined }
    naturezaJuridica: string | null
    capitalSocial: [number, number] | null
    setUf: (uf: string) => void
    setCity: (city: string | null) => void
    setCnae: (cnae: string | null) => void
    setSituacao: (situacao: string | null) => void
    setNaturezaJuridica: (natureza: string | null) => void
    setCapitalSocial: (range: [number, number] | null) => void
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [uf, setUf] = useState("BR")
    const [city, setCity] = useState<string | null>(null)
    const [cnae, setCnae] = useState<string | null>(null)
    const [situacao, setSituacao] = useState<string | null>(null)
    const [naturezaJuridica, setNaturezaJuridica] = useState<string | null>(null)
    const [capitalSocial, setCapitalSocial] = useState<[number, number] | null>(null)
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Use Nominatim for reverse geocoding (OpenStreetMap)
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3`
                        );
                        const data = await response.json();

                        // Mapping full names to UF codes
                        const stateMap: Record<string, string> = {
                            "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
                            "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF",
                            "Espírito Santo": "ES", "Goiás": "GO", "Maranhão": "MA",
                            "Mato Grosso": "MT", "Mato Grosso do Sul": "MS",
                            "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB",
                            "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI",
                            "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
                            "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR",
                            "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE",
                            "Tocantins": "TO"
                        };

                        const stateName = data.address?.state;
                        if (stateName && stateMap[stateName]) {
                            setUf(stateMap[stateName]);
                        }
                    } catch (error) {
                        console.error("Reverse Geocoding Error:", error);
                    }
                },
                (error) => {
                    console.log("Geolocation denied or unavailable:", error.message);
                }
            );
        }
    }, []);

    return (
        <DashboardContext.Provider
            value={{
                uf, city, cnae, situacao, dateRange, naturezaJuridica, capitalSocial,
                setUf, setCity, setCnae, setSituacao, setDateRange, setNaturezaJuridica, setCapitalSocial
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}
