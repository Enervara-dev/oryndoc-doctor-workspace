"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from "./workspace-context";

export function AppShell({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: WorkspaceContextValue;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="flex h-full bg-surface-subtle">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <MobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main id="main-content" tabIndex={-1} className="scroll-thin flex-1 overflow-y-auto outline-none">
            <div className="w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
