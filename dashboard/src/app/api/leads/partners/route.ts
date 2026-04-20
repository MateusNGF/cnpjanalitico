import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"

const querySchema = z.object({
    cnpj_basico: z.string(),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const params = querySchema.parse({
            cnpj_basico: searchParams.get("cnpj_basico"),
        })

        const result = await query(QUERIES.LIST_PARTNERS, {
            cnpj_basico: params.cnpj_basico,
        })

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            }
        })
    } catch (error) {
        console.error("Partners API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
