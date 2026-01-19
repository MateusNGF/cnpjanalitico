import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Search, Clock, BadgeCheck, TrendingUp } from "lucide-react"

export default function CompliancePage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Compliance & Risco</h1>
                <p className="text-muted-foreground">Analise a saúde e o histórico de parceiros comerciais.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Consulta Rápida de CNPJ</CardTitle>
                        <CardDescription>Verifique a situação atual e o score de risco.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input placeholder="Digite o CNPJ..." className="flex-1" />
                            <Button>
                                <Search className="mr-2 h-4 w-4" /> Consultar
                            </Button>
                        </div>

                        <div className="mt-8 border rounded-lg p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">EMPRESA EXEMPLO S.A.</h3>
                                    <p className="text-sm text-muted-foreground">00.000.000/0001-91</p>
                                </div>
                                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">
                                    ATIVO
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Idade</p>
                                    <p className="font-semibold">12 Anos</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Capital Social</p>
                                    <p className="font-semibold">R$ 5M</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Score de Risco</p>
                                    <p className="font-semibold text-green-500 text-lg">9.8</p>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-md border border-dashed flex items-center gap-3">
                                <BadgeCheck className="h-5 w-5 text-primary" />
                                <p className="text-sm">Empresa com histórico estável de crescimento e regularidade cadastral.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Histórico de Alterações</CardTitle>
                        <CardDescription>Timeline de mudanças societárias e de capital.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-2">
                            {[
                                { date: "Jan 2026", msg: "Aumento de Capital Social para R$ 5.000.000", icon: <TrendingUp className="h-3 w-3" /> },
                                { date: "Out 2024", msg: "Entrada de Novo Sócio: João Silva", icon: <Clock className="h-3 w-3" /> },
                                { date: "Mai 2022", msg: "Mudança de Endereço Principal", icon: <Clock className="h-3 w-3" /> },
                            ].map((item, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-[6px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                    <p className="text-xs font-bold text-muted-foreground">{item.date}</p>
                                    <p className="text-sm">{item.msg}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs">Ver histórico completo</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-red-500/10 p-2 rounded-full">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <CardTitle>Alertas de Risco</CardTitle>
                            <CardDescription>Empresas críticas em sua carteira de fornecedores.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum alerta crítico encontrado no momento.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Consultas Recentes</CardTitle>
                        <CardDescription>CNPJs que você verificou ultimamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer">
                                    <div className="text-sm font-medium">Empresa de Teste {i}</div>
                                    <div className="text-xs text-muted-foreground">há {i} horas</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
