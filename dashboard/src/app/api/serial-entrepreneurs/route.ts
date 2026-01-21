import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');

        // Query para Top Sócios (Empreendedores Serials / Potenciais Laranjas)
        const serialEntrepreneursPromise = clickhouse.query({
            query: `
                SELECT 
                    nome_socio,
                    total_empresas,
                    total_capital_social
                FROM cnpj_analytics.mv_top_socios
                WHERE nome_socio IS NOT NULL 
                  AND nome_socio != ''
                  AND total_empresas >= 3
                ORDER BY total_empresas DESC
                LIMIT ${limit}
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        // Estatísticas Gerais
        const statsPromise = clickhouse.query({
            query: `
                SELECT 
                    count(*) as total_serial_entrepreneurs,
                    max(total_empresas) as max_empresas_por_socio,
                    avg(total_empresas) as avg_empresas_por_socio
                FROM cnpj_analytics.mv_top_socios
                WHERE total_empresas >= 3
            `,
            format: 'JSONEachRow'
        }).then(res => res.json());

        const [serialData, statsData] = await Promise.all([
            serialEntrepreneursPromise as Promise<any[]>,
            statsPromise as Promise<any[]>
        ]);

        return NextResponse.json({
            serialEntrepreneurs: serialData,
            stats: statsData[0] || {
                total_serial_entrepreneurs: 0,
                max_empresas_por_socio: 0,
                avg_empresas_por_socio: 0
            }
        });
    } catch (error) {
        console.error('API Serial Entrepreneurs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
