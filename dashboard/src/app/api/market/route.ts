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

        const [densityData, hotSectorsData, natureData] = await Promise.all([
            densityPromise,
            hotSectorsPromise,
            naturePromise
        ]);

        return NextResponse.json({
            density: densityData,
            hotSectors: hotSectorsData,
            natureDistribution: natureData,
            insights: {
                blueOcean: { location: "Curitiba/PR", reason: "Alta renda, baixa densidade de Petshops" }, // Placeholder
                hotSector: { name: "Energia Solar", growth: "+45%" }, // Placeholder
                highRisk: { location: "Centro / SP", rate: "28%" } // Placeholder
            }
        });
    } catch (error) {
        console.error('API Market Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
