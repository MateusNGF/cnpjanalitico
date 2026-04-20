import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"
import { z } from "zod"

const querySchema = z.object({
    uf: z.string().default("MG"),
    cnae: z.string().default(""),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const params = querySchema.parse({
            uf: searchParams.get("uf") || "MG",
            cnae: searchParams.get("cnae") || "",
        })

        const result = await query(QUERIES.CEP_DENSITY, {
            uf: params.uf,
            cnae: params.cnae,
        })

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            }
        })
    } catch (error) {
        console.error("Geo Density API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
