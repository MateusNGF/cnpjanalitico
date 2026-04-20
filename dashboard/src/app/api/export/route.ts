import { NextResponse } from "next/server"
import { ExportService } from "@/services/export-service"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { sql, params } = body

        if (!sql) {
            return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
        }

        const jobId = await ExportService.createJob(sql, params || {})

        return NextResponse.json({
            jobId,
            message: "Export job started successfully"
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to start export job" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
        return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    const job = ExportService.getJob(jobId)

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
}
