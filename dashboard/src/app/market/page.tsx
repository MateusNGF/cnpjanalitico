import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Map, BarChart3, PieChart } from "lucide-react"

export default function MarketPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inteligência de Mercado</h1>
                <p className="text-muted-foreground">Análise de setores em crescimento e zonas de saturação.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Mapa de Densidade Empresarial</CardTitle>
                        <CardDescription>Concentração de empresas por região e setor.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center border-t border-dashed mt-4 text-muted-foreground bg-muted/20 rounded-md">
                        <Map className="mr-2 h-8 w-8 opacity-20" />
                        [Mapa Interativo - Heatmap]
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Oceano Azul</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">Curitiba/PR</div>
                            <p className="text-xs text-muted-foreground">Alta renda, baixa densidade de Petshops.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Setor Aquecido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">Energia Solar</div>
                            <p className="text-xs text-muted-foreground">+45% de aberturas no último trimestre.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Bairro de Alto Risco</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">Centro / SP</div>
                            <p className="text-xs text-muted-foreground">Taxa de mortalidade de 28% para gastronomia.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Aberturas vs. Baixas</CardTitle>
                        <CardDescription>Equilíbrio do ecossistema empresarial.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
                        <BarChart3 className="mr-2 h-8 w-8 opacity-20" /> Compare Chart
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Natureza Jurídica</CardTitle>
                        <CardDescription>Distribuição por tipo de constituição.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
                        <PieChart className="mr-2 h-8 w-8 opacity-20" /> Distribution Pie
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
