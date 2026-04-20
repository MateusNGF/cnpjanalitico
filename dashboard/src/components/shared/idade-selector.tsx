"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useFilterStore } from "@/store/use-filter-store"

const ageRanges: { label: string; value: [number, number] | null }[] = [
    { label: "Menos de 6 meses", value: [0, 0] },
    { label: "Até 1 ano", value: [0, 1] },
    { label: "1 a 3 anos", value: [1, 3] },
    { label: "3 a 5 anos", value: [3, 5] },
    { label: "Mais de 5 anos", value: [5, 150] },
]

export function IdadeSelector() {
    const [open, setOpen] = React.useState(false)
    const { idadeRange, setIdadeRange } = useFilterStore()

    const selected = ageRanges.find(
        (r) => r.value && idadeRange && r.value[0] === idadeRange[0] && r.value[1] === idadeRange[1]
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[180px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {selected ? (
                            <span className="truncate">{selected.label}</span>
                        ) : (
                            <span className="text-muted-foreground">Idade da Empresa</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandList>
                        <CommandEmpty>Nenhuma faixa encontrada.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setIdadeRange(null)
                                    setOpen(false)
                                }}
                            >
                                Qualquer Idade
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        idadeRange === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {ageRanges.map((range, index) => (
                                <CommandItem
                                    key={index}
                                    onSelect={() => {
                                        setIdadeRange(range.value)
                                        setOpen(false)
                                    }}
                                >
                                    {range.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            idadeRange && range.value &&
                                                idadeRange[0] === range.value[0] &&
                                                idadeRange[1] === range.value[1]
                                                ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
