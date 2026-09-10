import { GameCard } from "../components/GameCard";

interface HomeProps {
  onSelectGame: (game: string) => void;
}

const GAMES = [
  {
    id: "word-chain",
    title: "سلسلة الكلمات",
    description: "تعاونوا لتكوين كلمات عربية من الحروف المتاحة. واحد يقترح والآخر يؤكد!",
    emoji: "🔤",
    gradient: "bg-gradient-to-br from-violet-600 to-indigo-800",
  },
  {
    id: "drawing-relay",
    title: "رسم بالتناوب",
    description: "واحد يرسم ملاحظة والآخر يخمن ثم يرسم تخمينه — كرروا 3 مرات!",
    emoji: "🎨",
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-700",
  },
  {
    id: "maze-runner",
    title: "لعبة المتاهة",
    description: "L1 يرى الخريطة — L2 يتحرك. وجّهوا بعضكم للوصول للنهاية!",
    emoji: "🏰",
    gradient: "bg-gradient-to-br from-amber-500 to-orange-700",
  },
];

export function Home({ onSelectGame }: HomeProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-violet-400 via-cyan-400 to-amber-400">
          coop-ar
        </h1>
        <p className="text-lg text-slate-400">3 ألعاب صغيرة للعب مع صديقك عبر الإنترنت</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            emoji={game.emoji}
            gradient={game.gradient}
            onClick={() => onSelectGame(game.id)}
          />
        ))}
      </div>
    </div>
  );
}
