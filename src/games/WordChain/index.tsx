const WORDS: Record<string, string[]> = { "فواكه": ["تفاح", "موز", "برتقال", "عنب", "مانجو", "فراولة", "بطيخ", "ليمون", "كرز"], "حيوانات": ["قطة", "كلب", "فيل", "أسد", "نمر", "حمار", "بقرة", "دجاجة", "سمكة"], "ألوان": ["أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "برتقالي", "بنفسجي"], "أشياء": ["كرة", "سيف", "كتاب", "قلم", "منضدة", "كرسي", "نافذة", "باب"] };

function genLetters(word: string, extra: number): string[] {
  const wl = [...new Set(word.split(""))]; const ex: string[] = []; const al = "أبترخضسشصطفكلمنهويوجدثذزس";
  while (ex.length < extra) { const r = al[Math.floor(Math.random() * al.length)]; if (!wl.includes(r) && !ex.includes(r)) ex.push(r); }
  const all = [...wl, ...ex];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}

function randomWord(): { cat: string; word: string } {
  const cats = Object.keys(WORDS); const cat = cats[Math.floor(Math.random() * cats.length)];
  return { cat, word: WORDS[cat][Math.floor(Math.random() * WORDS[cat].length)] };
}

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function WordChain({ state, broadcast, pc }: Props) {
  const me = pc.playerIdx;
  const len = Math.max(1, (pc.players || []).length);

  const startGame = () => {
    const { cat, word } = randomWord();
    broadcast({ phase: "playing", category: cat, targetWord: word, letters: genLetters(word, 5), selectedIndices: [], currentWord: "", turn: 0, scores: new Array(len).fill(0), round: 1, message: "", roundScore: 0 });
  };

  const selectLetter = (idx: number) => {
    if (!state || me !== state.turn || me === -1 || state.selectedIndices.includes(idx)) return;
    const selectedIndices = [...state.selectedIndices, idx];
    broadcast({ ...state, selectedIndices, currentWord: selectedIndices.map((i) => state.letters[i]).join(""), turn: (state.turn + 1) % len, message: "👍 حطّ فلان الحرف — ادخل الدور الجديد" });
  };

  const clearSel = () => {
    if (!state || me !== state.turn || me === -1) return;
    broadcast({ ...state, selectedIndices: [], currentWord: "", message: "🗑 تم المسح — دورك" });
  };

  const submit = () => {
    if (!state || me !== state.turn || me === -1 || !state.currentWord) return;
    if (state.currentWord === state.targetWord) {
      const scores = [...(state.scores || [])]; scores[me] += 10;
      const { cat, word } = randomWord();
      broadcast({ ...state, category: cat, targetWord: word, letters: genLetters(word, 5), selectedIndices: [], currentWord: "", turn: (state.turn + 1) % len, round: state.round + 1, scores, message: `✅ ${state.currentWord} — صحيحة! +10` });
    } else {
      broadcast({ ...state, selectedIndices: [], currentWord: "", turn: (state.turn + 1) % len, message: "❌ ليست الكلمة الصحيحة — حاولوا" });
    }
  };

  if (!state || state.phase === "lobby" || state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🔤</div><h2 className="text-2xl font-bold text-violet-300">سلسلة الكلمات</h2></div>
        <p className="text-center text-sm text-slate-400">كل لاعب يحط حرف بالدور حتى تكتمل الكلمة</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-violet-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  const currentName = pc.players?.[state.turn]?.name || `لاعب ${state.turn + 1}`;
  const myTurn = me === state.turn && me !== -1;

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">الدور: </span><span className={`font-bold ${myTurn ? "text-amber-400" : "text-violet-300"}`}>{currentName}{myTurn ? " (أنت) ⚡" : ""}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">المستوى: </span><span className="font-bold text-amber-400">{state.round}</span></div>
      </div>
      <div className="flex gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⭐ النقاط: </span><span className="font-bold text-emerald-400">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className="w-full rounded-xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 text-center"><p className="text-xs text-violet-300/70">الفئة</p><p className="text-xl font-bold text-violet-300">{state.category}</p></div>
      {state.message && <div className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold bg-white/5 text-slate-300">{state.message}</div>}
      <div className="min-h-[3rem] w-full rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center"><p className="text-2xl font-bold tracking-wider text-cyan-300">{state.currentWord || "···"}</p></div>
      <div className="grid grid-cols-4 gap-2">{state.letters?.map((l: string, i: number) => (
        <button key={i} onClick={() => selectLetter(i)} disabled={!myTurn || state.selectedIndices.includes(i)} className={`h-14 w-14 rounded-xl border font-bold transition-all ${state.selectedIndices.includes(i) ? "border-violet-500/30 bg-violet-500/20 text-violet-300 opacity-40 cursor-not-allowed" : myTurn ? "cursor-pointer border-white/10 bg-white/5 text-white hover:border-violet-500/40 hover:scale-110" : "cursor-not-allowed border-white/10 bg-white/5 text-white opacity-40"}`}>{l}</button>
      ))}</div>
      <div className="flex gap-3">
        <button onClick={clearSel} disabled={!myTurn} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">مسح</button>
        <button onClick={submit} disabled={!myTurn || !state.currentWord} className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-2 font-bold text-white shadow-lg shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40">تأكيد الكلمة</button>
      </div>
    </div>
  );
}