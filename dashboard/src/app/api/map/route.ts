import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const uf = searchParams.get("uf") || "BR"

        let result;
        if (uf === 'BR') {
            result = await query<{ id: string; nome: string; value: number }>(
                `SELECT 
                    e.codigo_uf as id, 
                    e.nome as nome, 
                    sum(r.total) as value
                FROM dim_estados e
                LEFT JOIN mv_resumo_uf r ON r.uf = e.sigla
                GROUP BY e.codigo_uf, e.nome`,
                {}
            )
        } else {
            result = await query<{ id: string; nome: string; value: number }>(
                QUERIES.MAP_DENSITY,
                { uf }
            )
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Map API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
