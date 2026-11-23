"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Drawer } from "@/components/ui";
import { WorkspaceNavList } from "./sidebar";
import { useWorkspace } from "./workspace-context";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { clinic } = useWorkspace();
  return (
    <Drawer open={open} onClose={onClose} title={clinic.name} description="Reach" side="left" widthClassName="max-w-[18rem]">
      <nav aria-label="Reach sections" className="-mx-2.5">
        <WorkspaceNavList onNavigate={onClose} />
        <div className="mt-3 border-t border-border pt-3">
          <Link
            prefetch={false}
            href="/"
            onClick={onClose}
            className="focus-ring flex h-10 items-center gap-2.5 rounded-sm px-2.5 text-sm font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
          >
            <LayoutGrid aria-hidden="true" strokeWidth={1.75} className="size-[18px] text-text-tertiary" />
            All products
          </Link>
        </div>
      </nav>
    </Drawer>
  );
}
