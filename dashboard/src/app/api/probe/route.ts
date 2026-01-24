import { NextResponse } from 'next/server';
import { clickhouse } from '@/lib/clickhouse';

export async function GET() {
    try {
        const estRes = await clickhouse.query({
            query: "DESCRIBE TABLE cnpj_analytics.estabelecimentos",
            format: 'JSONEachRow'
        });
        const estCols = await estRes.json();

        const empRes = await clickhouse.query({
            query: "DESCRIBE TABLE cnpj_analytics.empresas",
            format: 'JSONEachRow'
        });
        const empCols = await empRes.json();

        const simRes = await clickhouse.query({
            query: "DESCRIBE TABLE cnpj_analytics.simples",
            format: 'JSONEachRow'
        });
        const simCols = await simRes.json();

        const sampleRes = await clickhouse.query({
            query: "SELECT natures.natureza_juridica FROM cnpj_analytics.empresas natures LIMIT 1",
            format: 'JSONEachRow'
        });
        const sample = await sampleRes.json();

        return NextResponse.json({
            estabelecimentos: estCols,
            empresas: empCols,
            simples: simCols,
            natureza_sample: sample[0] || null
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
