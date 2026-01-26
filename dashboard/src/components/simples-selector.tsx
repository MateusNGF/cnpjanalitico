"use client"

import * as React from "react"
import { Check, ChevronsUpDown, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDashboard } from "@/components/dashboard-context"
import { Badge } from "@/components/ui/badge"

const options = [
    { value: "SIMPLES", label: "Simples Nacional" },
    { value: "MEI", label: "Microempreendedor (MEI)" },
    { value: "NORMAL", label: "Regime Normal" },
]

export function SimplesSelector() {
    const [open, setOpen] = React.useState(false)
    // We might need to add this to context, but for now let's use a local state or just placeholder
    // Actually, I should add 'regime' to context or just leave it for now.
    // I'll add 'regime' to context for completeness.
    const { setUf } = useDashboard() // Placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-[180px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden text-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Regime Tributário</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandList>
                        <CommandEmpty>Nenhum regime encontrado.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => setOpen(false)}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
