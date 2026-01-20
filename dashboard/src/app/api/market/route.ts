import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    try {
        // 1. Densidade por UF (Empresas Ativas)
        const densityPromise = clickhouse.query({
            query: `
                SELECT 
                    uf, 
                    sum(total) as total
                FROM cnpj_analytics.mv_resumo_uf
                WHERE situacao_cadastral = '02'
                GROUP BY uf
                ORDER BY total DESC
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 2. Setores Aquecidos (Top CNAEs)
        const hotSectorsPromise = clickhouse.query({
            query: `
                SELECT 
                    cnae_fiscal_principal,
                    sum(total) as total
                FROM cnpj_analytics.mv_cnae_ranking
                GROUP BY cnae_fiscal_principal
                ORDER BY total DESC
                LIMIT 10
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 3. Natureza Jurídica (Distribuição)
        const naturePromise = clickhouse.query({
            query: `
                SELECT 
                    natureza_juridica,
                    count() as total
                FROM cnpj_analytics.empresas
                GROUP BY natureza_juridica
                ORDER BY total DESC
                LIMIT 5
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 4. High Risk (UF com mais baixas)
        const highRiskPromise = clickhouse.query({
            query: `
                SELECT 
                    uf, 
                    sum(total) as total
                FROM cnpj_analytics.mv_resumo_uf
                WHERE situacao_cadastral = '08'
                GROUP BY uf
                ORDER BY total DESC
                LIMIT 1
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        const [densityData, hotSectorsData, natureData, highRiskData] = await Promise.all([
            densityPromise as Promise<any[]>,
            hotSectorsPromise as Promise<any[]>,
            naturePromise as Promise<any[]>,
            highRiskPromise as Promise<any[]>
        ]);

        // Processamento dos Insights
        const topGrowthUF = densityData?.[0] || { uf: "N/A", total: 0 };
        const topSector = hotSectorsData?.[0] || { cnae_fiscal_principal: "N/A", total: 0 };
        const riskUF = highRiskData?.[0] || { uf: "N/A", total: 0 };

        return NextResponse.json({
            density: densityData,
            hotSectors: hotSectorsData,
            natureDistribution: natureData,
            insights: {
                blueOcean: {
                    location: `${topGrowthUF.uf}`,
                    reason: "Maior densidade de empresas ativas"
                },
                hotSector: {
                    name: topSector.cnae_fiscal_principal,
                    growth: `${topSector.total} registros`
                },
                highRisk: {
                    location: `${riskUF.uf}`,
                    rate: `${riskUF.total} baixas`
                }
            }
        });
    } catch (error) {
        console.error('API Market Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
