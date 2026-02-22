"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <DashboardSidebar
                mobileOpen={mobileNavOpen}
                onMobileClose={() => setMobileNavOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <DashboardTopbar onMenuClick={() => setMobileNavOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
                    <div className="max-w-screen-xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
