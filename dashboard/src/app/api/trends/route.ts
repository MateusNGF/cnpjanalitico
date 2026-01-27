import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/clickhouse"
import { QUERIES } from "@/lib/queries"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const uf = searchParams.get("uf") || "BR"

        let result;
        if (uf === 'BR') {
            result = await query<{ month: string; natalidade: number; mortalidade: number }>(
                `SELECT 
                    n.ano_mes as month,
                    sum(n.novos_cnpjs) as natalidade,
                    sum(m.empresas_baixadas) as mortalidade
                FROM mv_natalidade_mensal n
                LEFT JOIN mv_mortalidade_mensal m ON n.ano_mes = m.ano_mes AND n.uf = m.uf
                GROUP BY month
                ORDER BY month ASC
                LIMIT 12`,
                {}
            )
        } else {
            result = await query<{ month: string; natalidade: number; mortalidade: number }>(
                QUERIES.TREND_CHART,
                { uf }
            )
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Trends API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
