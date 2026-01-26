import { cn } from "@/lib/utils"

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function PageContent({ children, className, ...props }: PageContentProps) {
    return (
        <div
            className={cn(
                "flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
