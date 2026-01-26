
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface KpiCardProps {
    title: string
    value: string
    percentage: number
    trendDescription: string
    trend: "up" | "down" | "neutral"
}

export function KpiCard({ title, value, percentage, trendDescription, trend }: KpiCardProps) {
    const isPositive = percentage > 0;
    const isNeutral = percentage === 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${isNeutral ? "bg-gray-100 text-gray-600" :
                        isPositive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    }`}>
                    {isNeutral ? <Minus className="h-3 w-3 mr-1" /> : (isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />)}
                    {Math.abs(percentage)}%
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                    {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                    {trendDescription}
                </p>
            </CardContent>
        </Card>
    )
}
