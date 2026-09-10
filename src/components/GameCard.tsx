interface Props { title: string; description: string; emoji: string; gradient: string; onClick: () => void; }

export function GameCard({ title, description, emoji, gradient, onClick }: Props) {
  return (
    <button onClick={onClick} className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 p-8 text-right transition-all duration-300 hover:scale-[1.04] hover:border-white/25 hover:shadow-2xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-xl animate-float opacity-40 select-none">✦</span>
        <span className="absolute bottom-5 left-10 text-xl animate-spin-slow opacity-30 select-none">✦</span>
      </div>
      <div className="relative">
        <div className="mb-5 text-7xl animate-float drop-shadow-lg">{emoji}</div>
        <h3 className="mb-2 text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">{title}</h3>
        <p className="text-base leading-relaxed text-slate-200">{description}</p>
      </div>
    </button>
  );
}
