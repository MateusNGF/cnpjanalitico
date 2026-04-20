
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

import { GlobalLoading } from "@/components/layout/global-loading"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <GlobalLoading />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col h-screen overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
                        <div className="flex flex-1 flex-col gap-6 p-6 pt-2">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

