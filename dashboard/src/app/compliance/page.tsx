"use client";

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

export default function CompliancePage() {
    return (
        <PageContent>
            <PageHeader
                title="Compliance & Risco"
                description="Analise a saúde financeira e o histórico de regularidade de seus parceiros comerciais com dados oficiais."
                icon={<ShieldAlert className="h-6 w-6" />}
                breadcrumbs={[
                    { label: "Segurança", href: "/compliance" },
                    { label: "Compliance" }
                ]}
            />

            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <Card className="border-dashed border-primary/20 bg-muted/5 p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl w-full">
                    <div className="bg-primary/10 p-4 rounded-full mb-2 ring-1 ring-primary/20">
                        <ShieldAlert className="h-12 w-12 text-primary/80" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Análise de Risco Avançada</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Estamos desenvolvendo algoritmos de machine learning para predição de insolvência e análise de teias societárias complexas.
                        <br />
                        Esta funcionalidade estará disponível em breve.
                    </p>
                    <Button variant="outline" className="mt-6 font-bold" disabled>
                        Em Breve
                    </Button>
                </Card>
            </div>
        </PageContent>
    )
}
