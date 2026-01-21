"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
    children: ReactNode;
    className?: string;
    animate?: boolean;
}

export function PageContent({
    children,
    className,
    animate = true
}: PageContentProps) {
    return (
        <div
            className={cn(
                "flex flex-col w-full mx-auto",
                "p-[var(--content-padding)] gap-[var(--section-gap)] max-w-[var(--container-width)]",
                animate && "animate-in fade-in slide-in-from-bottom-4 duration-700",
                className
            )}
        >
            {children}
        </div>
    );
}
