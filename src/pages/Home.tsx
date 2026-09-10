import { GameCard } from "../components/GameCard";

const GAMES = [
  { id: "word-chain", t: "سلسلة الكلمات", d: "تعاونوا لتكوين كلمات عربية", e: "🔤", g: "from-violet-600 to-indigo-800" },
  { id: "drawing-relay", t: "رسم بالتناوب", d: "واحد يرسم والآخر يخمن", e: "🎨", g: "from-cyan-500 to-blue-700" },
  { id: "maze-runner", t: "لعبة المتاهة", d: "المضيف يوجّه والمتحرك يمشي", e: "🏰", g: "from-amber-500 to-orange-700" },
  { id: "color-match", t: "تطابق الألوان", d: "اكتشفوا الأزواج المتطابقة", e: "🎯", g: "from-pink-500 to-rose-700" },
  { id: "simon-says", t: "سايمون يقول", d: "انسخوا التسلسل المتزايد", e: "🧠", g: "from-emerald-500 to-teal-700" },
  { id: "seen-jeem", t: "سين جيم", d: "أسئلة لفريقين — المضيف يعرض القيم", e: "🧩", g: "from-amber-500 to-orange-700" },
];

export function Home({ onSelectGame }: { onSelectGame: (g: string) => void }) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <div className="mb-3 flex items-center justify-center gap-4 text-5xl">
          <span className="animate-float opacity-60">🎮</span>
          <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-l from-violet-400 via-cyan-400 to-amber-400 drop-shadow-[0_0_25px_rgba(139,92,246,.35)]">coop-ar</h1>
          <span className="animate-float opacity-60" style={{ animationDelay: "-1.5s" }}>🕹️</span>
        </div>
        <p className="text-xl text-slate-400">6 ألعاب تعاونية — اختر لعبة وادخل غرفة</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => <GameCard key={g.id} title={g.t} description={g.d} emoji={g.e} gradient={g.g} onClick={() => onSelectGame(g.id)} />)}
      </div>
    </div>
  );
}
