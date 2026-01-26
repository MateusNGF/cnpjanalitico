
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardProvider } from "@/components/dashboard-context"
import { DashboardHeader } from "@/components/dashboard-header"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <DashboardHeader />
                    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </DashboardProvider>
    )
}

