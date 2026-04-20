import { cn } from "@/lib/utils"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface PageHeaderProps {
    title: string
    description?: string
    icon?: React.ReactNode
    breadcrumbs?: BreadcrumbItem[]
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    icon,
    breadcrumbs,
    actions,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 pb-4 md:pb-8", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Link href="/" className="hover:text-primary transition-colors">
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                    {breadcrumbs.map((item, index) => (
                        <div key={item.label} className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            {item.href ? (
                                <Link href={item.href} className="hover:text-primary transition-colors font-medium">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={cn(
                                    "font-medium",
                                    index === breadcrumbs.length - 1 ? "text-foreground font-bold" : ""
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                                {icon}
                            </div>
                        )}
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                            {title}
                        </h1>
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground w-full max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
