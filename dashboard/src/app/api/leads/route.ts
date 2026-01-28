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

        const result = await query(QUERIES.LEAD_LIST, {
            uf: params.uf,
            municipio: params.municipio || "Belo Horizonte" // Mocking a default if not provided for now to avoid crash if query requires it
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
