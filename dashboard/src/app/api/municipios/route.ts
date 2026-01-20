import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const uf = searchParams.get('uf') || '';

    try {
        // Query to get municipalities with company counts
        // Joining dim_municipios with a subquery of counts from estabelecimentos
        // for better performance on large datasets
        let query = `
            SELECT 
                m.codigo,
                m.descricao,
                m.uf,
                count() as total
            FROM cnpj_analytics.dim_municipios m
            JOIN cnpj_analytics.estabelecimentos e ON m.codigo = e.municipio
            WHERE 1=1
        `;

        if (search) {
            query += ` AND (m.descricao ILIKE '%${search}%' OR m.codigo = '${search}')`;
        }

        if (uf) {
            query += ` AND m.uf = '${uf}'`;
        }

        query += `
            GROUP BY m.codigo, m.descricao, m.uf
            ORDER BY total DESC
            LIMIT 50
        `;

        const data = await clickhouse.query({
            query,
            format: 'JSONEachRow'
        }).then(res => res.json());

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Municipios Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
