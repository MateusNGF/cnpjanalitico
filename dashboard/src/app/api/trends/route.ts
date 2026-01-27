import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const uf = searchParams.get("uf") || "MG"

        const result = await query<{ month: string; natalidade: number; mortalidade: number }>(
            QUERIES.TREND_CHART,
            { uf }
        )

        return NextResponse.json(result)
    } catch (error) {
        console.error("Trends API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
