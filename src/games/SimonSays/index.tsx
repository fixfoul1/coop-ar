const SIMON_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

function genSeq(round: number = 1): number[] { const len = Math.min(2 + round, 8); const arr: number[] = []; for (let i = 0; i < len; i++) arr.push(Math.floor(Math.random() * 4)); return arr; }

function flashColor(idx: number) { const el = document.getElementById(`simon-${idx}`); if (el) { el.style.opacity = "1"; el.style.transform = "scale(1.15)"; setTimeout(() => { el.style.opacity = "0.6"; el.style.transform = "scale(1)"; }, 600); } }

export function SimonSays({ state, broadcast, pc }: Props) {
  const len = Math.max(1, (pc.players || []).length);
  const me = pc.playerIdx;

  const showSequence = (s: any) => {
    broadcast({ ...s, roundActive: false, currentColor: -1, input: [], message: "👀 شاهد التسلسل..." });
    s.sequence.forEach((c: number, i: number) => { setTimeout(() => flashColor(c), (i + 1) * 700); });
    setTimeout(() => broadcast({ ...s, roundActive: true, input: [], currentColor: -1, message: `⚡ دور ${pc.players?.[s.turn]?.name || ""} — كرر التسلسل!` }), (s.sequence.length + 1) * 700);
  };

  const startGame = () => {
    const seq = genSeq();
    const base = { phase: "playing", sequence: seq, input: [], turn: 0, round: 1, maxRounds: 5, scores: new Array(len).fill(0), roundActive: false, currentColor: -1, message: "انتظر..." };
    broadcast(base);
    setTimeout(() => showSequence(base), 1200);
  };

  const clickColor = (idx: number) => {
    if (!state || me !== state.turn || me === -1 || !state.roundActive || state.phase === "result") return;
    const input = [...(state.input || []), idx];
    const seq = state.sequence;

    if (input[input.length - 1] !== seq[input.length - 1]) {
      broadcast({ ...state, phase: "result", message: `❌ أخطأ ${pc.players?.[state.turn]?.name || "لاعب"} — النتيجة النهائية`, won: false });
      return;
    }
    if (input.length < seq.length) {
      broadcast({ ...state, input, message: `✅ ${input.length}/${seq.length}` });
      return;
    }
    const scores = [...(state.scores || [])]; while (scores.length <= state.turn) scores.push(0);
    scores[state.turn] += 10;
    const turn = (state.turn + 1) % len;
    const nextRound = state.round + 1;
    broadcast({ ...state, scores, turn, input: [], roundActive: false, message: `✅ ${pc.players?.[state.turn]?.name || ""} نجح! +10` });
    if (nextRound > state.maxRounds) { setTimeout(() => broadcast({ ...state, scores, phase: "result", message: "فوز الجميع! 🎉", won: true }), 1500); }
    else { setTimeout(() => { const ns = genSeq(nextRound); const base = { ...state, scores, turn, round: nextRound, sequence: ns, input: [], roundActive: false, currentColor: -1, message: "انتظر..." }; broadcast(base); setTimeout(() => showSequence(base), 1200); }, 1200); }
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-2 right-4 text-4xl animate-float opacity-25 select-none">🧠</span>
          <span className="absolute bottom-4 left-5 text-4xl animate-float opacity-25 select-none" style={{ animationDelay: "-1.5s" }}>🔴</span>
          <span className="absolute top-1/2 left-8 text-3xl animate-spin-slow opacity-15 select-none">🟢</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl" />
        </div>
        <div className="text-center relative"><div className="mb-2 text-6xl animate-pop">🧠</div><h2 className="text-3xl font-bold text-emerald-300">سايمون يقول</h2></div>
        <p className="text-center text-base text-slate-400">كل لاعب يحفظ التسلسل ويكرره في دوره</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-emerald-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-3 left-6 text-4xl animate-float opacity-25 select-none">🏆</span>
          <span className="absolute bottom-5 right-5 text-4xl animate-spin-slow opacity-20 select-none">✨</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-400">{state.won ? "فوز! 🎉" : "انتهت اللعبة!"}</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm text-slate-400">النتيجة</p><p className="my-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-500">{state.scores?.join(" - ") || "0"}</p></div>
        {pc.isHost && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">إعادة اللعب</button>}
      </div>
    );
  }

  const currentName = pc.players?.[state.turn]?.name || `لاعب ${state.turn + 1}`;
  const myTurn = me === state.turn && me !== -1;

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-2 right-3 text-3xl animate-float opacity-20 select-none">🧠</span>
        <span className="absolute bottom-12 left-2 text-3xl animate-spin-slow opacity-15 select-none">✦</span>
        <span className="absolute top-24 left-6 text-2xl animate-float opacity-15 select-none" style={{ animationDelay: "-2s" }}>🔵</span>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-teal-500/10 blur-2xl" />
      </div>
      <div className="flex gap-4 relative">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">الدور: </span><span className={`text-base font-bold ${myTurn ? "text-amber-400" : "text-violet-300"}`}>{currentName}{myTurn ? " (أنت) ⚡" : ""}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">الجولة: </span><span className="text-base font-bold text-emerald-400">{state.round}/{state.maxRounds}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">⭐ النقاط: </span><span className="text-base font-bold text-amber-400">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className="flex gap-5">{SIMON_COLORS.map((color, i) => (
        <button key={i} id={`simon-${i}`} onClick={() => clickColor(i)} disabled={!myTurn || !state.roundActive} className={`h-28 w-28 rounded-full border-8 transition-all opacity-60 shadow-lg hover:scale-105 active:scale-95 ${!myTurn || !state.roundActive ? "cursor-not-allowed opacity-40" : ""}`} style={{ backgroundColor: color, borderColor: color }} />
      ))}</div>
      {state.message && <div className="rounded-xl px-4 py-3 text-center text-base font-bold bg-white/5 text-slate-300">{state.message}</div>}
    </div>
  );
}