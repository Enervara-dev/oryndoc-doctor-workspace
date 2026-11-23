"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftRight, ChevronDown, LogOut, Menu } from "lucide-react";
import { Avatar, Popover } from "@/components/ui";
import { nameFromEmail, rolesLabel } from "@/lib/labels";
import { Breadcrumbs } from "./breadcrumbs";
import { useWorkspace } from "./workspace-context";

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { email, roles, clinic } = useWorkspace();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = nameFromEmail(email);
  const role = rolesLabel(roles);

  async function signOut() {
    setSigningOut(true);
    const r = await fetch("/api/auth/logout", { method: "POST" });
    // Discard cached clinical views when the browser session ends.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (r.status !== 403) window.location.assign("/login");
    else setSigningOut(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
          className="focus-ring flex size-10 items-center justify-center rounded-sm text-text-secondary hover:bg-surface-sunken lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <Breadcrumbs />
      </div>

      <Popover
        align="right"
        panelClassName="w-72 p-1.5"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="true"
            className="focus-ring flex items-center gap-2.5 rounded-sm py-1 pr-1.5 pl-1 hover:bg-surface-sunken"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[14rem] truncate text-sm font-medium leading-tight text-text-primary">
                {displayName}
              </span>
              <span className="block max-w-[14rem] truncate text-xs leading-tight text-text-tertiary">{role}</span>
            </span>
            <ChevronDown className="size-4 text-text-tertiary" aria-hidden="true" />
            <span className="sr-only">Account menu</span>
          </button>
        )}
      >
        <div className="border-b border-border px-3 pt-2 pb-3">
          <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
          <p className="truncate text-[13px] text-text-secondary">{email}</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
            <dt className="text-text-tertiary">Role</dt>
            <dd className="truncate text-text-primary">{role}</dd>
            <dt className="text-text-tertiary">Clinic</dt>
            <dd className="truncate text-text-primary">{clinic.name}</dd>
          </dl>
        </div>
        <ul className="pt-1.5">
          <li>
            <Link
              prefetch={false}
              href="/choose-clinic"
              className="focus-ring flex h-9 items-center gap-2.5 rounded-sm px-3 text-sm text-text-primary hover:bg-surface-sunken"
            >
              <ArrowLeftRight className="size-4 text-text-tertiary" aria-hidden="true" />
              Switch clinic
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="focus-ring flex h-9 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm text-text-primary hover:bg-surface-sunken disabled:opacity-60"
            >
              <LogOut className="size-4 text-text-tertiary" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </li>
        </ul>
      </Popover>
    </header>
  );
}
