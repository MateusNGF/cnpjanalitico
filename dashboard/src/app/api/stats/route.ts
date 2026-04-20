import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"
import { StateStats, CnaeRanking, PorteDistribution } from "@/features/analytics/components/Map/types"

const querySchema = z.object({
    uf: z.string().default("BR"),
    municipio_id: z.string().nullable().optional(),
    cnae: z.string().nullable().optional(),
    situacao: z.string().nullable().optional(),
    search: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const params = querySchema.parse({
            uf: searchParams.get("uf") || "MG",
            municipio_id: searchParams.get("municipio_id"),
            cnae: searchParams.get("cnae"),
            situacao: searchParams.get("situacao"),
            search: searchParams.get("search"),
        })

        // Execute multiple KPI queries in parallel with explicit types
        const [capitalResult, natalidadeResult, survivalResult, topCnaeResult, porteResult] = await Promise.all([
            query<{ total_market_volume: number }>(QUERIES.KPI_CAPITAL_SOCIAL, { uf: params.uf }),
            query<{ new_companies: number }>(QUERIES.KPI_NATALIDADE, { uf: params.uf }),
            query<{ survival_index: number }>(QUERIES.KPI_SURVIVAL_RATE, { uf: params.uf }),
            params.search
                ? query<CnaeRanking>(QUERIES.CNAE_SEARCH, { uf: params.uf, municipio_id: params.municipio_id, search: `%${params.search.toLowerCase()}%` })
                : (params.municipio_id
                    ? query<CnaeRanking>(QUERIES.KPI_MUNICIPAL_TOP_CNAE, { uf: params.uf, municipio_id: params.municipio_id })
                    : query<CnaeRanking>(QUERIES.KPI_TOP_CNAE, { uf: params.uf })
                ),
            query<PorteDistribution>(QUERIES.KPI_SEGMENTACAO_PORTE, { uf: params.uf }),
        ])

        const response: StateStats = {
            capital: capitalResult[0]?.total_market_volume || 0,
            natalidade: natalidadeResult[0]?.new_companies || 0,
            survival: survivalResult[0]?.survival_index || 0,
            topCnaes: topCnaeResult.map(r => ({ label: r.label, value: r.value })),
            porteDist: porteResult.map(r => ({ label: r.label, value: r.value })),
        };

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            }
        })
    } catch (error) {
        console.error("Stats API Error:", error)
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
