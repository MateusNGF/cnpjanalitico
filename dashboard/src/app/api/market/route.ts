import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    try {
        // Exemplo: Buscar densidade por UF usando a Materialized View
        const query = `
      SELECT 
        uf, 
        situacao_cadastral, 
        countMerge(total) as total
      FROM cnpj_analytics.mv_resumo_uf
      GROUP BY uf, situacao_cadastral
      ORDER BY total DESC
    `;

        const resultSet = await clickhouse.query({
            query,
            format: 'JSONEachRow',
        });

        const dataset = await resultSet.json();

        return NextResponse.json(dataset);
    } catch (error) {
        console.error('API Market Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
