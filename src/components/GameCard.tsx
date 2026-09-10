interface Props { title: string; description: string; emoji: string; gradient: string; onClick: () => void; }

export function GameCard({ title, description, emoji, gradient, onClick }: Props) {
  return (
    <button onClick={onClick} className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 p-6 text-right transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-2xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
      <div className="relative">
        <div className="mb-4 text-5xl animate-float">{emoji}</div>
        <h3 className="mb-2 text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-300">{description}</p>
      </div>
    </button>
  );
}
