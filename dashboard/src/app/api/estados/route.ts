import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"

export async function GET(req: NextRequest) {
    try {
        // Fetch from ClickHouse
        const result = await query<{ codigo_uf: number; nome: string; sigla: string; flag_url: string; regiao: string }>(
            "SELECT codigo_uf, nome, sigla, flag_url, regiao FROM dim_estados ORDER BY nome ASC"
        )

        // If table exists but has no data, result will be []
        if (!result || result.length === 0) {
            console.warn("States API: dim_estados is empty.")
            return NextResponse.json([])
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("States API Error:", error)
        // Return error with 500 so UI can handle it or use a default list
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
