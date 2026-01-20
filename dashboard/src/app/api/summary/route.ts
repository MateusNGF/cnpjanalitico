import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    try {
        // 1. & 2. Total de Empresas e Ativas (Usando mv_resumo_uf)
        const summaryStatsPromise = clickhouse.query({
            query: `
                SELECT 
                    situacao_cadastral,
                    sum(total) as count
                FROM cnpj_analytics.mv_resumo_uf
                GROUP BY situacao_cadastral
            `,
            format: 'JSONEachRow'
        }).then(res => res.json() as Promise<{ situacao_cadastral: string, count: string }[]>);

        // 3. & 5. Crescimento Mensal e Histórico (Usando mv_natalidade_mensal)
        const historyPromise = clickhouse.query({
            query: `
                SELECT 
                    formatDateTime(ano_mes, '%Y-%m') as mes_label,
                    sum(novos_cnpjs) as novos
                FROM cnpj_analytics.mv_natalidade_mensal
                GROUP BY ano_mes
                ORDER BY ano_mes DESC
                LIMIT 12
            `,
            format: 'JSONEachRow'
        }).then(res => res.json() as Promise<{ novos: string, mes_label: string }[]>).catch(e => {
            console.error("History Query Error:", e);
            return [];
        });

        // 4. Principais Setores (CNAE)
        const cnaePromise = clickhouse.query({
            query: `
                SELECT 
                    cnae_fiscal_principal,
                    sum(total) as total
                FROM cnpj_analytics.mv_cnae_ranking
                GROUP BY cnae_fiscal_principal
                ORDER BY total DESC
                LIMIT 5
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        const [statsData, historyData, cnaeData] = await Promise.all([
            summaryStatsPromise,
            historyPromise,
            cnaePromise
        ]);

        const total = statsData.reduce((acc, curr) => acc + parseInt(curr.count), 0);
        const active = parseInt(statsData.find(s => s.situacao_cadastral === '02')?.count || '0');

        // Inverter historyData para ordem cronológica no gráfico (ASC) e pegar o último para o monthlyGrowth
        const growthHistory = [...historyData].reverse();
        const monthlyGrowth = parseInt(historyData[0]?.novos || '0');
        const lastMonth = historyData[0]?.mes_label || '';

        const closed = parseInt(statsData.find(s => s.situacao_cadastral === '08')?.count || '0');
        const mortalityRate = total > 0 ? ((closed / total) * 100).toFixed(1) : 0;

        return NextResponse.json({
            summary: {
                total,
                active,
                monthlyGrowth,
                lastMonth,
                mortalityRate,
            },
            topSectors: cnaeData,
            growthHistory
        });
    } catch (error: any) {
        console.error('API Summary Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
