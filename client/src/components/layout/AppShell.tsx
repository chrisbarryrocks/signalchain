import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
}

export function AppShell({ header, sidebar, main }: AppShellProps) {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)] text-slate-100"
    >
      {/* Top bar — no box, just the nav row */}
      <div className="shrink-0 px-5 pt-4 sm:px-6">
        {header}
      </div>

      {/* Two-column workspace — fills remaining height */}
      <div className="mt-3 grid min-h-0 flex-1 gap-3 px-5 pb-5 sm:px-6 sm:pb-6
        lg:grid-cols-[minmax(268px,21vw)_minmax(0,1fr)] lg:gap-4">

        {/* Sidebar — independent scroll */}
        <aside
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl
            bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">
            {sidebar}
          </div>
        </aside>

        {/* Main workspace — independent scroll */}
        <main
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl
            bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {main}
          </div>
        </main>
      </div>
    </div>
  );
}
