"use client"

import React, { createContext, useContext, useState } from "react"

interface DashboardContextType {
    uf: string
    setUf: (uf: string) => void
    city: string | null
    setCity: (city: string | null) => void
    naturezaJuridica: string | null
    setNaturezaJuridica: (natureza: string | null) => void
    capitalSocial: [number, number] | null
    setCapitalSocial: (range: [number, number] | null) => void
    dateRange: { from: Date | undefined; to: Date | undefined }
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [uf, setUf] = useState("MG")
    const [city, setCity] = useState<string | null>(null)
    const [naturezaJuridica, setNaturezaJuridica] = useState<string | null>(null)
    const [capitalSocial, setCapitalSocial] = useState<[number, number] | null>(null)
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })

    return (
        <DashboardContext.Provider
            value={{
                uf,
                setUf,
                city,
                setCity,
                naturezaJuridica,
                setNaturezaJuridica,
                capitalSocial,
                setCapitalSocial,
                dateRange,
                setDateRange,
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
