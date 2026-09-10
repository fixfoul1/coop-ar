import type { ReactNode } from "react";

interface Props { children: ReactNode; }

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl animate-blob" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl animate-blob" style={{ animationDelay: "-9s" }} />
        <span className="absolute top-24 left-[12%] text-4xl animate-float opacity-30 select-none">✨</span>
        <span className="absolute bottom-16 right-[10%] text-5xl animate-float opacity-30 select-none" style={{ animationDelay: "-1.5s" }}>⭐</span>
        <span className="absolute top-1/2 right-[8%] text-4xl animate-spin-slow opacity-20 select-none">🔷</span>
        <span className="absolute top-16 right-[30%] text-3xl animate-float opacity-20 select-none" style={{ animationDelay: "-2.5s" }}>🟢</span>
        <span className="absolute bottom-1/3 left-[6%] text-3xl animate-spin-slow opacity-20 select-none">🟠</span>
        <span className="absolute top-2/3 right-[38%] text-4xl animate-float opacity-20 select-none" style={{ animationDelay: "-4s" }}>🔶</span>
      </div>
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="./" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-violet-400 via-cyan-400 to-amber-400 no-underline">coop-ar</a>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-sm text-slate-400">co-op</span></div>
        </div>
      </header>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">{children}</main>
    </div>
  );
}
