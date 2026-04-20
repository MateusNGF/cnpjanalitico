import { NextResponse } from "next/server"
import { clickhouse } from "@/lib/clickhouse"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check core connectivity
        const startTime = Date.now()
        await clickhouse.query({ query: 'SELECT 1', format: 'JSONEachRow' })
        const latency = Date.now() - startTime

        // Check MV status - using system.table_log (if available) or simply checking if they exist
        const mvStatus = await clickhouse.query({
            query: `
                SELECT 
                    name, 
                    engine, 
                    total_rows,
                    total_bytes
                FROM system.tables 
                WHERE database = {db:String} AND engine LIKE '%MaterializedView%'
            `,
            query_params: { db: process.env.CH_DATABASE || 'cnpj_analytics' },
            format: 'JSONEachRow'
        })
        const views = await mvStatus.json()

        return NextResponse.json({
            status: "healthy",
            latency_ms: latency,
            database: "connected",
            views_monitored: views.length,
            view_details: views,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error("Healthcheck Error:", error)
        return NextResponse.json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Connection failed",
            timestamp: new Date().toISOString()
        }, { status: 503 })
    }
}
