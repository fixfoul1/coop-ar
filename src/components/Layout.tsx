import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="group flex items-center gap-3 no-underline">
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-violet-400 via-cyan-400 to-amber-400">
              coop-ar
            </span>
          </a>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-xs text-slate-400">co-op</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
