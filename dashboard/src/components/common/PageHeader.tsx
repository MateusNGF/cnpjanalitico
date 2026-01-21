"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: ReactNode;
    icon?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions, icon }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 mb-8 group">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.label} className="flex items-center gap-1.5">
                            {index > 0 && <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="hover:text-primary transition-colors cursor-pointer hover:opacity-100"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground/90">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                                {icon}
                            </div>
                        )}
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent sm:text-4xl">
                            {title}
                        </h1>
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                        {actions}
                    </div>
                )}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-primary/20 via-primary/5 to-transparent mt-2 opacity-50" />
        </div>
    );
}
