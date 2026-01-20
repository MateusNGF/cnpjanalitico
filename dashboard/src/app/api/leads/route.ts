import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';
import { z } from 'zod';

const leadsQuerySchema = z.object({
    cnae: z.string().optional(),
    uf: z.string().optional(),
    municipio: z.string().optional(),
    situacao: z.string().optional().default('02'),
    capital_min: z.string().optional().transform(val => {
        const parsed = val ? parseFloat(val) : 0;
        return isNaN(parsed) ? 0 : parsed;
    }),
    limit: z.string().optional().transform(val => {
        const parsed = val ? parseInt(val, 10) : 100;
        return isNaN(parsed) ? 100 : parsed;
    }),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params = leadsQuerySchema.parse(Object.fromEntries(searchParams));

        let query = `
      SELECT 
        est.cnpj_basico,
        est.cnpj_ordem,
        est.cnpj_dv,
        emp.razao_social,
        est.nome_fantasia,
        est.uf,
        est.municipio,
        emp.capital_social,
        est.ddd1,
        est.telefone1,
        est.correio_eletronico,
        est.situacao_cadastral
      FROM cnpj_analytics.estabelecimentos AS est
      ANY LEFT JOIN cnpj_analytics.empresas AS emp ON est.cnpj_basico = emp.cnpj_basico
      WHERE 1=1
    `;

        const queryParams: Record<string, any> = {};

        if (params.uf && params.uf !== 'TODOS') {
            query += ` AND est.uf = {uf:String}`;
            queryParams.uf = params.uf;
        }

        if (params.cnae) {
            query += ` AND est.cnae_fiscal_principal = {cnae:String}`;
            queryParams.cnae = params.cnae;
        }

        if (params.situacao && params.situacao !== 'TODOS') {
            query += ` AND est.situacao_cadastral = {situacao:String}`;
            queryParams.situacao = params.situacao;
        }

        if (params.municipio) {
            query += ` AND est.municipio LIKE {municipio:String}`;
            queryParams.municipio = `%${params.municipio.toUpperCase()}%`;
        }

        if (params.capital_min && params.capital_min > 0) {
            query += ` AND emp.capital_social >= {capital_min:Float64}`;
            queryParams.capital_min = params.capital_min;
        }

        query += ` LIMIT {limit:Int32}`;
        queryParams.limit = params.limit;

        const resultSet = await clickhouse.query({
            query,
            query_params: queryParams,
            format: 'JSONEachRow',
        });

        const dataset = await resultSet.json();

        return NextResponse.json(dataset);
    } catch (error: any) {
        console.error('API Leads Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
