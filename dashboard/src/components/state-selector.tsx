"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Zap } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useFilterStore } from "@/store/use-filter-store"

const states = [
    { value: "BR", label: "Brasil (Geral)", flag: "🇧🇷" },
    { value: "AC", label: "Acre", flag: "󰂈" },
    { value: "AL", label: "Alagoas", flag: "󰂈" },
    { value: "AP", label: "Amapá", flag: "󰂈" },
    { value: "AM", label: "Amazonas", flag: "󰂈" },
    { value: "BA", label: "Bahia", flag: "󰂈" },
    { value: "CE", label: "Ceará", flag: "󰂈" },
    { value: "DF", label: "Distrito Federal", flag: "󰂈" },
    { value: "ES", label: "Espírito Santo", flag: "󰂈" },
    { value: "GO", label: "Goiás", flag: "󰂈" },
    { value: "MA", label: "Maranhão", flag: "󰂈" },
    { value: "MT", label: "Mato Grosso", flag: "󰂈" },
    { value: "MS", label: "Mato Grosso do Sul", flag: "󰂈" },
    { value: "MG", label: "Minas Gerais", flag: "󰂈" },
    { value: "PA", label: "Pará", flag: "󰂈" },
    { value: "PB", label: "Paraíba", flag: "󰂈" },
    { value: "PR", label: "Paraná", flag: "󰂈" },
    { value: "PE", label: "Pernambuco", flag: "󰂈" },
    { value: "PI", label: "Piauí", flag: "󰂈" },
    { value: "RJ", label: "Rio de Janeiro", flag: "󰂈" },
    { value: "RN", label: "Rio Grande do Norte", flag: "󰂈" },
    { value: "RS", label: "Rio Grande do Sul", flag: "󰂈" },
    { value: "RO", label: "Rondônia", flag: "󰂈" },
    { value: "RR", label: "Roraima", flag: "󰂈" },
    { value: "SC", label: "Santa Catarina", flag: "󰂈" },
    { value: "SP", label: "São Paulo", flag: "󰂈" },
    { value: "SE", label: "Sergipe", flag: "󰂈" },
    { value: "TO", label: "Tocantins", flag: "󰂈" },
]

export function StateSelector() {
    const [open, setOpen] = React.useState(false)
    const { uf, setUf } = useFilterStore()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="flex-shrink-0 text-lg">
                            {states.find((s) => s.value === uf)?.flag || "🇧🇷"}
                        </span>
                        <span className="truncate">
                            {states.find((s) => s.value === uf)?.label || "Brasil (Geral)"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="h-5 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            FAST
                        </Badge>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar estado..." />
                    <CommandList>
                        <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                        <CommandGroup>
                            {states.map((state) => (
                                <CommandItem
                                    key={state.value}
                                    value={state.value}
                                    onSelect={(currentValue) => {
                                        setUf(currentValue === uf ? "BR" : state.value)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{state.flag}</span>
                                        <span>{state.label}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            uf === state.value ? "opacity-100" : "opacity-0"
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
