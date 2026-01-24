import { NextRequest, NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';
import { z } from 'zod';

const statsQuerySchema = z.object({
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
    excludeMEI: z.string().optional().transform(val => val === 'true'),
    ageRange: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params = statsQuerySchema.parse(Object.fromEntries(searchParams));

        let baseQuery = `
            FROM cnpj_analytics.estabelecimentos AS est
            ANY LEFT JOIN cnpj_analytics.empresas AS emp ON est.cnpj_basico = emp.cnpj_basico
            ANY LEFT JOIN cnpj_analytics.dim_municipios AS mun ON est.municipio = mun.codigo
            ${params.excludeMEI ? 'ANY LEFT JOIN cnpj_analytics.simples AS sim ON est.cnpj_basico = sim.cnpj_basico' : ''}
            WHERE 1=1
        `;

        const queryParams: Record<string, any> = {};

        if (params.uf && params.uf !== 'TODOS') {
            baseQuery += ` AND est.uf = {uf:String}`;
            queryParams.uf = params.uf;
        }
        if (params.cnae) {
            baseQuery += ` AND est.cnae_fiscal_principal = {cnae:String}`;
            queryParams.cnae = params.cnae;
        }
        if (params.situacao && params.situacao !== 'TODOS') {
            baseQuery += ` AND est.situacao_cadastral = {situacao:String}`;
            queryParams.situacao = params.situacao;
        }
        if (params.municipio) {
            baseQuery += ` AND mun.descricao LIKE {municipio:String}`;
            queryParams.municipio = `%${params.municipio.toUpperCase()}%`;
        }
        if (params.capital_min && params.capital_min > 0) {
            baseQuery += ` AND emp.capital_social >= {capital_min:Float64}`;
            queryParams.capital_min = params.capital_min;
        }
        if (params.capital_max && params.capital_max > 0) {
            baseQuery += ` AND emp.capital_social <= {capital_max:Float64}`;
            queryParams.capital_max = params.capital_max;
        }
        if (params.excludeMEI) {
            baseQuery += ` AND (sim.opcao_pelo_mei IS NULL OR sim.opcao_pelo_mei != 'S')`;
        }
        if (params.ageRange) {
            if (params.ageRange === '0-0.25') baseQuery += ` AND dateDiff('day', est.data_inicio_atividade, today()) <= 90`;
            else if (params.ageRange === '0-1') baseQuery += ` AND dateDiff('year', est.data_inicio_atividade, today()) < 1`;
            else if (params.ageRange === '1-3') baseQuery += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 1 AND dateDiff('year', est.data_inicio_atividade, today()) < 3`;
            else if (params.ageRange === '3-5') baseQuery += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 3 AND dateDiff('year', est.data_inicio_atividade, today()) < 5`;
            else if (params.ageRange === '5+') baseQuery += ` AND dateDiff('year', est.data_inicio_atividade, today()) >= 5`;
            baseQuery += ` AND est.data_inicio_atividade IS NOT NULL`;
        }

        // 1. Natureza Juridica Distribution
        const natureQuery = `
            SELECT 
                emp.natureza_juridica as label,
                count(*) as total
            ${baseQuery}
            AND emp.natureza_juridica IS NOT NULL
            GROUP BY label
            ORDER BY total DESC
            LIMIT 5
        `;

        // 2. Capital Social Ranges
        const capitalRangeQuery = `
            SELECT 
                multiIf(
                    emp.capital_social < 10000, 'Até 10k',
                    emp.capital_social < 100000, '10k - 100k',
                    emp.capital_social < 1000000, '100k - 1M',
                    'Acima de 1M'
                ) as label,
                count(*) as total
            ${baseQuery}
            GROUP BY label
            ORDER BY total DESC
        `;

        // 3. Top CNAEs within current filters
        const cnaeQuery = `
            SELECT 
                est.cnae_fiscal_principal as label,
                count(*) as total
            ${baseQuery}
            GROUP BY label
            ORDER BY total DESC
            LIMIT 5
        `;

        const [natureRes, capitalRes, cnaeRes] = await Promise.all([
            clickhouse.query({ query: natureQuery, query_params: queryParams, format: 'JSONEachRow' }),
            clickhouse.query({ query: capitalRangeQuery, query_params: queryParams, format: 'JSONEachRow' }),
            clickhouse.query({ query: cnaeQuery, query_params: queryParams, format: 'JSONEachRow' }),
        ]);

        const nature = await natureRes.json();
        const capital = await capitalRes.json();
        const cnaes = await cnaeRes.json();

        console.log('Stats Debug:', {
            natureCount: nature.length,
            capitalCount: capital.length,
            cnaesCount: cnaes.length
        });

        return NextResponse.json({
            nature,
            capital,
            cnaes,
        });
    } catch (error: any) {
        console.error('API Leads Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
