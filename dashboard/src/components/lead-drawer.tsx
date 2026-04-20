"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { CompaniesTable } from "@/components/companies-table"
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
    return (
        <div className="flex flex-col gap-6">
            <SheetHeader>
                <SheetTitle>Detalhes do Lead</SheetTitle>
                <SheetDescription>CNPJ: {cnpj}</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="text-sm font-semibold mb-2">Informações Cadastrais</h4>
                    <p className="text-xs text-muted-foreground">Em breve: integração total com os dados da view v_lead_completo.</p>
                </div>
            </div>
        </div>
    )
}
