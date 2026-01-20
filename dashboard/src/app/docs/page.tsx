import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Cog, Database, Globe, ShieldCheck, Zap } from "lucide-react"

export default function DocsPage() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Ajuda & Documentação</h1>
                <p className="text-muted-foreground">Entenda os conceitos e aprenda a utilizar o potencial máximo dos dados estratégicos.</p>
            </div>

            <Tabs defaultValue="dictionary" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/20 border border-border/50 rounded-xl">
                    <TabsTrigger value="dictionary" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Book className="h-4 w-4" /> Dicionário
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Cog className="h-4 w-4" /> Funcionalidades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dictionary" className="mt-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                                    <Database className="h-5 w-5" /> Demografia Empresarial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Natalidade</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Abertura de novos CNPJs. Representa o surgimento de novos players no mercado e o vigor econômico de uma região.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Mortalidade</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Encerramento de empresas (Baixa). Essencial para calcular o risco e a "sobrevida" de um setor em determinado local.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Densidade</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Quantidade de empresas de um setor por habitante ou por km². Ajuda a identificar saturação ou carência (Oceano Azul).</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                                    <Globe className="h-5 w-5" /> Conceitos Técnicos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">CNAE</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Classificação Nacional de Atividades Econômicas. Define o "que" a empresa faz (ex: 4711-3/02 - Supermercados).</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Situação Cadastral</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Status oficial na Receita (Ativa, Baixada, Suspensa, Inapta ou Nula). Determina a saúde jurídica imediata.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Capital Social</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">Valor investido pelos sócios. É um forte indicador do porte e do poder de investimento de um lead B2B.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="mt-8 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Nossa Tecnologia</CardTitle>
                            <CardDescription>Como transformamos dados brutos em inteligência estratégica em 3 macro-etapas:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex gap-6 group">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">1</div>
                                <div>
                                    <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                                        Coleta de Alta Performance (Downloader Go)
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Utilizamos binários em Go com processamento paralelo (Goroutines) para baixar os arquivos da Receita Federal 5x mais rápido que scripts convencionais. Isso garante que seu dado esteja sempre atualizado com o mês corrente.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 group">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">2</div>
                                <div>
                                    <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                                        Engenharia de Dados (ETL Python/Polars)
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Limpamos e processamos gigabytes de CSVs sem travar o servidor. Utilizamos a biblioteca Polars, que é otimizada para performance em multi-core, preparando o dado para consultas instantâneas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 group">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">3</div>
                                <div>
                                    <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                                        Motor Analítico (ClickHouse)
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Todas as consultas no dashboard (filtros, mapas e gráficos) rodam sobre o ClickHouse, o banco de dados analítico mais rápido do mundo. Filtros complexos em 50 milhões de linhas levam menos de 1 segundo.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/50 flex items-center justify-center gap-12 text-muted-foreground opacity-60">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Zap className="h-4 w-4 text-orange-400" /> Performance</div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ShieldCheck className="h-4 w-4 text-blue-400" /> Segurança</div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Database className="h-4 w-4 text-green-400" /> Sustentabilidade</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
