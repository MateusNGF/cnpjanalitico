"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Gavel } from "lucide-react"
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

const naturezas = [
    { value: "2062", label: "Sociedade Empresária Limitada" },
    { value: "2135", label: "Empresário Individual" },
    { value: "2305", label: "Empresa Individual de Resp. Limitada" },
    { value: "2046", label: "Sociedade Anônima Aberta" },
    { value: "3999", label: "Associação Privada" },
]

export function NaturezaSelector() {
    const [open, setOpen] = React.useState(false)
    const { naturezaJuridica, setNaturezaJuridica } = useDashboard()

    const selected = naturezas.find((n) => n.value === naturezaJuridica)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[220px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden text-xs">
                        <Gavel className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {selected ? (
                            <span className="truncate">{selected.label}</span>
                        ) : (
                            <span className="text-muted-foreground">Natureza Jurídica</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar natureza..." />
                    <CommandList>
                        <CommandEmpty>Nenhuma natureza encontrada.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all"
                                onSelect={() => {
                                    setNaturezaJuridica(null)
                                    setOpen(false)
                                }}
                            >
                                Todas as Naturezas
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        naturezaJuridica === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {naturezas.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setNaturezaJuridica(currentValue === naturezaJuridica ? null : item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-xs">{item.label}</span>
                                        <span className="text-[10px] text-muted-foreground">{item.value}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            naturezaJuridica === item.value ? "opacity-100" : "opacity-0"
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
