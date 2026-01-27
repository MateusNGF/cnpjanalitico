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
    const { city, setCity } = useFilterStore()
    const [open, setOpen] = useState(false)

    // Open drawer when city is selected
    useEffect(() => {
        if (city) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [city])

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setCity(null) // Clear city selection on close
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-[800px] sm:max-w-[100%] md:max-w-[800px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Leads Qualificados: {city}</SheetTitle>
                    <SheetDescription>
                        Empresas ativas e oportunidades de negócio nesta região.
                    </SheetDescription>
                </SheetHeader>
                <CompaniesTable />
            </SheetContent>
        </Sheet>
    )
}
