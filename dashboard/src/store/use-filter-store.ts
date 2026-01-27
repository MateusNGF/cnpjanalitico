import { create } from 'zustand'

export interface FilterState {
    uf: string
    city: string | null
    cnae: string | null
    situacao: string | null
    dateRange: { from: Date | undefined; to: Date | undefined }
    naturezaJuridica: string | null
    capitalSocial: [number, number] | null

    // Actions
    setUf: (uf: string) => void
    setCity: (city: string | null) => void
    setCnae: (cnae: string | null) => void
    setSituacao: (situacao: string | null) => void
    setNaturezaJuridica: (natureza: string | null) => void
    setCapitalSocial: (range: [number, number] | null) => void
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export const useFilterStore = create<FilterState>((set) => ({
    uf: 'MG',
    city: null,
    cnae: null,
    situacao: null,
    naturezaJuridica: null,
    capitalSocial: null,
    dateRange: { from: undefined, to: undefined },

    setUf: (uf) => set({ uf }),
    setCity: (city) => set({ city }),
    setCnae: (cnae) => set({ cnae }),
    setSituacao: (situacao) => set({ situacao }),
    setNaturezaJuridica: (naturezaJuridica) => set({ naturezaJuridica }),
    setCapitalSocial: (capitalSocial) => set({ capitalSocial }),
    setDateRange: (dateRange) => set({ dateRange }),
}))
