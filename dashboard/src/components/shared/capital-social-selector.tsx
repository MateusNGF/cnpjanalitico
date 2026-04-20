"use client"

import * as React from "react"
import { Check, ChevronsUpDown, DollarSign } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"
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
import { useFilterStore } from "@/store/use-filter-store"

const ranges: { label: string; value: [number, number] | null }[] = [
    { label: "Até R$ 10k", value: [0, 10000] },
    { label: "R$ 10k - R$ 100k", value: [10000, 100000] },
    { label: "R$ 100k - R$ 1M", value: [100000, 1000000] },
    { label: "R$ 1M - R$ 10M", value: [1000000, 10000000] },
    { label: "Acima de R$ 10M", value: [10000000, 999999999999] },
]

export function CapitalSocialSelector() {
    const [open, setOpen] = React.useState(false)
    const { capitalSocial, setCapitalSocial } = useFilterStore()

    const selected = ranges.find(
        (r) => r.value && capitalSocial && r.value[0] === capitalSocial[0] && r.value[1] === capitalSocial[1]
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {selected ? (
                            <span className="truncate">{selected.label}</span>
                        ) : (
                            <span className="text-muted-foreground">Capital Social</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                    <CommandList>
                        <CommandEmpty>Nenhuma faixa encontrada.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setCapitalSocial(null)
                                    setOpen(false)
                                }}
                            >
                                Qualquer Valor
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        capitalSocial === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {ranges.map((range, index) => (
                                <CommandItem
                                    key={index}
                                    onSelect={() => {
                                        setCapitalSocial(range.value)
                                        setOpen(false)
                                    }}
                                >
                                    {range.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            capitalSocial && range.value &&
                                                capitalSocial[0] === range.value[0] &&
                                                capitalSocial[1] === range.value[1]
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
