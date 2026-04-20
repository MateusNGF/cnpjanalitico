"use client"

import { useState, useEffect } from "react"
import { Download, Loader2, CheckCircle2, XCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Job = {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    url?: string
}

export function DownloadCenter() {
    const [jobs, setJobs] = useState<Job[]>([])

    // Em um sistema real, usaríamos um WebSocket ou polling curto
    // Aqui vamos apenas exemplificar a UI

    const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Download className="h-4 w-4" />
                    {activeJobs.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-pulse">
                            {activeJobs.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Central de Exportações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {jobs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhuma exportação recente.
                    </div>
                ) : (
                    jobs.map(job => (
                        <DropdownMenuItem key={job.id} className="flex flex-col items-start gap-1 p-3">
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2 font-medium">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>Export #{job.id.slice(0, 8)}</span>
                                </div>
                                {job.status === 'completed' ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : job.status === 'failed' ? (
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                ) : (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                )}
                            </div>
                            
                            {job.status === 'completed' ? (
                                <Button size="sm" variant="link" className="h-auto p-0 text-xs" asChild>
                                    <a href={job.url} download>Descarregar arquivo</a>
                                </Button>
                            ) : (
                                <div className="text-[10px] text-muted-foreground">
                                    {job.status === 'processing' ? `Processando... ${job.progress}%` : 'Na fila...'}
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
