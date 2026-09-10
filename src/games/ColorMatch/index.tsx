const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function ColorMatch({ state, broadcast, pc }: Props) {
  const startGame = () => {
    const sz = 4; const grid: string[] = [];
    for (let i = 0; i < sz * sz; i++) grid.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    broadcast({ phase: "playing", grid, revealed: new Array(grid.length).fill(false), matched: new Array(grid.length).fill(false), scores: new Array(pc.players.length).fill(0), timeLeft: 60, message: "" });
  };

  const reveal = (idx: number) => {
    if (!state || state.matched[idx] || state.revealed[idx]) return;
    const newRevealed = [...state.revealed]; newRevealed[idx] = true;
    const revealed = newRevealed.map((v: boolean, i: number) => v ? i : -1).filter((v: number) => v !== -1);
    let newMatched = [...state.matched]; let newScores = [...state.scores]; let message = "";
    if (revealed.length === 2 && state.grid[revealed[0]] === state.grid[revealed[1]]) {
      newMatched[revealed[0]] = true; newMatched[revealed[1]] = true;
      newScores[pc.playerIdx] += 10; message = "✅ تطابق! +" + 10;
    } else { message = "❌ حاول مرة أخرى"; }
    const finalRevealed = newRevealed.map((_v: boolean, i: number) => newMatched[i] ? true : false);
    setTimeout(() => broadcast({ ...state, revealed: finalRevealed, matched: newMatched, scores: newScores, message }), 800);
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🎯</div><h2 className="text-2xl font-bold text-pink-300">تطابق الألوان</h2></div>
        <p className="text-center text-sm text-slate-400">اكتشفوا الأزواج المتطابقة</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-pink-600 to-rose-600 px-6 py-4 font-bold text-white shadow-lg shadow-pink-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-pink-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⏱ الوقت: </span><span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>{state.timeLeft}</span></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⭐ النقاط: </span><span className="font-bold text-pink-400">{state.scores?.join(", ") || 0}</span></div></div>
      <div className="grid grid-cols-4 gap-2">{state.grid?.map((color: string, i: number) => (
        <button key={i} onClick={() => reveal(i)} disabled={state.matched[i] || !state.revealed[i]} className={`aspect-square cursor-pointer rounded-xl border-2 transition-all ${state.matched[i] ? "opacity-50" : state.revealed[i] ? "scale-105" : "hover:scale-105"}`} style={{ backgroundColor: state.revealed[i] ? color : "#1e293b", borderColor: state.revealed[i] ? color : "#334155" }}>
          {state.matched[i] && <span className="text-2xl">✅</span>}
        </button>
      ))}</div>
      {state.message && <div className="rounded-xl px-4 py-2 text-sm font-bold bg-emerald-500/10 text-emerald-400">{state.message}</div>}
    </div>
  );
}


