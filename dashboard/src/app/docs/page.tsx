import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, Cog, Database, Globe, ShieldCheck, Zap, Briefcase, TrendingUp } from "lucide-react"

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
                            <CardTitle className="text-xl">Funcionalidades do Sistema</CardTitle>
                            <CardDescription>Explore o potencial completo da plataforma para suas estratégias de negócio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="leads">
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                            Prospecção e Leads B2B
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        <p className="mb-2">
                                            A aba <strong>Leads</strong> é o motor de busca principal. Aqui você pode filtrar os mais de 50 milhões de CNPJs ativos no Brasil para encontrar seu cliente ideal (ICP).
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            <li><strong>Filtros Geográficos:</strong> Selecione por Estado (UF) e Cidade para campanhas regionalizadas.</li>
                                            <li><strong>Segmentação por CNAE:</strong> Busque por códigos específicos de atividade econômica (ex: Agências de Publicidade, Farmácias).</li>
                                            <li><strong>Filtro de Capital Social:</strong> Encontre empresas com maior porte financeiro definindo um capital mínimo.</li>
                                            <li><strong>Situação Cadastral:</strong> Foque apenas em empresas ATIVAS e evite leads inválidos.</li>
                                            <li><strong>Exportação:</strong> Exporte os resultados para CSV/Excel para utilizar em seu CRM ou ferramentas de cold mail.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="market">
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-500" />
                                            Inteligência de Mercado
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        <p className="mb-2">
                                            A aba <strong>Market</strong> oferece uma visão macroscópica da economia. Utilize para identificar tendências antes dos seus concorrentes.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            <li><strong>Oceano Azul:</strong> Algoritmo que cruza alta demanda com baixa concorrência, sugerindo as melhores cidades para abrir novos negócios.</li>
                                            <li><strong>Setores Aquecidos:</strong> Identifica quais CNAEs tiveram maior crescimento percentual nos últimos 6 meses.</li>
                                            <li><strong>Alerta de Saturação:</strong> Monitora setores com alta taxa de mortalidade (fechamento de empresas), indicando alto risco.</li>
                                            <li><strong>Distribuição Geográfica:</strong> Mapas de calor (Heatmaps) mostrando onde o dinheiro está circulando.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="tech">
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-orange-500" />
                                            Engenharia & Performance
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        <p className="mb-2">
                                            Nosso diferencial é a velocidade. Processamos Big Data governamental em tempo real.
                                        </p>
                                        <div className="grid gap-4 pt-2">
                                            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                                                <h5 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><Database className="h-3 w-3" /> ClickHouse</h5>
                                                <p className="text-xs">Banco de dados analítico (OLAP) que permite queries em bilhões de linhas em milissegundos.</p>
                                            </div>
                                            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                                                <h5 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Golang & Python</h5>
                                                <p className="text-xs">Coleta paralela e processamento local garantem que os dados nunca saiam do seu ambiente controlado.</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
