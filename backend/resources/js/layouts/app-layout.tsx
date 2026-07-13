import { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-0 mx-auto w-full max-w-7xl">
                    {children}
                </div>
                <Toaster position="bottom-right" />
            </SidebarInset>
        </SidebarProvider>
    );
}
