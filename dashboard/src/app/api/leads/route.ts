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
    capital_max: z.string().optional().transform(val => {
        const parsed = val ? parseFloat(val) : 0;
        return isNaN(parsed) ? 0 : parsed;
    }),
    limit: z.string().optional().transform(val => {
        const parsed = val ? parseInt(val, 10) : 30;
        return isNaN(parsed) ? 30 : parsed;
    }),
    excludeMEI: z.string().optional().transform(val => val === 'true'),
    ageRange: z.string().optional(),
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
        mun.descricao as municipio,
        emp.capital_social,
        est.ddd1,
        est.telefone1,
        est.correio_eletronico,
        est.situacao_cadastral,
        est.data_inicio_atividade,
        est.cnae_fiscal_principal,
        est.tipo_logradouro,
        est.logradouro,
        est.numero,
        est.bairro,
        emp.natureza_juridica
      FROM cnpj_analytics.estabelecimentos AS est
      ANY LEFT JOIN cnpj_analytics.empresas AS emp ON est.cnpj_basico = emp.cnpj_basico
      ANY LEFT JOIN cnpj_analytics.dim_municipios AS mun ON est.municipio = mun.codigo
      ${params.excludeMEI ? 'ANY LEFT JOIN cnpj_analytics.simples AS sim ON est.cnpj_basico = sim.cnpj_basico' : ''}
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
            query += ` AND mun.descricao LIKE {municipio:String}`;
            queryParams.municipio = `%${params.municipio.toUpperCase()}%`;
        }

        if (params.capital_min && params.capital_min > 0) {
            query += ` AND emp.capital_social >= {capital_min:Float64}`;
            queryParams.capital_min = params.capital_min;
        }

        if (params.capital_max && params.capital_max > 0) {
            query += ` AND emp.capital_social <= {capital_max:Float64}`;
            queryParams.capital_max = params.capital_max;
        }

        if (params.excludeMEI) {
            query += ` AND (sim.opcao_pelo_mei IS NULL OR sim.opcao_pelo_mei != 'S')`;
        }

        // Age Range Filter
        if (params.ageRange) {
            const ageRange = params.ageRange;

            if (ageRange === '0-0.25') {
                // Less than 90 days
                query += ` AND dateDiff('day', est.data_inicio_atividade, today()) <= 90`;
            } else if (ageRange === '0-1') {
                // Less than 1 year
                query += ` AND dateDiff('year', est.data_inicio_atividade, today()) < 1`;
            } else if (ageRange === '1-3') {
                // 1 to 3 years
                query += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 1 AND dateDiff('year', est.data_inicio_atividade, today()) < 3`;
            } else if (ageRange === '3-5') {
                // 3 to 5 years
                query += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 3 AND dateDiff('year', est.data_inicio_atividade, today()) < 5`;
            } else if (ageRange === '5+') {
                // 5+ years
                query += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 5`;
            }

            // Also ensure data_inicio_atividade is not null
            query += ` AND est.data_inicio_atividade IS NOT NULL`;
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
