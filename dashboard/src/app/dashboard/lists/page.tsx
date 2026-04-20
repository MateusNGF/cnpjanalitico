"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { PageContent } from "@/components/shared/PageContent"
import { ListChecks, Search, MoreHorizontal, Download, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockLists = [
    {
        id: "1",
        name: "Tech Leads SP - Abril",
        count: 142,
        updatedAt: "2024-04-18",
        status: "Ativa",
        description: "Empresas de software em São Paulo com capital > 100k"
    },
    {
        id: "2",
        name: "Varejo MG - Outliers",
        count: 85,
        updatedAt: "2024-04-15",
        status: "Concluída",
        description: "Comércio varejista em Minas Gerais com crescimento acelerado"
    },
    {
        id: "3",
        name: "Indústria Sul - Prospecção",
        count: 210,
        updatedAt: "2024-04-10",
        status: "Ativa",
        description: "Indústrias de transformação no PR, SC e RS"
    }
]

export default function ListsPage() {
    return (
        <PageContent>
            <PageHeader
                title="Minhas Listas"
                description="Gerencie e exporte suas seleções personalizadas de leads."
                icon={<ListChecks className="h-6 w-6 text-primary" />}
            />

            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar listas..." className="pl-9 bg-background/50" />
                </div>
                <Button>
                    Nova Lista
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockLists.map((list) => (
                    <Card key={list.id} className="group border-primary/5 hover:border-primary/20 transition-all duration-300 bg-muted/5 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-bold">{list.name}</CardTitle>
                                        <Badge variant={list.status === 'Ativa' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-4">
                                            {list.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs line-clamp-1">
                                        {list.description}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem className="gap-2">
                                            <ExternalLink className="h-3.5 w-3.5" /> Abrir Lista
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2">
                                            <Download className="h-3.5 w-3.5" /> Exportar CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="gap-2 text-destructive">
                                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-primary/40" />
                                    <span>{list.count} empresas</span>
                                </div>
                                <span>Atualizado em {new Date(list.updatedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {mockLists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <ListChecks className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Nenhuma lista encontrada</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                        Comece prospectando empresas no "Motor de Prospecção" e salve-os em listas personalizadas.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => window.location.href = '/dashboard/leads'}>
                        Ir para Prospecção
                    </Button>
                </div>
            )}
        </PageContent>
    )
}
