import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const uf = searchParams.get('uf');

        // Construir cláusula WHERE para filtro de UF
        const ufFilter = uf ? `AND uf = '${uf}'` : '';

        // 1. Densidade por UF (Empresas Ativas)
        const densityPromise = clickhouse.query({
            query: `
                SELECT 
                    uf, 
                    sum(total) as total
                FROM cnpj_analytics.mv_resumo_uf
                WHERE situacao_cadastral = '02' ${ufFilter}
                GROUP BY uf
                ORDER BY total DESC
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 2. Setores Aquecidos (Top CNAEs)
        const hotSectorsQuery = uf ? `
            SELECT 
                cnae_fiscal_principal,
                count() as total
            FROM cnpj_analytics.estabelecimentos
            WHERE uf = '${uf}' AND situacao_cadastral = '02'
            GROUP BY cnae_fiscal_principal
            ORDER BY total DESC
            LIMIT 10
        ` : `
            SELECT 
                cnae_fiscal_principal,
                sum(total) as total
            FROM cnpj_analytics.mv_cnae_ranking
            GROUP BY cnae_fiscal_principal
            ORDER BY total DESC
            LIMIT 10
        `;

        const hotSectorsPromise = clickhouse.query({
            query: hotSectorsQuery,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 3. Natureza Jurídica (Distribuição)
        const natureQuery = uf ? `
            SELECT 
                natureza_juridica,
                count() as total
            FROM cnpj_analytics.empresas e
            INNER JOIN cnpj_analytics.estabelecimentos est 
                ON e.cnpj_basico = est.cnpj_basico
            WHERE est.uf = '${uf}' AND est.situacao_cadastral = '02'
            GROUP BY natureza_juridica
            ORDER BY total DESC
            LIMIT 5
        ` : `
            SELECT 
                natureza_juridica,
                count() as total
            FROM cnpj_analytics.empresas
            GROUP BY natureza_juridica
            ORDER BY total DESC
            LIMIT 5
        `;

        const naturePromise = clickhouse.query({
            query: natureQuery,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 4. High Risk (UF com mais baixas)
        const highRiskPromise = clickhouse.query({
            query: `
                SELECT 
                    uf, 
                    sum(total) as total
                FROM cnpj_analytics.mv_resumo_uf
                WHERE situacao_cadastral = '08' ${ufFilter}
                GROUP BY uf
                ORDER BY total DESC
                LIMIT 1
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // 5. PIB Empresarial Municipal (Ranking por Capital Social)
        const economicGdpQuery = uf ? `
            SELECT 
                est.municipio as codigo,
                m.descricao as nome,
                est.uf,
                SUM(emp.capital_social) as pib_empresarial,
                COUNT(*) as total_empresas
            FROM cnpj_analytics.estabelecimentos est
            JOIN cnpj_analytics.empresas emp ON est.cnpj_basico = emp.cnpj_basico
            LEFT JOIN cnpj_analytics.dim_municipios m ON est.municipio = m.codigo
            WHERE est.situacao_cadastral = '02' AND est.uf = '${uf}'
            GROUP BY est.municipio, m.descricao, est.uf
            ORDER BY pib_empresarial DESC
            LIMIT 15
        ` : `
            SELECT 
                est.municipio as codigo,
                m.descricao as nome,
                est.uf,
                SUM(emp.capital_social) as pib_empresarial,
                COUNT(*) as total_empresas
            FROM cnpj_analytics.estabelecimentos est
            JOIN cnpj_analytics.empresas emp ON est.cnpj_basico = emp.cnpj_basico
            LEFT JOIN cnpj_analytics.dim_municipios m ON est.municipio = m.codigo
            WHERE est.situacao_cadastral = '02'
            GROUP BY est.municipio, m.descricao, est.uf
            ORDER BY pib_empresarial DESC
            LIMIT 15
        `;

        const economicGdpPromise = clickhouse.query({
            query: economicGdpQuery,
            format: 'JSONEachRow'
        }).then(res => res.json());

        const [densityData, hotSectorsData, natureData, highRiskData, economicGdpData] = await Promise.all([
            densityPromise as Promise<any[]>,
            hotSectorsPromise as Promise<any[]>,
            naturePromise as Promise<any[]>,
            highRiskPromise as Promise<any[]>,
            economicGdpPromise as Promise<any[]>
        ]);

        // Processamento dos Insights
        const topGrowthUF = densityData?.[0] || { uf: "N/A", total: 0 };
        const topSector = hotSectorsData?.[0] || { cnae_fiscal_principal: "N/A", total: 0 };
        const riskUF = highRiskData?.[0] || { uf: "N/A", total: 0 };

        return NextResponse.json({
            density: densityData,
            hotSectors: hotSectorsData,
            natureDistribution: natureData,
            economicGdp: economicGdpData,
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
