"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
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
import { useFilterStore } from "@/store/use-filter-store"

const mockCnaes = [
    { value: "6201-5/00", label: "Desenvolvimento de Software" },
    { value: "6202-3/00", label: "Consultoria em TI" },
    { value: "4711-3/01", label: "Comércio Varejista (Hipermercados)" },
    { value: "5611-2/01", label: "Restaurantes e Similares" },
    { value: "4120-4/00", label: "Construção de Edifícios" },
]

export function CnaeSelector() {
    const [open, setOpen] = React.useState(false)
    const { cnae, setCnae } = useFilterStore()

    const selected = mockCnaes.find((item) => item.value === cnae)

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
                        {selected ? (
                            <span className="truncate">{selected.label}</span>
                        ) : (
                            <span className="text-muted-foreground">Atividade (CNAE)</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar atividade ou código..." />
                    <CommandList>
                        <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
                        <CommandGroup heading="Atividades Sugeridas">
                            <CommandItem
                                value="all"
                                onSelect={() => {
                                    setCnae(null)
                                    setOpen(false)
                                }}
                            >
                                Todas as Atividades
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        cnae === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {mockCnaes.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setCnae(currentValue === cnae ? null : item.value)
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
                                            cnae === item.value ? "opacity-100" : "opacity-0"
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
