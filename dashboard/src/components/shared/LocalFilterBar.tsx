"use client"

import { Filter, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface LocalFilterBarProps {
    children: React.ReactNode
    className?: string
    title?: string
}

export function LocalFilterBar({ children, className, title = "Filtros Adicionais" }: LocalFilterBarProps) {
    return (
        <div className={cn(
            "flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-primary/10 bg-background/50 backdrop-blur-md shadow-sm",
            className
        )}>
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter className="h-4 w-4 text-primary/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{title}:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                {children}
            </div>

            <div className="flex-1" />

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 cursor-help gap-1 px-2">
                            <Info className="h-3 w-3" />
                            Global On
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px] text-[11px]">
                        <p>Este painel está sincronizado com os filtros de <strong>UF, CNAE e Situação</strong> do menu superior.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
