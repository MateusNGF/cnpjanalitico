import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';
import { z } from 'zod';

const leadsQuerySchema = z.object({
    cnae: z.string().optional(),
    uf: z.string().optional(),
    municipio: z.string().optional(),
    capital_min: z.string().transform(val => parseFloat(val) || 0).optional(),
    limit: z.string().transform(val => parseInt(val) || 100).optional(),
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
        est.correio_eletronico
      FROM cnpj_analytics.estabelecimentos AS est
      ANY LEFT JOIN cnpj_analytics.empresas AS emp ON est.cnpj_basico = emp.cnpj_basico
      WHERE est.situacao_cadastral = '02' 
    `;

        const queryParams: Record<string, any> = {};

        if (params.uf) {
            query += ` AND est.uf = {uf:String}`;
            queryParams.uf = params.uf;
        }
        if (params.cnae) {
            query += ` AND est.cnae_fiscal_principal = {cnae:String}`;
            queryParams.cnae = params.cnae;
        }
        if (params.capital_min) {
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
    } catch (error) {
        console.error('API Leads Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
