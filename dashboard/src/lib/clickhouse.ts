import { createClient } from '@clickhouse/client'

const host = process.env.CH_HOST || 'http://localhost:8123'
const user = process.env.CH_USER || 'default'
const password = process.env.CH_PASSWORD || ''
const database = process.env.CH_DATABASE || 'default'

export const clickhouse = createClient({
    url: host,
    username: user,
    password: password,
    database: database,
    request_timeout: 60000, // 60s timeout for HTTP requests
    clickhouse_settings: {
        wait_end_of_query: 1,
        max_execution_time: 60, // 60s query execution limit
    },
})

export async function query<T>(queryString: string, params: Record<string, unknown> = {}) {
    const resultSet = await clickhouse.query({
        query: queryString,
        query_params: params,
        format: 'JSONEachRow',
    })

    return resultSet.json<T>()
}
