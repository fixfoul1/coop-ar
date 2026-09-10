const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function ColorMatch({ state, broadcast, pc }: Props) {
  const me = pc.playerIdx;
  const len = Math.max(1, (pc.players || []).length);

  const startGame = () => {
    const size = 4;
    const grid: string[] = [];
    for (let i = 0; i < size * size; i++) grid.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    broadcast({ phase: "playing", grid, revealed: new Array(grid.length).fill(false), matched: new Array(grid.length).fill(false), turn: 0, scores: new Array(len).fill(0), message: "ابحث عن الأزواج", resolveTick: 0 });
  };

  const flip = (idx: number) => {
    if (!state || me !== state.turn || me === -1 || state.matched[idx] || state.revealed[idx]) return;
    const already = state.revealed.filter((v: boolean) => v).length;
    if (already >= 2) return;

    const revealed = [...state.revealed]; revealed[idx] = true;
    const open = revealed.map((v, i) => (v && !state.matched[i] ? i : -1)).filter((i) => i !== -1);

    if (open.length < 2) {
      broadcast({ ...state, revealed });
      return;
    }

    const [a, b] = open;
    if (state.grid[a] === state.grid[b]) {
      const matched = [...state.matched]; matched[a] = true; matched[b] = true;
      const scores = [...(state.scores || [])]; scores[me] += 10;
      const done = matched.every(Boolean);
      broadcast({ ...state, matched, scores, turn: done ? state.turn : (state.turn + 1) % len, revealed, message: done ? "🎉 اللوحة اكتملت!" : `✅ تطابق! +10 — الدور لـ ${pc.players?.[(state.turn + 1) % len]?.name || ""}` });
    } else {
      setTimeout(() => {
        const revealed = state.revealed.map((v: boolean, i: number) => (i === a || i === b ? false : v));
        broadcast({ ...state, revealed, turn: (state.turn + 1) % len, message: `❌ مو مطابق — الدور لـ ${pc.players?.[(state.turn + 1) % len]?.name || ""}` });
      }, 700);
    }
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🎯</div><h2 className="text-2xl font-bold text-pink-300">تطابق الألوان</h2></div>
        <p className="text-center text-sm text-slate-400">اللعب بالتناوب — اقلب زوجين متشابهين</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-pink-600 to-rose-600 px-6 py-4 font-bold text-white shadow-lg shadow-pink-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-pink-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  const currentName = pc.players?.[state.turn]?.name || `لاعب ${state.turn + 1}`;
  const myTurn = me === state.turn && me !== -1;

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">الدور: </span><span className={`font-bold ${myTurn ? "text-amber-400" : "text-violet-300"}`}>{currentName}{myTurn ? " (أنت) ⚡" : ""}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⭐ النقاط: </span><span className="font-bold text-pink-400">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className="grid grid-cols-4 gap-2">{state.grid?.map((color: string, i: number) => (
        <button key={i} onClick={() => flip(i)} disabled={!myTurn || state.matched[i] || state.revealed[i]} className={`aspect-square rounded-xl border-2 transition-all ${state.matched[i] ? "opacity-50 cursor-not-allowed" : state.revealed[i] ? "scale-105 cursor-not-allowed" : myTurn ? "cursor-pointer hover:scale-105 hover:border-white/30" : "cursor-not-allowed opacity-70"}`} style={{ backgroundColor: state.revealed[i] ? color : "#1e293b", borderColor: state.revealed[i] ? color : "#334155" }}>
          {state.matched[i] && <span className="text-2xl">✅</span>}
        </button>
      ))}</div>
      {state.matched?.every(Boolean) && (
        <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">🔁 إعادة اللعب</button>
      )}
      {state.message && !state.matched?.every(Boolean) && <div className="rounded-xl px-4 py-2 text-sm font-bold bg-white/5 text-slate-300">{state.message}</div>}
    </div>
  );
}