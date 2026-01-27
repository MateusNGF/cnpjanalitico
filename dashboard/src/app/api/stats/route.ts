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
            uf: searchParams.get("uf") || "MG",
            municipio: searchParams.get("municipio"),
            cnae: searchParams.get("cnae"),
            situacao: searchParams.get("situacao"),
        }

        const params = querySchema.parse(rawParams)

        // Execute multiple KPI queries in parallel
        const [capitalResult, natalidadeResult, survivalResult, topCnaeResult] = await Promise.all([
            query<{ total_market_volume: number }>(QUERIES.KPI_CAPITAL_SOCIAL, { uf: params.uf }),
            query<{ new_companies: number }>(QUERIES.KPI_NATALIDADE, { uf: params.uf }),
            query<{ survival_index: number }>(QUERIES.KPI_SURVIVAL_RATE, { uf: params.uf }),
            query<{ label: string; value: number }>(QUERIES.KPI_TOP_CNAE, { uf: params.uf }),
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
