const SIMON_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

function genSeq(round: number = 1): number[] { const len = Math.min(2 + round, 8); const arr: number[] = []; for (let i = 0; i < len; i++) arr.push(Math.floor(Math.random() * 4)); return arr; }

function flashColor(idx: number) { const el = document.getElementById(`simon-${idx}`); if (el) { el.style.opacity = "1"; el.style.transform = "scale(1.15)"; setTimeout(() => { el.style.opacity = "0.6"; el.style.transform = "scale(1)"; }, 600); } }

export function SimonSays({ state, broadcast, pc }: Props) {
  const isHost = pc.isHost;

  const showSequence = (s: any) => {
    broadcast({ ...s, roundActive: true, currentColor: -1, message: "انسخ التسلسل!" });
    s.sequence.forEach((c: number, i: number) => { setTimeout(() => { flashColor(c); broadcast({ ...s, roundActive: true, currentColor: c }); }, (i + 1) * 700); });
    setTimeout(() => broadcast({ ...s, roundActive: true, currentColor: -1, message: "دورك!" }), (s.sequence.length + 1) * 700);
  };

  const startGame = () => {
    const seq = genSeq();
    const base = { phase: "playing", sequence: seq, playerInput: [], round: 1, maxRounds: 5, scores: new Array(pc.players.length).fill(0), roundActive: false, currentColor: -1, message: "انتظر..." };
    broadcast(base);
    setTimeout(() => showSequence(base), 1200);
  };

  const clickColor = (idx: number) => {
    if (!state || !state.roundActive || state.phase === "result") return;
    const input = [...(state.playerInput || []), idx];
    const seq = state.sequence;
    if (input[input.length - 1] !== seq[input.length - 1]) { broadcast({ ...state, phase: "result", message: "❌ خطأ!", won: false }); return; }
    if (input.length < seq.length) { broadcast({ ...state, playerInput: input, message: `✅ ${input.length}/${seq.length}` }); return; }
    const scores = [...(state.scores || [])]; scores[pc.playerIdx] += 10;
    const nextRound = state.round + 1;
    broadcast({ ...state, scores, round: nextRound, playerInput: [], roundActive: false, message: "✅ صحيح! +10" });
    if (nextRound > state.maxRounds) { setTimeout(() => broadcast({ ...state, scores, phase: "result", message: "فوز! 🎉", won: true }), 1500); }
    else {
      setTimeout(() => { const ns = genSeq(nextRound); const base = { ...state, scores, round: nextRound, sequence: ns, playerInput: [], roundActive: false, currentColor: -1, message: "انتظر..." }; broadcast(base); setTimeout(() => showSequence(base), 1200); }, 1200);
    }
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🧠</div><h2 className="text-2xl font-bold text-emerald-300">سايمون يقول</h2></div>
        <p className="text-center text-sm text-slate-400">انسخوا التسلسل المتزايد من الألوان</p>
        {isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-emerald-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-400">{state.won ? "فوز! 🎉" : "انتهت اللعبة!"}</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm text-slate-400">النتيجة</p><p className="my-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-500">{state.scores?.join(" - ") || "0"}</p></div>
        {isHost && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">إعادة اللعب</button>}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">الجولة: </span><span className="font-bold text-emerald-400">{state.round}/{state.maxRounds}</span></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">النقاط: </span><span className="font-bold text-amber-400">{state.scores?.join(", ") || 0}</span></div></div>
      <div className="flex gap-4">{SIMON_COLORS.map((color, i) => (
        <button key={i} id={`simon-${i}`} onClick={() => clickColor(i)} disabled={!state.roundActive} className={`h-20 w-20 cursor-pointer rounded-full border-4 transition-all opacity-60 ${!state.roundActive ? "cursor-not-allowed opacity-40" : ""}`} style={{ backgroundColor: color, borderColor: color }} />
      ))}</div>
      {state.message && <div className="rounded-xl px-4 py-3 text-center text-sm font-bold bg-emerald-500/10 text-emerald-400">{state.message}</div>}
    </div>
  );
}