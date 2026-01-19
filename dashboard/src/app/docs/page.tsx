import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Cog, Database, Globe, ShieldCheck, Zap } from "lucide-react"

export default function DocsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ajuda & Documentação</h1>
                <p className="text-muted-foreground">Entenda os conceitos e aprenda a utilizar o potencial máximo dos dados.</p>
            </div>

            <Tabs defaultValue="dictionary" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="dictionary" className="flex items-center gap-2">
                        <Book className="h-4 w-4" /> Dicionário
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-2">
                        <Cog className="h-4 w-4" /> Funcionalidades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dictionary" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Database className="h-5 w-5" /> Demografia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">Natalidade</h4>
                                    <p className="text-sm">Abertura de novos CNPJs. Representa o surgimento de novos players no mercado e o vigor econômico de uma região.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">Mortalidade</h4>
                                    <p className="text-sm">Encerramento de empresas (Baixa). Essencial para calcular o risco e a "sobrevida" de um setor em determinado local.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">Densidade</h4>
                                    <p className="text-sm">Quantidade de empresas de um setor por habitante ou por km². Ajuda a identificar saturação ou carência (Oceano Azul).</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Globe className="h-5 w-5" /> Conceitos Técnicos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">CNAE</h4>
                                    <p className="text-sm">Classificação Nacional de Atividades Econômicas. Define o "que" a empresa faz (ex: 4711-3/02 - Supermercados).</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">Situação Cadastral</h4>
                                    <p className="text-sm">Status oficial na Receita (Ativa, Baixada, Suspensa, Inapta ou Nula). Determina a saúde jurídica imediata.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-muted-foreground mb-1">Capital Social</h4>
                                    <p className="text-sm">Valor investido pelos sócios. É um forte indicador do porte e do poder de investimento de um lead B2B.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Como utilizamos os dados?</CardTitle>
                            <CardDescription>Nosso pipeline transforma dados brutos em inteligência estratégica em 3 etapas:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                                <div>
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        Coleta Veloz (Downloader Go)
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Utilizamos binários em Go com processamento paralelo (Goroutines) para baixar os arquivos da Receita Federal 5x mais rápido que scripts convencionais. Isso garante que seu dado esteja sempre atualizado com o mês corrente.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                                <div>
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        Processamento Moderno (ETL Python/Polars)
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Limpamos e processamos gigabytes de CSVs sem travar o servidor. Utilizamos a biblioteca Polars, que é otimizada para performance em multi-core, preparando o dado para consultas instantâneas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
                                <div>
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        Análise em Tempo Real (ClickHouse)
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Todas as consultas no dashboard (filtros, mapas e gráficos) rodam sobre o ClickHouse, o banco de dados analítico mais rápido do mundo. Filtros complexos em 50 milhões de linhas levam menos de 1 segundo.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex items-center justify-center gap-8 text-muted-foreground opacity-60">
                                <div className="flex items-center gap-2 text-xs"><Zap className="h-4 w-4" /> Performance Máxima</div>
                                <div className="flex items-center gap-2 text-xs"><ShieldCheck className="h-4 w-4" /> Dados Oficiais</div>
                                <div className="flex items-center gap-2 text-xs"><Database className="h-4 w-4" /> Big Data Ready</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
