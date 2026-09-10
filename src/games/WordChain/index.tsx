const WORDS: Record<string, string[]> = { "فواكه": ["تفاح", "موز", "برتقال", "عنب", "مانجو", "فراولة", "بطيخ", "ليمون", "كرز"], "حيوانات": ["قطة", "كلب", "فيل", "أسد", "نمر", "حمار", "بقرة", "دجاجة", "سمكة"], "ألوان": ["أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "برتقالي", "بنفسجي"], "أشياء": ["كرة", "سيف", "كتاب", "قلم", "منضدة", "كرسي", "نافذة", "باب"] };

function genLetters(word: string, extra: number): string[] {
  const tiles = word.split("");
  const al = "أبترخضسشصطفكلمنهويوجدثذزس";
  while (tiles.length < word.length + extra) {
    const r = al[Math.floor(Math.random() * al.length)];
    if (!tiles.includes(r)) tiles.push(r);
  }
  for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
  return tiles;
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
    const nextTurn = (state.turn + 1) % len;
    const nextName = pc.players?.[nextTurn]?.name || `لاعب ${nextTurn + 1}`;
    broadcast({ ...state, selectedIndices, currentWord: selectedIndices.map((i) => state.letters[i]).join(""), turn: nextTurn, message: `✍️ دور ${nextName} الآن — أضف الحرف التالي` });
  };

  const clearSel = () => {
    if (!state || me !== state.turn || me === -1) return;
    broadcast({ ...state, selectedIndices: [], currentWord: "", message: "🗑 تم المسح — دورك" });
  };

  const submit = () => {
    if (!state || me !== state.turn || me === -1 || !state.currentWord) return;
    if (state.currentWord === state.targetWord) {
      const scores = [...(state.scores || [])];
      while (scores.length < len) scores.push(0);
      for (let i = 0; i < scores.length; i++) scores[i] += 2;
      scores[me] += 8;
      if (state.round >= 5) { broadcast({ ...state, scores, phase: "result" }); return; }
      const { cat, word } = randomWord();
      broadcast({ ...state, category: cat, targetWord: word, letters: genLetters(word, 5), selectedIndices: [], currentWord: "", turn: (state.turn + 1) % len, round: state.round + 1, scores, message: `✅ ${state.currentWord} — صحيحة! +10` });
    } else {
      broadcast({ ...state, selectedIndices: [], currentWord: "", turn: (state.turn + 1) % len, message: "❌ ليست الكلمة الصحيحة — حاولوا" });
    }
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-2 right-4 text-4xl animate-float opacity-25 select-none">🔤</span>
          <span className="absolute bottom-4 left-5 text-4xl animate-float opacity-25 select-none" style={{ animationDelay: "-1.5s" }}>✳️</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
        </div>
        <div className="text-center relative"><div className="mb-2 text-6xl animate-pop">🔤</div><h2 className="text-3xl font-bold text-violet-300">سلسلة الكلمات</h2></div>
        <p className="text-center text-base text-slate-400">كل لاعب يحط حرف بالدور حتى تكتمل الكلمة</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-violet-400">في انتظار المضيف...</p>}
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-cyan-400">انتهت الكلمات! 🔤</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm text-slate-400">النتيجة</p><p className="my-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-cyan-500">{state.scores?.join(" - ") || "0"}</p></div>
        {pc.isHost && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">إعادة اللعب</button>}
      </div>
    );
  }

  const currentName = pc.players?.[state.turn]?.name || `لاعب ${state.turn + 1}`;
  const myTurn = me === state.turn && me !== -1;

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-2 right-3 text-3xl animate-float opacity-20 select-none">🔤</span>
        <span className="absolute bottom-10 left-2 text-3xl animate-spin-slow opacity-15 select-none">✳️</span>
        <span className="absolute top-24 left-6 text-2xl animate-float opacity-15 select-none" style={{ animationDelay: "-2s" }}>✦</span>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>
      <div className="flex gap-4 relative">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">الدور: </span><span className={`text-base font-bold ${myTurn ? "text-amber-400" : "text-violet-300"}`}>{currentName}{myTurn ? " (أنت) ⚡" : ""}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">المستوى: </span><span className="text-base font-bold text-amber-400">{state.round}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">⭐ النقاط: </span><span className="text-base font-bold text-emerald-400">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className="relative w-full rounded-xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 text-center"><p className="text-sm text-violet-300/70">الفئة</p><p className="text-2xl font-bold text-violet-300">{state.category}</p></div>
      {state.message && <div className="w-full rounded-xl px-4 py-3 text-center text-base font-bold bg-white/5 text-slate-300">{state.message}</div>}
      <div className="relative min-h-[3.5rem] w-full rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center"><p className="text-4xl font-bold tracking-wider text-cyan-300">{state.currentWord || "···"}</p></div>
      <div className="grid grid-cols-4 gap-3">{state.letters?.map((l: string, i: number) => (
        <button key={i} onClick={() => selectLetter(i)} disabled={!myTurn || state.selectedIndices.includes(i)} className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl text-3xl font-bold border transition-all ${state.selectedIndices.includes(i) ? "border-violet-500/30 bg-violet-500/20 text-violet-300 opacity-40 cursor-not-allowed" : myTurn ? "cursor-pointer border-white/10 bg-white/5 text-white hover:border-violet-500/40 hover:scale-110 active:scale-95" : "cursor-not-allowed border-white/10 bg-white/5 text-white opacity-40"}`}>{l}</button>
      ))}</div>
      <div className="flex gap-3">
        <button onClick={clearSel} disabled={!myTurn} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base text-slate-300 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">مسح</button>
        <button onClick={submit} disabled={!myTurn || !state.currentWord} className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">تأكيد الكلمة</button>
      </div>
    </div>
  );
}