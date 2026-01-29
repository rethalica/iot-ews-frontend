"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Client-side header component containing interactive elements.
 * Extracted from dashboard layout to allow the layout to remain a Server Component.
 */
export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>
      <ModeToggle />
    </header>
  );
}
