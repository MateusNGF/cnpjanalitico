"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Building2, AlertTriangle, Loader2 } from "lucide-react"
import { formatNumber, formatQuantity } from "@/lib/utils";
import { SummarySkeleton, ChartSkeleton, ListSkeleton } from "@/components/common/Skeletons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { PageHeader } from "@/components/common/PageHeader";
import { PageContent } from "@/components/common/PageContent";

interface SummaryData {
  summary: {
    total: number;
    active: number;
    monthlyGrowth: number;
    lastMonth: string;
    mortalityRate: number;
  };
  topSectors: {
    cnae_fiscal_principal: string;
    total: string;
  }[];
  growthHistory: {
    mes_label: string;
    novos: string;
    baixadas: string;
    saldo_liquido: string;
  }[];
}

export default function Home() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch summary:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageContent>
        <PageHeader
          title="Visão Geral"
          description="Monitoramento estratégico e análise demográfica do ecossistema empresarial brasileiro em tempo real."
          icon={<Building2 className="h-6 w-6" />}
          breadcrumbs={[{ label: "Dashboard" }, { label: "Visão Geral" }]}
        />
        <SummarySkeleton />
        <ChartSkeleton />
        <div className="grid gap-[var(--section-gap)] grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-3">
            <ListSkeleton items={5} />
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !data) {
    return (
      <PageContent>
        <PageHeader
          title="Visão Geral"
          description="Monitoramento estratégico e análise demográfica do ecossistema empresarial brasileiro em tempo real."
          icon={<Building2 className="h-6 w-6" />}
          breadcrumbs={[{ label: "Dashboard" }, { label: "Visão Geral" }]}
        />
        <Card className="flex h-[400px] flex-col items-center justify-center gap-4 border-dashed border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-12 w-12 text-destructive opacity-50" />
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">Falha na conexão</h3>
            <p className="text-sm text-muted-foreground">Não foi possível carregar os dados do ClickHouse.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="font-bold border-destructive/20 hover:bg-destructive/10 text-destructive"
          >
            Tentar novamente
          </Button>
        </Card>
      </PageContent>
    );
  }

  const sectors = (data.topSectors || []).map((s, i) => {
    const colors = [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)'
    ];
    return {
      name: s.cnae_fiscal_principal,
      value: parseInt(s.total) || 0,
      color: colors[i % colors.length]
    };
  });

  const chartData = (data.growthHistory || []).map(h => ({
    name: h.mes_label,
    novos: parseInt(h.novos) || 0,
    baixadas: parseInt(h.baixadas) || 0,
    saldo_liquido: parseInt(h.saldo_liquido) || 0
  }));

  return (
    <PageContent>
      <PageHeader
        title="Visão Geral"
        description="Monitoramento estratégico e análise demográfica do ecossistema empresarial brasileiro em tempo real."
        icon={<Building2 className="h-6 w-6" />}
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Visão Geral" }
        ]}
      />

      <div className="grid gap-[var(--section-gap)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-background to-primary/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter" title={formatQuantity(data.summary.total)}>{formatNumber(data.summary.total)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Registros oficiais na base da RFB
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-500/10 bg-gradient-to-br from-background to-green-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2">
              <Users className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter" title={formatQuantity(data.summary.active)}>{formatNumber(data.summary.active)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-bold text-green-500">
                {data.summary.total > 0 ? ((data.summary.active / data.summary.total) * 100).toFixed(1) : "0"}%
              </span> do ecossistema nacional
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-orange-500/10 bg-gradient-to-br from-background to-orange-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter" title={formatQuantity(data.summary.monthlyGrowth)}>+{formatNumber(data.summary.monthlyGrowth)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Novos CNPJs em <span className="font-bold uppercase tracking-wider">{data.summary.lastMonth}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-red-500/10 bg-gradient-to-br from-background to-red-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Mortalidade</CardTitle>
            <div className="rounded-full bg-red-500/10 p-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{data.summary.mortalityRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Média estimada de encerramentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Saldo Líquido Chart - Full Width */}
      <Card className="border-primary/5 backdrop-blur-sm bg-muted/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Saldo Líquido Empresarial (Demografia)</CardTitle>
          <CardDescription>
            Análise comparativa de aberturas, fechamentos e crescimento real nos últimos 24 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    novos: "Aberturas",
                    baixadas: "Fechamentos",
                    saldo_liquido: "Saldo Líquido"
                  };
                  return [formatQuantity(value), labels[name] || name];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(var(--background), 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="novos"
                stroke="#10b981"
                strokeWidth={2}
                name="Aberturas"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="baixadas"
                stroke="#ef4444"
                strokeWidth={2}
                name="Fechamentos"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="saldo_liquido"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Saldo Líquido"
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: 'var(--background)' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-[var(--section-gap)] grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-primary/5 backdrop-blur-sm bg-muted/10 shadow-sm overflow-hidden group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Abertura de Empresas por Mês</CardTitle>
                <CardDescription>Volume de novos registros na base da Receita Federal.</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4 p-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNovosSingle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => [formatQuantity(value), "Novas Empresas"]}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="novos"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 border-primary/5 backdrop-blur-sm bg-muted/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Principais Setores (CNAE)</CardTitle>
            <CardDescription>Atividades com maior volume de registros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {sectors.map((item) => (
              <div key={item.name} className="space-y-2 group cursor-pointer">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold group-hover:text-primary transition-colors">CNAE {item.name}</span>
                  <span className="text-muted-foreground font-mono">{formatQuantity(item.value)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(item.value / (sectors[0]?.value || 1)) * 100}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}44`
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  )
}
