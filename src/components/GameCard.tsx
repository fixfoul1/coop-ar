interface Props { title: string; description: string; emoji: string; gradient: string; onClick: () => void; locked?: boolean; }

export function GameCard({ title, description, emoji, gradient, onClick, locked = false }: Props) {
  return (
    <button onClick={() => !locked && onClick()} disabled={locked}
      className={`group relative overflow-hidden rounded-3xl border p-8 text-right transition-all duration-300 bg-gradient-to-br ${gradient} bg-opacity-20 ${locked ? "cursor-not-allowed border-white/5 opacity-50 grayscale" : "cursor-pointer border-white/10 hover:scale-[1.04] hover:border-white/25 hover:shadow-2xl"}`}>
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-xl animate-float opacity-40 select-none">✦</span>
        <span className="absolute bottom-5 left-10 text-xl animate-spin-slow opacity-30 select-none">✦</span>
      </div>
      {locked && (
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <span className="rounded-full border border-red-500/50 bg-red-950/70 px-4 py-1 text-sm font-bold text-red-300 shadow-lg">🛠️ تحت الصيانة</span>
        </div>
      )}
      <div className="relative">
        <div className={`mb-5 text-7xl ${locked ? "grayscale" : "animate-float drop-shadow-lg"}`}>{emoji}</div>
        <h3 className="mb-2 text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">{title}</h3>
        <p className="text-base leading-relaxed text-slate-200">{description}</p>
      </div>
    </button>
  );
}