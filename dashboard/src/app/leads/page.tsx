import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Briefcase, MapPin, DollarSign, X } from "lucide-react"

export default function LeadsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Prospecção B2B</h1>
                <p className="text-muted-foreground">Filtre leads qualificados com base nos dados da Receita Federal.</p>
            </div>

            <Card className="border-primary/10 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-xl">Filtros de Segmentação</CardTitle>
                    <CardDescription>Refine sua busca para encontrar as melhores oportunidades de negócio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-primary" /> CNAE / Setor
                            </label>
                            <div className="relative">
                                <Input placeholder="Ex: Restaurantes, TI..." className="pl-9" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> Localização
                            </label>
                            <div className="relative">
                                <Input placeholder="Ex: SP, Curitiba..." className="pl-9" />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> Capital Social
                            </label>
                            <div className="relative">
                                <Input type="number" placeholder="Mínimo (ex: 50000)" className="pl-9" />
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button className="flex-1 font-bold shadow-lg shadow-primary/20">
                                <Search className="mr-2 h-4 w-4" /> Buscar Leads
                            </Button>
                            <Button variant="outline" size="icon" title="Limpar Filtros">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Empresas Encontradas</CardTitle>
                        <CardDescription>Listagem de leads baseada nos filtros aplicados.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
                        </Button>
                        <Button variant="secondary" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Exportar CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Razão Social</TableHead>
                                <TableHead>CNPJ</TableHead>
                                <TableHead>Cidade / UF</TableHead>
                                <TableHead>Capital Social</TableHead>
                                <TableHead>Situação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium group-hover:text-primary transition-colors">Empresa Stratos {i} S.A.</TableCell>
                                    <TableCell className="text-muted-foreground">00.000.000/0001-0{i}</TableCell>
                                    <TableCell>São Paulo / SP</TableCell>
                                    <TableCell>R$ {i * 100}.000,00</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 ring-1 ring-inset ring-green-500/20">
                                            Ativa
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Detalhes</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
