import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface FilterValues {
    uf: string
    city: string | null
    cnae: string | null
    situacao: string | null
    dateRange: { from: string | undefined; to: string | undefined } // Use string for persistence
    naturezaJuridica: string | null
    capitalSocial: [number, number] | null
    idadeRange: [number, number] | null
}

export interface SavedFilter {
    id: string
    name: string
    values: FilterValues
}

export interface FilterState extends FilterValues {
    selectedCnpj: string | null
    savedFilters: SavedFilter[]

    // Actions
    setUf: (uf: string) => void
    setCity: (city: string | null) => void
    setCnae: (cnae: string | null) => void
    setSituacao: (situacao: string | null) => void
    setNaturezaJuridica: (natureza: string | null) => void
    setCapitalSocial: (range: [number, number] | null) => void
    setIdadeRange: (range: [number, number] | null) => void
    setSelectedCnpj: (cnpj: string | null) => void
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
    
    // Saved Filter Actions
    saveCurrentFilter: (name: string) => void
    loadFilter: (id: string) => void
    deleteFilter: (id: string) => void
}

export const useFilterStore = create<FilterState>()(
    persist(
        (set, get) => ({
            uf: 'MG',
            city: null,
            cnae: null,
            situacao: null,
            naturezaJuridica: null,
            capitalSocial: null,
            idadeRange: null,
            selectedCnpj: null,
            dateRange: { from: undefined, to: undefined },
            savedFilters: [],

            setUf: (uf) => set({ uf }),
            setCity: (city) => set({ city }),
            setCnae: (cnae) => set({ cnae }),
            setSituacao: (situacao) => set({ situacao }),
            setNaturezaJuridica: (naturezaJuridica) => set({ naturezaJuridica }),
            setCapitalSocial: (capitalSocial) => set({ capitalSocial }),
            setIdadeRange: (idadeRange) => set({ idadeRange }),
            setSelectedCnpj: (selectedCnpj) => set({ selectedCnpj }),
            setDateRange: (range) => set({ 
                dateRange: { 
                    from: range.from?.toISOString(), 
                    to: range.to?.toISOString() 
                } 
            } as any),

            saveCurrentFilter: (name) => {
                const state = get()
                const newFilter: SavedFilter = {
                    id: crypto.randomUUID(),
                    name,
                    values: {
                        uf: state.uf,
                        city: state.city,
                        cnae: state.cnae,
                        situacao: state.situacao,
                        dateRange: state.dateRange,
                        naturezaJuridica: state.naturezaJuridica,
                        capitalSocial: state.capitalSocial,
                        idadeRange: state.idadeRange,
                    }
                }
                set({ savedFilters: [...state.savedFilters, newFilter] })
            },

            loadFilter: (id) => {
                const filter = get().savedFilters.find(f => f.id === id)
                if (filter) {
                    set({ ...filter.values })
                }
            },

            deleteFilter: (id) => {
                set({ 
                    savedFilters: get().savedFilters.filter(f => f.id !== id) 
                })
            }
        }),
        {
            name: 'cnpj-analitico-filters',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
