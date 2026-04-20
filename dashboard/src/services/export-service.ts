import { clickhouse } from "@/lib/clickhouse"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Simulação de um worker para exportação assíncrona
// Em produção, isso usaria Redis + BullMQ ou similar.

export type ExportJob = {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    url?: string
    error?: string
    createdAt: Date
}

const jobs = new Map<string, ExportJob>()

export class ExportService {
    static async createJob(query: string, params: Record<string, any>): Promise<string> {
        const id = uuidv4()
        const job: ExportJob = {
            id,
            status: 'pending',
            progress: 0,
            createdAt: new Date()
        }
        jobs.set(id, job)

        // Inicia o processamento "em background"
        this.processJob(id, query, params)

        return id
    }

    private static async processJob(id: string, query: string, params: Record<string, any>) {
        const job = jobs.get(id)
        if (!job) return

        try {
            job.status = 'processing'
            job.progress = 10

            const resultSet = await clickhouse.query({
                query,
                query_params: params,
                format: 'CSVWithNames'
            })

            const stream = resultSet.stream()
            const filename = `export_${id}.csv`
            const exportDir = path.join(process.cwd(), 'public', 'exports')
            
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true })
            }

            const filePath = path.join(exportDir, filename)
            const fileStream = fs.createWriteStream(filePath)

            // Pipe the data to the file
            // Note: This is simplified. For large data, we'd handle backpressure.
            for await (const chunk of stream) {
                fileStream.write(chunk)
            }
            fileStream.end()

            job.status = 'completed'
            job.progress = 100
            job.url = `/exports/${filename}`

        } catch (error) {
            console.error("Export Error:", error)
            job.status = 'failed'
            job.error = error instanceof Error ? error.message : "Simulated export failure"
        }
    }

    static getJob(id: string): ExportJob | undefined {
        return jobs.get(id)
    }
}
