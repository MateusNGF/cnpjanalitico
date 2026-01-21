import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const uf = searchParams.get('uf');
    const cnae = searchParams.get('cnae');
    const situacao = searchParams.get('situacao') || '02'; // Default to active

    try {
        let query = `
            SELECT 
                m.codigo_ibge as id,
                m.descricao as municipio,
                count() as total
            FROM cnpj_analytics.estabelecimentos e
            INNER JOIN cnpj_analytics.dim_municipios m ON e.municipio = m.codigo
            WHERE 1=1
        `;

        const params: any = {};

        if (uf) {
            query += ` AND e.uf = {uf:String}`;
            params.uf = uf;
        }

        if (situacao && situacao !== 'all') {
            query += ` AND e.situacao_cadastral = {situacao:String}`;
            params.situacao = situacao;
        }

        if (cnae) {
            query += ` AND e.cnae_fiscal_principal = {cnae:String}`;
            params.cnae = cnae;
        }

        query += `
            GROUP BY id, municipio
            HAVING id != '0000000'
        `;

        const result = await clickhouse.query({
            query,
            query_params: params,
            format: 'JSONEachRow'
        });

        const data = await result.json();

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API Geo Density Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
