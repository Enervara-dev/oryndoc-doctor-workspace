"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNav } from "./nav-items";
import { useWorkspace } from "./workspace-context";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ClinicMark({ name, logoInitial }: { name: string; logoInitial: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand text-sm font-bold text-text-inverted"
      title={name}
    >
      {logoInitial}
    </span>
  );
}

export function WorkspaceNavList({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navItems = useWorkspaceNav();
  return (
    <ul className="space-y-0.5">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              prefetch={false}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "focus-ring group relative flex h-9 items-center gap-2.5 rounded-sm px-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-subtle text-brand-text before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
                  : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon
                aria-hidden="true"
                strokeWidth={1.75}
                className={cn(
                  "size-[18px] shrink-0",
                  isActive ? "text-brand" : "text-text-tertiary group-hover:text-text-secondary",
                )}
              />
              {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { clinic } = useWorkspace();

  return (
    <aside
      aria-label="Workspace"
      className={cn(
        "relative hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-[var(--od-ease)] lg:flex",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2.5 border-b border-border", collapsed ? "justify-center px-2" : "px-4")}>
        <ClinicMark name={clinic.name} logoInitial={clinic.logoInitial} />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-text-primary">{clinic.name}</p>
            <p className="text-xs leading-tight text-text-tertiary">Reach</p>
          </div>
        )}
      </div>

      <nav aria-label="Reach sections" className="scroll-thin flex-1 overflow-y-auto px-2.5 py-3">
        <WorkspaceNavList collapsed={collapsed} />
      </nav>

      <div className="space-y-0.5 border-t border-border p-2.5">
        <Link
          prefetch={false}
          href="/"
          className={cn(
            "focus-ring flex h-9 items-center gap-2.5 rounded-sm px-2.5 text-sm font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "All products" : undefined}
        >
          <LayoutGrid aria-hidden="true" strokeWidth={1.75} className="size-[18px] shrink-0 text-text-tertiary" />
          {collapsed ? <span className="sr-only">All products</span> : <span>All products</span>}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className={cn(
            "focus-ring flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-sm font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronsLeft
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn("size-[18px] shrink-0 text-text-tertiary transition-transform", collapsed && "rotate-180")}
          />
          {collapsed ? <span className="sr-only">Expand sidebar</span> : <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
