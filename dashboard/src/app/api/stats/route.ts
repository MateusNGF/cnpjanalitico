import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"

const querySchema = z.object({
    uf: z.string().default("BR"),
    municipio: z.string().nullable().optional(),
    cnae: z.string().nullable().optional(),
    situacao: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const rawParams = {
            uf: searchParams.get("uf") || "BR",
            municipio: searchParams.get("municipio"),
            cnae: searchParams.get("cnae"),
            situacao: searchParams.get("situacao"),
        }

        const params = querySchema.parse(rawParams)
        const isNational = params.uf === "BR"

        // Execute multiple KPI queries in parallel
        const [capitalResult, natalidadeResult, survivalResult, topCnaeResult] = await Promise.all([
            query<{ total_market_volume: number }>(
                isNational ? "SELECT sum(capital_total_setor) as total_market_volume FROM v_concentracao_mercado" : QUERIES.KPI_CAPITAL_SOCIAL,
                isNational ? {} : { uf: params.uf }
            ),
            query<{ new_companies: number }>(
                isNational ? "SELECT sum(total) as new_companies FROM mv_resumo_uf WHERE situacao_cadastral = '02'" : QUERIES.KPI_NATALIDADE,
                isNational ? {} : { uf: params.uf }
            ),
            query<{ survival_index: number }>(
                isNational ? "SELECT avg(tempo_vida_anos) as survival_index FROM mv_stats_sobrevivencia" : QUERIES.KPI_SURVIVAL_RATE,
                isNational ? {} : { uf: params.uf }
            ),
            query<{ label: string; value: number }>(
                isNational
                    ? "SELECT c.descricao as label, sum(r.total) as value FROM mv_cnae_ranking r JOIN dim_cnae c ON r.cnae_fiscal_principal = c.codigo GROUP BY label ORDER BY value DESC LIMIT 1"
                    : QUERIES.KPI_TOP_CNAE,
                isNational ? {} : { uf: params.uf }
            ),
        ])

        return NextResponse.json({
            capital: capitalResult[0]?.total_market_volume || 0,
            natalidade: natalidadeResult[0]?.new_companies || 0,
            survival: survivalResult[0]?.survival_index || 0,
            topCnae: topCnaeResult[0]?.label || "N/A",
        })
    } catch (error) {
        console.error("Stats API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
