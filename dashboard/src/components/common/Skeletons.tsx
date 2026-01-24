import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SummarySkeleton() {
    return (
        <div className="grid gap-[var(--section-gap)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <Card className="border-primary/5">
            <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[350px] pt-4 flex items-end gap-2">
                {[...Array(12)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1"
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="rounded-lg border">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton({ items = 10 }: { items?: number }) {
    return (
        <Card className="border-primary/5">
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {[...Array(items)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
