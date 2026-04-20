import { create } from 'zustand'

interface FilterParams {
    uf?: string
    city?: string | null
    cnae?: string | null
    situacao?: string | null
    naturezaJuridica?: string | null
    capitalSocial?: [number, number] | null
    idadeRange?: [number, number] | null
    dateRange?: { from: Date | undefined; to: Date | undefined }
}

function buildQueryParams(filters: FilterParams) {
    const params = new URLSearchParams()
    if (filters.uf) params.append('uf', filters.uf)
    if (filters.city) {
        params.append('municipio_id', filters.city)
        params.append('municipio', filters.city)
    }
    if (filters.cnae) params.append('cnae', filters.cnae)
    if (filters.situacao) params.append('situacao', filters.situacao)
    if (filters.naturezaJuridica) {
        params.append('natureza', filters.naturezaJuridica)
        params.append('natureza_juridica', filters.naturezaJuridica)
    }
    if (filters.capitalSocial) {
        params.append('capital_min', String(filters.capitalSocial[0]))
        params.append('capital_max', String(filters.capitalSocial[1]))
        params.append('min_capital', String(filters.capitalSocial[0]))
        params.append('max_capital', String(filters.capitalSocial[1]))
    }
    if (filters.idadeRange) {
        params.append('idade_min', String(filters.idadeRange[0]))
        params.append('idade_max', String(filters.idadeRange[1]))
    }
    if (filters.dateRange?.from) params.append('start_date', filters.dateRange.from.toISOString())
    if (filters.dateRange?.to) params.append('end_date', filters.dateRange.to.toISOString())
    return params.toString()
}

import { StateStats } from '@/features/analytics/components/Map/types'

interface DataState {
    // Stats (KPIs)
    stats: {
        data: StateStats | null
        loading: boolean
        error: string | null
    }
    fetchStats: (filters: FilterParams) => Promise<void>

    // Map Data
    map: {
        data: any[] | null
        loading: boolean
        error: string | null
    }
    fetchMap: (filters: FilterParams) => Promise<void>

    // Trends Data
    trends: {
        data: any[] | null
        loading: boolean
        error: string | null
    }
    fetchTrends: (filters: FilterParams) => Promise<void>

    // Leads Data
    leads: {
        data: any[] | null
        loading: boolean
        error: string | null
    }
    fetchLeads: (filters: FilterParams) => Promise<void>
}

export const useDataStore = create<DataState>((set) => ({
    stats: { data: null, loading: false, error: null },
    map: { data: null, loading: false, error: null },
    trends: { data: null, loading: false, error: null },
    leads: { data: null, loading: false, error: null },

    fetchStats: async (filters) => {
        set((state) => ({ stats: { ...state.stats, loading: true, error: null } }))
        try {
            const query = buildQueryParams(filters)
            const response = await fetch(`/api/stats?${query}`)
            if (!response.ok) throw new Error('Failed to fetch stats')
            const data = await response.json()
            set({ stats: { data: data.error ? null : data, loading: false, error: data.error || null } })
        } catch (error: any) {
            set({ stats: { data: null, loading: false, error: error.message } })
        }
    },

    fetchMap: async (filters) => {
        set((state) => ({ map: { ...state.map, loading: true, error: null } }))
        try {
            const query = buildQueryParams(filters)
            const response = await fetch(`/api/map?${query}`)
            if (!response.ok) throw new Error('Failed to fetch map data')
            const data = await response.json()
            set({ map: { data: Array.isArray(data) ? data : null, loading: false, error: null } })
        } catch (error: any) {
            set({ map: { data: null, loading: false, error: error.message } })
        }
    },

    fetchTrends: async (filters) => {
        set((state) => ({ trends: { ...state.trends, loading: true, error: null } }))
        try {
            const query = buildQueryParams(filters)
            const response = await fetch(`/api/trends?${query}`)
            if (!response.ok) throw new Error('Failed to fetch trends data')
            const data = await response.json()
            set({ trends: { data: Array.isArray(data) ? data : null, loading: false, error: null } })
        } catch (error: any) {
            set({ trends: { data: null, loading: false, error: error.message } })
        }
    },

    fetchLeads: async (filters) => {
        set((state) => ({ leads: { ...state.leads, loading: true, error: null } }))
        try {
            const query = buildQueryParams(filters)
            const response = await fetch(`/api/leads?${query}`)
            if (!response.ok) throw new Error('Failed to fetch leads')
            const data = await response.json()
            set({ leads: { data: Array.isArray(data) ? data : null, loading: false, error: null } })
        } catch (error: any) {
            set({ leads: { data: null, loading: false, error: error.message } })
        }
    }
}))
