"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { CompaniesTable } from "@/features/leads/components/companies-table"
import { useFilterStore } from "@/store/use-filter-store"
import { useEffect, useState } from "react"

export function LeadDrawer() {
    const { city, setCity, selectedCnpj, setSelectedCnpj } = useFilterStore()
    const [open, setOpen] = useState(false)

    // Open drawer when city or lead is selected
    useEffect(() => {
        if (city || selectedCnpj) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [city, selectedCnpj])

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setCity(null)
            setSelectedCnpj(null)
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-[800px] sm:max-w-[100%] md:max-w-[800px] overflow-y-auto">
                {selectedCnpj ? (
                    <LeadDetailView cnpj={selectedCnpj} />
                ) : (
                    <>
                        <SheetHeader className="mb-6">
                            <SheetTitle>Leads Qualificados: {city}</SheetTitle>
                            <SheetDescription>
                                Empresas ativas e oportunidades de negócio nesta região.
                            </SheetDescription>
                        </SheetHeader>
                        <CompaniesTable />
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

function LeadDetailView({ cnpj }: { cnpj: string }) {
    const [partners, setPartners] = useState<{ nome: string, qualificacao: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPartners() {
            setLoading(true)
            try {
                // cnpj comes as full 14 digits, but partners table usually maps by cnpj_basico (8 digits)
                // Remove formatting if any
                const plainCnpj = cnpj.replace(/\D/g, '')
                const cnpj_basico = plainCnpj.substring(0, 8)
                const response = await fetch(`/api/leads/partners?cnpj_basico=${cnpj_basico}`)
                const data = await response.json()
                if (Array.isArray(data)) {
                    setPartners(data)
                }
            } catch (err) {
                console.error("Failed to fetch partners:", err)
            } finally {
                setLoading(false)
            }
        }
        if (cnpj) fetchPartners()
    }, [cnpj])

    return (
        <div className="flex flex-col gap-6">
            <SheetHeader>
                <SheetTitle>Detalhes do Lead</SheetTitle>
                <SheetDescription>CNPJ: {cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50 border shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        Quadro de Sócios
                         <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{partners.length}</span>
                    </h4>
                    {loading ? (
                        <div className="space-y-3">
                             <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                             <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                    ) : partners.length > 0 ? (
                        <ul className="space-y-2">
                            {partners.map((s, i) => (
                                <li key={i} className="text-xs flex flex-col gap-0.5 border-b border-muted pb-2 last:border-0 last:pb-0">
                                    <span className="font-bold uppercase text-slate-700">{s.nome}</span>
                                    <span className="text-muted-foreground text-[10px]">{s.qualificacao}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhum sócio informado ou carregado para este CNPJ.</p>
                    )}
                </div>
                
                <div className="p-4 rounded-lg bg-muted/20 border border-dashed text-center">
                    <p className="text-[10px] text-muted-foreground">Estatísticas de Score e Histórico de Alterações em breve.</p>
                </div>
            </div>
        </div>
    )
}
