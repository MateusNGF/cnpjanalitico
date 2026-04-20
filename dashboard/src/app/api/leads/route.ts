import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"

const querySchema = z.object({
    uf: z.string().default("BR"),
    municipio: z.string().default(""),
    cnae: z.string().default(""),
    capital_min: z.coerce.number().default(0),
    capital_max: z.coerce.number().default(999999999999),
    idade_min: z.coerce.number().default(0),
    idade_max: z.coerce.number().default(150),
    natureza_juridica: z.string().default(""),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const rawParams = Object.fromEntries(searchParams.entries())

        const params = querySchema.parse(rawParams)

        const result = await query(QUERIES.LEAD_LIST, {
            uf: params.uf,
            municipio: params.municipio,
            cnae: params.cnae,
            capital_min: params.capital_min,
            capital_max: params.capital_max,
            idade_min: params.idade_min,
            idade_max: params.idade_max,
            natureza_juridica: params.natureza_juridica,
        })

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30', // 1 minute cache
            }
        })
    } catch (error) {
        console.error("Leads API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
