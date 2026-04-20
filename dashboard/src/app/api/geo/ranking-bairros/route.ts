import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"

const querySchema = z.object({
    uf: z.string().default("MG"),
    municipio_id: z.string().default(""),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const params = querySchema.parse({
            uf: searchParams.get("uf") || "MG",
            municipio_id: searchParams.get("municipio_id") || "",
        })

        const result = await query(QUERIES.RANKING_BAIRROS, {
            uf: params.uf,
            municipio_id: params.municipio_id,
        })

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            }
        })
    } catch (error) {
        console.error("Neighborhood Ranking API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
