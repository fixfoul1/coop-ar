
const WORDS: Record<string, string[]> = { "فواكه": ["تفاح", "موز", "برتقال", "عنب", "مانجو", "فراولة", "بطيخ", "ليمون", "كرز"], "حيوانات": ["قطة", "كلب", "فيل", "أسد", "نمر", "حمار", "بقرة", "دجاجة", "سمكة"], "ألوان": ["أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "برتقالي", "بنفسجي"], "أشياء": ["كرة", "سيف", "كتاب", "قلم", "منضدة", "كرسي", "نافذة", "باب"] };

function genLetters(word: string, extra: number): string[] {
  const wl = [...new Set(word.split(""))]; const ex: string[] = []; const al = "أبترخضسشصطفكلمنهويوجدثذزس";
  while (ex.length < extra) { const r = al[Math.floor(Math.random() * al.length)]; if (!wl.includes(r) && !ex.includes(r)) ex.push(r); }
  const all = [...wl, ...ex];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function WordChain({ state, broadcast, pc }: Props) {
  const startGame = () => {
    const cats = Object.keys(WORDS); const cat = cats[Math.floor(Math.random() * cats.length)]; const word = WORDS[cat][Math.floor(Math.random() * WORDS[cat].length)];
    broadcast({ phase: "playing", category: cat, targetWord: word, letters: genLetters(word, 5), selectedIndices: [], currentWord: "", scores: new Array(pc.players.length).fill(0), round: 1, message: "", timeLeft: 90 });
  };
  const selectLetter = (idx: number) => {
    if (!state || state.selectedIndices.includes(idx)) return;
    const newSel = [...state.selectedIndices, idx];
    broadcast({ ...state, selectedIndices: newSel, currentWord: newSel.map((i: number) => state.letters[i]).join("") });
  };
  const submit = () => {
    if (!state?.currentWord) return;
    if (state.currentWord === state.targetWord) { const scores = [...(state.scores || []).fill(0)]; scores[pc.playerIdx] += 10; broadcast({ ...state, scores, message: "✅ صحيح! +10", round: state.round + 1, selectedIndices: [], currentWord: "" }); }
    else { broadcast({ ...state, message: "❌ خطأ!" }); }
  };
  const clearSel = () => broadcast({ ...state, selectedIndices: [], currentWord: "" });

  if (!state || state.phase === "lobby" || state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🔤</div><h2 className="text-2xl font-bold text-violet-300">سلسلة الكلمات</h2></div>
        <p className="text-center text-sm text-slate-400">تعاونوا لتكوين كلمات عربية</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-violet-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⏱ الوقت: </span><span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400" : "text-emerald-400"}`}>{state.timeLeft || 90}</span></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⭐ النقاط: </span><span className="font-bold text-amber-400">{state.scores?.join(", ") || 0}</span></div></div>
      <div className="w-full rounded-xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 text-center"><p className="text-xs text-violet-300/70">الفئة</p><p className="text-xl font-bold text-violet-300">{state.category}</p></div>
      {state.message && <div className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold bg-emerald-500/10 text-emerald-400">{state.message}</div>}
      <div className="min-h-[3rem] w-full rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center"><p className="text-2xl font-bold tracking-wider text-cyan-300">{state.currentWord || "···"}</p></div>
      <div className="grid grid-cols-4 gap-2">{state.letters?.map((l: string, i: number) => (
        <button key={i} onClick={() => selectLetter(i)} disabled={state.selectedIndices.includes(i)} className={state.selectedIndices.includes(i) ? "h-14 w-14 cursor-not-allowed rounded-xl border border-violet-500/30 bg-violet-500/20 text-violet-300 opacity-40 font-bold" : "h-14 w-14 cursor-pointer rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:border-violet-500/40 hover:scale-110"}>{l}</button>
      ))}</div>
      <div className="flex gap-3"><button onClick={clearSel} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">مسح</button><button onClick={submit} disabled={!state.currentWord} className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-2 font-bold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40">تأكيد</button></div>
    </div>
  );
}


