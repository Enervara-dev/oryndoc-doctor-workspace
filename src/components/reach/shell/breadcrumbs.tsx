"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

/** The page title already names the section; the top bar names the product context. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const current = navItems.find((item) => pathname.startsWith(item.href));
  const detail = current && pathname.length > current.href.length + 1;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm">
      <ol className="flex min-w-0 items-center gap-1.5 text-text-tertiary">
        <li className="hidden font-medium sm:block">Reach</li>
        {current && (
          <>
            <li aria-hidden="true" className="hidden sm:block">
              /
            </li>
            <li className="truncate font-medium text-text-primary">
              {detail ? (
                <Link prefetch={false} href={current.href} className="focus-ring rounded-xs hover:underline">
                  {current.label}
                </Link>
              ) : (
                <span aria-current="page">{current.label}</span>
              )}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
