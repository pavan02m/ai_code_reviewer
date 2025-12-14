import React from 'react';
import {SidebarProvider, SidebarTrigger, SidebarInset} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import App from "next/app";


const DashboardLayout = ({children}:{children:React.ReactNode}) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-20 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1 cursor-pointer"/>
                    <Separator  className="mx-4 h-4" orientation="vertical"/>
                    <h1 className="text-xl font-semibold text-foreground">
                        Dashboard
                    </h1>
                </header>
                {/*overflow-auto*/}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;