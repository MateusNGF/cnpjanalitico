"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Activity } from "lucide-react"
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

const situacoes = [
    { value: "02", label: "Ativa", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { value: "03", label: "Suspensa", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { value: "04", label: "Inapta", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { value: "08", label: "Baixada", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    { value: "01", label: "Nula", color: "text-slate-500 bg-slate-500/5 border-slate-500/10" },
]

export function SituacaoSelector() {
    const [open, setOpen] = React.useState(false)
    const { situacao, setSituacao } = useDashboard()

    const selected = situacoes.find((s) => s.value === situacao)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[150px] justify-between bg-background/50 backdrop-blur-sm border-white/10"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {selected ? (
                            <Badge variant="outline" className={cn("px-1 h-5 text-[10px]", selected.color)}>
                                {selected.label}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground">Situação</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Filtrar situação..." />
                    <CommandList>
                        <CommandEmpty>Nenhuma situação encontrada.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all"
                                onSelect={() => {
                                    setSituacao(null)
                                    setOpen(false)
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Todas as Situações</span>
                                </div>
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        situacao === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                            {situacoes.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setSituacao(currentValue === situacao ? null : item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn("px-1 h-5 text-[10px]", item.color)}>
                                            {item.label}
                                        </Badge>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            situacao === item.value ? "opacity-100" : "opacity-0"
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
