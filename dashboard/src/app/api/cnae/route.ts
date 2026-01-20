import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    try {
        // 1. Top CNAEs by number of establishments
        // Using mv_cnae_ranking for performance, joined with dim_cnae for names
        const query = search
            ? `
                SELECT 
                    c.codigo,
                    c.descricao,
                    sum(r.total) as total
                FROM cnpj_analytics.dim_cnae c
                LEFT JOIN cnpj_analytics.mv_cnae_ranking r ON c.codigo = r.cnae_fiscal_principal
                WHERE c.codigo LIKE '%${search}%' OR c.descricao ILIKE '%${search}%'
                GROUP BY c.codigo, c.descricao
                ORDER BY total DESC
                LIMIT 50
            `
            : `
                SELECT 
                    r.cnae_fiscal_principal as codigo,
                    c.descricao,
                    sum(r.total) as total
                FROM cnpj_analytics.mv_cnae_ranking r
                LEFT JOIN cnpj_analytics.dim_cnae c ON r.cnae_fiscal_principal = c.codigo
                GROUP BY r.cnae_fiscal_principal, c.descricao
                ORDER BY total DESC
                LIMIT 20
            `;

        const data = await clickhouse.query({
            query,
            format: 'JSONEachRow'
        }).then(res => res.json());

        return NextResponse.json(data);
    } catch (error) {
        console.error('API CNAE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
