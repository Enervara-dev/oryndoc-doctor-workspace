import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";

/** Centered single-task layout for sign-in and clinic selection. */
export function AuthShell({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-subtle">
      <header className="px-5 py-5 sm:px-8">
        <Wordmark product="Workspace" />
      </header>
      <main id="main-content" className="flex flex-1 items-start justify-center px-4 pt-[6vh] pb-12 sm:items-center sm:pt-0">
        <div className="w-full max-w-[26rem]">
          <h1 className="text-2xl leading-tight font-semibold text-text-primary">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-text-secondary">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <footer className="px-5 py-5 text-xs text-text-tertiary sm:px-8">© {new Date().getFullYear()} Oryndoc</footer>
    </div>
  );
}
