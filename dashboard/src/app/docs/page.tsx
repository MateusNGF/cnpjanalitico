"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, Cog, Database, Globe, ShieldCheck, Zap, Briefcase, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

export default function DocsPage() {
    return (
        <PageContent>
            <PageHeader
                title="Ajuda & Documentação"
                description="Entenda os conceitos técnicos e aprenda a extrair o potencial máximo de nossa inteligência de dados."
                icon={<Book className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Suporte", href: "/docs" },
                    { label: "Documentação" }
                ]}
            />

            <Tabs defaultValue="dictionary" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/20 border border-border/50 rounded-xl shadow-inner">
                    <TabsTrigger value="dictionary" className="flex items-center gap-2 rounded-lg py-2 font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">
                        <Book className="h-4 w-4" /> Dicionário de Dados
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-2 rounded-lg py-2 font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">
                        <Cog className="h-4 w-4" /> Guia de Uso
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dictionary" className="mt-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary text-lg font-extrabold tracking-tight">
                                    <Database className="h-5 w-5" /> Demografia Empresarial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Natalidade</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Abertura de novos CNPJs. Representa o surgimento de novos players no mercado e o vigor econômico de uma região em tempo real.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Mortalidade</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Encerramento de empresas (Baixa). Essencial para calcular o risco e a "sobrevida" média de um setor em determinado local.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Densidade</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Quantidade de empresas de um setor por habitante ou por km². Ajuda a identificar saturação ou carência extrema (Oceano Azul).</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary text-lg font-extrabold tracking-tight">
                                    <Globe className="h-5 w-5" /> Conceitos Técnicos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">CNAE</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Classificação Nacional de Atividades Econômicas. Define a atividade estatística da empresa (ex: 4711-3/02 - Supermercados).</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Situação Cadastral</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Status oficial na Receita Federal (Ativa, Baixada, Suspensa, Inapta ou Nula). Determina a saúde jurídica imediata do lead.</p>
                                </div>
                                <div className="group">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Capital Social</h4>
                                    <p className="text-[13px] text-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-4 group-hover:border-primary/40 transition-colors">Valor investido pelos sócios. É um forte indicador do porte, solidez e do poder de investimento de um lead B2B qualificado.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="mt-8 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-primary/5 bg-muted/5 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-extrabold tracking-tight">Arquitetura de Funcionalidades</CardTitle>
                            <CardDescription>Explore o ecossistema completo para maximizar suas estratégias de Big Data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="leads" className="border-primary/10 hover:bg-primary/[0.01] transition-colors">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-bold tracking-tight">Prospecção e Leads B2B</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed px-2 pb-6">
                                        <p className="mb-4 text-sm mt-2">
                                            O módulo de <strong>Leads</strong> permite filtrar mais de 55 milhões de CNPJs para identificar perfis ideais de clientes (ICP).
                                        </p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <ul className="space-y-3 text-[13px]">
                                                <li className="flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span><strong>Segmentação por CNAE:</strong> Filtros técnicos por atividade econômica específica.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span><strong>Filtros Geográficos:</strong> Precisão cirúrgica por UF e Município.</span>
                                                </li>
                                            </ul>
                                            <ul className="space-y-3 text-[13px]">
                                                <li className="flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span><strong>Poder de Compra:</strong> Filtragem por Capital Social integralizado.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span><strong>Exportação Estratégica:</strong> Extração direta para CSV/Excel compatível com CRMs.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="market" className="border-primary/10 hover:bg-primary/[0.01] transition-colors">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20">
                                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <span className="font-bold tracking-tight">Inteligência de Mercado (Analytical)</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed px-2 pb-6">
                                        <p className="mb-4 text-sm mt-2">
                                            O módulo <strong>Market</strong> oferece visão macroscópica e preditiva da economia nacional.
                                        </p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="bg-background/40 p-3 rounded-xl border border-border/50">
                                                <h5 className="font-black text-[9px] uppercase tracking-widest text-blue-500 mb-1.5">Algoritmos Proprietários</h5>
                                                <p className="text-[12px] leading-relaxed">Cruzamento de densidade demográfica, mortalidade setorial e volume de novas aberturas.</p>
                                            </div>
                                            <div className="bg-background/40 p-3 rounded-xl border border-border/50">
                                                <h5 className="font-black text-[9px] uppercase tracking-widest text-blue-500 mb-1.5">Mapas de Calor</h5>
                                                <p className="text-[12px] leading-relaxed">Identificação visual de pólos econômicos e zonas saturações de mercado.</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="tech" className="border-primary/10 border-b-0 hover:bg-primary/[0.01] transition-colors">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                                                <Zap className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <span className="font-bold tracking-tight">Arquitetura de Performance (Big Data)</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed px-2 pb-6">
                                        <div className="grid gap-4 pt-2 md:grid-cols-2">
                                            <div className="bg-background/50 p-4 rounded-xl border border-border/50 hover:border-orange-500/20 transition-colors shadow-sm">
                                                <h5 className="font-extrabold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2 text-foreground"><Database className="h-3.5 w-3.5 text-orange-500" /> ClickHouse Engine</h5>
                                                <p className="text-[12px] leading-relaxed">Banco de dados colunar orientado a analytics que permite processar bilhões de registros em tempo sub-segundo.</p>
                                            </div>
                                            <div className="bg-background/50 p-4 rounded-xl border border-border/50 hover:border-orange-500/20 transition-colors shadow-sm">
                                                <h5 className="font-extrabold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2 text-foreground"><ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> Golang & Python ETL</h5>
                                                <p className="text-[12px] leading-relaxed">Pipelines de processamento paralelo que garantem a integridade e atualização constante da base de dados RFB.</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageContent>
    )
}
