import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KpiCardProps {
    title: string
    value: string
    percentage: number
    trendDescription: string
    trend: "up" | "down" | "neutral"
    loading?: boolean
}

export function KpiCard({ title, value, percentage, trendDescription, trend, loading = false }: KpiCardProps) {
    if (loading) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-5 w-[60px] rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[160px]" />
                </CardContent>
            </Card>
        )
    }

    const isPositive = percentage > 0;
    const isNeutral = percentage === 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium tracking-tight text-muted-foreground">{title}</CardTitle>
                <div className={`flex items-center text-xs font-semibold rounded-full px-2.5 py-0.5 ${isNeutral ? "bg-gray-100/80 text-gray-600" :
                        isPositive ? "bg-emerald-100/80 text-emerald-700" : "bg-rose-100/80 text-rose-700"
                    }`}>
                    {isNeutral ? <Minus className="h-3 w-3 mr-1" /> : (isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />)}
                    {Math.abs(percentage)}%
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 flex items-center gap-1 opacity-80">
                    {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                    {trend === "down" && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                    <span className="uppercase tracking-wider">{trendDescription}</span>
                </p>
            </CardContent>
        </Card>
    )
}
