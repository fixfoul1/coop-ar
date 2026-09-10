interface Props { pc: any; state: any; broadcast: (s: any) => void; }

const TEAM_NAMES = ["الأزرق", "الأحمر"];
const TEAM_EMOJI = ["🫐", "🍎"];
const TEAM_UI = [
  { text: "text-sky-300", bar: "from-sky-500 to-cyan-400", grad: "from-sky-600 to-blue-600", border: "border-sky-500/40", glow: "shadow-sky-500/25" },
  { text: "text-rose-300", bar: "from-rose-500 to-red-400", grad: "from-rose-600 to-red-600", border: "border-rose-500/40", glow: "shadow-rose-500/25" },
];

const QS = [
  { cat: 0, q: "كم عدد عجلات السيارة العادية؟", o: ["عجلتان", "3 عجلات", "4 عجلات", "6 عجلات"], a: 2 },
  { cat: 0, q: "ما أكبر كوكب في المجموعة الشمسية؟", o: ["الأرض", "المريخ", "المشتري", "زحل"], a: 2 },
  { cat: 0, q: "كم عدد أيام السنة الكبيسة؟", o: ["360", "365", "366", "364"], a: 2 },
  { cat: 0, q: "أي بحر يفصل مصر عن السعودية؟", o: ["البحر الأبيض المتوسط", "البحر الأحمر", "البحر الأسود", "الخليج العربي"], a: 1 },
  { cat: 0, q: "ما اسم أشهر سفينة غرقت في التاريخ؟", o: ["التايتنك", "الماي فلور", "الفيكتوريا", "كوين ماري"], a: 0 },
  { cat: 1, q: "ما الغاز الذي نتنفسه ليعيش الجسم؟", o: ["الأكسجين", "النيتروجين", "الهيدروجين", "ثاني أكسيد الكربون"], a: 0 },
  { cat: 1, q: "كم عدد أجنحة النحلة؟", o: ["جناحان", "4 أجنحة", "6 أجنحة", "8 أجنحة"], a: 1 },
  { cat: 1, q: "أي جزء من الجسم يضخ الدم؟", o: ["الرئة", "الكبد", "القلب", "المعدة"], a: 2 },
  { cat: 1, q: "ما أسرع حيوان بري في العالم؟", o: ["الحصان", "الأسد", "الفهد", "الغزال"], a: 2 },
  { cat: 1, q: "كم عدد الحواس عند الإنسان؟", o: ["4", "5", "6", "7"], a: 1 },
  { cat: 2, q: "ما عاصمة السعودية؟", o: ["جدة", "الرياض", "الدمام", "مكة"], a: 1 },
  { cat: 2, q: "ما أطول نهر في العالم؟", o: ["النيل", "الأمازون", "دجلة", "الفرات"], a: 0 },
  { cat: 2, q: "كم عدد قارات العالم؟", o: ["5", "6", "7", "8"], a: 2 },
  { cat: 2, q: "ما أكبر دولة عربية مساحة؟", o: ["السعودية", "مصر", "الجزائر", "العراق"], a: 2 },
  { cat: 2, q: "ما عاصمة الإمارات؟", o: ["دبي", "أبوظبي", "الشارقة", "العين"], a: 1 },
  { cat: 3, q: "من أول خليفة للمسلمين؟", o: ["عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب", "أبو بكر الصديق"], a: 3 },
  { cat: 3, q: "من الذي فتح القسطنطينية؟", o: ["محمد الفاتح", "صلاح الدين", "طارق بن زياد", "هارون الرشيد"], a: 0 },
  { cat: 3, q: "في أي عام تأسست الكويت الحديثة؟", o: ["1701", "1752", "1800", "1899"], a: 1 },
  { cat: 3, q: "من بنى الأهرامات في مصر؟", o: ["الفراعنة", "الرومان", "اليونانيون", "الفرس"], a: 0 },
  { cat: 3, q: "في أي عام اكتشفت أمريكا؟", o: ["1492", "1510", "1776", "1820"], a: 0 },
  { cat: 4, q: "كم عدد لاعبي كرة القدم في الفريق؟", o: ["9", "10", "11", "12"], a: 2 },
  { cat: 4, q: "كل كم سنة تقام الألعاب الأولمبية؟", o: ["سنة", "سنتان", "4 سنوات", "5 سنوات"], a: 2 },
  { cat: 4, q: "كم عدد لاعبي كرة السلة في الفريق؟", o: ["5", "6", "7", "11"], a: 0 },
  { cat: 4, q: "من فاز بأول كأس عالم لكرة القدم؟", o: ["البرازيل", "إيطاليا", "أوروغواي", "ألمانيا"], a: 2 },
  { cat: 4, q: "ما الرياضة المعروفة بالرياضة الملكية؟", o: ["كرة القدم", "الجولف", "الملاكمة", "السباحة"], a: 1 },
  { cat: 5, q: "ما مضاد كلمة «كبير»؟", o: ["ضخم", "صغير", "واسع", "طويل"], a: 1 },
  { cat: 5, q: "أكمل المثل: «الصديق وقت...»", o: ["اللعب", "الضيق", "النوم", "المال"], a: 1 },
  { cat: 5, q: "ما الكلمة التي تبدأ وتنتهي بالحرف نفسه؟", o: ["قلم", "باب", "ورد", "جبل"], a: 1 },
  { cat: 5, q: "لغز: دائمًا آكل ولا أشبع، ما أنا؟", o: ["الأرض", "النار", "الماء", "الشمس"], a: 1 },
  { cat: 5, q: "ما جمع كلمة «كتاب»؟", o: ["أكتاب", "كتب", "كتبة", "كتابة"], a: 1 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function SeenJeem({ state, broadcast, pc }: Props) {
  const me = pc.playerIdx;
  const len = Math.max(1, (pc.players || []).length);
  const isHost = pc.isHost;

  const startGame = () => {
    const quiz = shuffle(QS).slice(0, 12);
    broadcast({ phase: "playing", quiz, qIdx: 0, teamScore: [0, 0], teams: new Array(len).fill(-1), reveal: false, scored: -1, buzz: -1, message: "السؤال الأول — المضيف يكشف السؤال ويقرأه" });
  };

  const pickTeam = (t: number) => {
    if (!state || me === -1) return;
    const teams = [...(state.teams || new Array(len).fill(-1))];
    while (teams.length <= me) teams.push(-1);
    teams[me] = t;
    broadcast({ ...state, teams });
  };

  const toggleReveal = () => {
    if (!isHost || !state) return;
    broadcast({ ...state, reveal: !state.reveal, buzz: -1, message: !state.reveal ? "📢 الإجابة مكشوفة للجميع!" : "💡 أخفيت الجواب — كروهم!" });
  };

  const buzz = () => {
    if (!state || me === -1 || myTeam === -1 || state.reveal || state.buzz !== -1 || state.scored !== -1) return;
    broadcast({ ...state, buzz: myTeam, message: `🔔 فريق ${TEAM_NAMES[myTeam]} يعرف الجواب!` });
  };

  const award = (t: number) => {
    if (!isHost || !state || !state.reveal || state.scored !== -1) return;
    const teamScore = [...state.teamScore];
    teamScore[t] += 5;
    broadcast({ ...state, teamScore, scored: t, message: `✅ +5 لفريق ${TEAM_NAMES[t]} — المضيف يكمل` });
  };

  const nextQ = () => {
    if (!isHost || !state) return;
    if (state.qIdx + 1 >= state.quiz.length) { broadcast({ ...state, phase: "result", message: "" }); return; }
    broadcast({ ...state, qIdx: state.qIdx + 1, reveal: false, scored: -1, buzz: -1, message: `السؤال ${state.qIdx + 2} — المضيف يقرأ` });
  };

  const myTeam = state?.teams?.[me] ?? -1;

  if (!state || state.phase === "lobby") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-2 right-4 text-4xl animate-float opacity-25 select-none">🧩</span>
          <span className="absolute bottom-4 left-5 text-4xl animate-float opacity-25 select-none" style={{ animationDelay: "-1.5s" }}>❓</span>
          <span className="absolute top-1/2 left-8 text-3xl animate-spin-slow opacity-15 select-none">🏟️</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
        </div>
        <div className="text-center relative"><div className="mb-2 text-6xl animate-pop">🧩</div><h2 className="text-3xl font-bold text-amber-300">سين جيم</h2></div>
        <p className="text-center text-base text-slate-400">لعبة أسئلة لفريقين — المضيف هو اللي يكشف السؤال والجواب</p>
        <div className="grid w-full grid-cols-2 gap-4 relative">
          {[0, 1].map((t) => (
            <div key={t} className={`rounded-2xl border ${TEAM_UI[t].border} bg-white/5 p-6 text-center transition-all ${myTeam === t ? "ring-2 ring-white/30 scale-[1.03]" : ""}`}>
              <div className="mb-2 text-5xl animate-float">{TEAM_EMOJI[t]}</div>
              <p className={`mb-3 text-xl font-bold ${TEAM_UI[t].text}`}>فريق {TEAM_NAMES[t]}</p>
              {me !== -1 && <button onClick={() => pickTeam(t)} className={`cursor-pointer rounded-xl bg-gradient-to-l ${TEAM_UI[t].grad} px-6 py-2 text-sm font-bold text-white transition-all hover:brightness-110 ${myTeam === t ? "opacity-50 cursor-not-allowed" : ""}`}>{myTeam === t ? "اخترت هذا ✓" : `▶ أريد هذا الفريق`}</button>}
            </div>
          ))}
        </div>
        {isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-amber-500/25 hover:brightness-110">ابدأ اللعبة 🎙️</button>}
        {!isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-amber-400">في انتظار المضيف — اختر فريقك أولًا</p>}
      </div>
    );
  }

  if (state.phase === "result") {
    const winner = state.teamScore[0] === state.teamScore[1] ? -1 : state.teamScore[0] > state.teamScore[1] ? 0 : 1;
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-3 left-6 text-5xl animate-float opacity-30 select-none">🏆</span>
          <span className="absolute bottom-5 right-5 text-4xl animate-spin-slow opacity-20 select-none">✨</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
        </div>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-400">{winner === -1 ? "تعادل مثير! 🤝" : `فاز فريق ${TEAM_NAMES[winner]} ${TEAM_EMOJI[winner]}!`}</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="mb-4 text-sm text-slate-400">النتيجة النهائية</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center"><p className={`text-2xl font-black ${TEAM_UI[0].text}`}>{TEAM_EMOJI[0]} {state.teamScore[0]}</p><p className="text-sm text-slate-400">فريق الأزرق</p></div>
            <span className="text-3xl text-slate-500">:</span>
            <div className="text-center"><p className={`text-2xl font-black ${TEAM_UI[1].text}`}>{state.teamScore[1]} {TEAM_EMOJI[1]}</p><p className="text-sm text-slate-400">فريق الأحمر</p></div>
          </div>
        </div>
        {isHost && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">🔁 إعادة اللعب</button>}
      </div>
    );
  }

  const q = state.quiz?.[state.qIdx];
  const OPT_LETTERS = ["أ", "ب", "ج", "د"];

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-2 right-3 text-3xl animate-float opacity-20 select-none">🧩</span>
        <span className="absolute bottom-12 left-2 text-3xl animate-spin-slow opacity-15 select-none">❓</span>
        <span className="absolute top-24 left-6 text-2xl animate-float opacity-15 select-none" style={{ animationDelay: "-2s" }}>✦</span>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-violet-500/10 blur-2xl" />
      </div>
      <div className="relative flex w-full items-center justify-center gap-4">
        <div className="relative w-full rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/5">
            <div className={`h-full rounded-full bg-gradient-to-l ${TEAM_UI[0].bar}`} style={{ width: `${50 + (state.teamScore[0] - state.teamScore[1]) * 3}%`, minWidth: 0, maxWidth: 100 }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className={`font-bold ${TEAM_UI[0].text}`}>🫐 أزرق: {state.teamScore[0]}</span>
            <span className={`font-bold ${TEAM_UI[1].text}`}>أحمر: {state.teamScore[1]} 🍎</span>
          </div>
        </div>
      </div>
      <div className="relative w-full rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">{["معلومات عامة", "علوم", "جغرافيا", "تاريخ", "رياضة", "أدب وألغاز"][q.cat]}</span>
          <span className="text-sm text-slate-400">سؤال {state.qIdx + 1}/{state.quiz.length}</span>
        </div>
        <p className="mb-4 text-2xl font-bold text-white">{q.q}</p>
        <div className="grid grid-cols-2 gap-3">
          {q.o.map((opt: string, i: number) => {
            const isCorrect = state.reveal && i === q.a;
            const isWrong = state.reveal && i !== q.a;
            return (
              <div key={i} className={`rounded-xl border px-4 py-3 text-center text-base transition-all ${isCorrect ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300 font-bold scale-[1.02]" : isWrong ? "border-white/5 bg-white/[0.03] text-slate-500" : "border-white/10 bg-white/5 text-slate-200"}`}>
                <span className="ml-2 font-bold opacity-60">{OPT_LETTERS[i]})</span>{opt}
              </div>
            );
          })}
        </div>
        {state.reveal && <p className="mt-4 rounded-xl border border-emerald-500/30 px-4 py-3 text-center text-lg font-black text-emerald-300">✔ الجواب الصحيح: {OPT_LETTERS[q.a]}) {q.o[q.a]}</p>}
      </div>
      {state.message && !isHost && <div className="rounded-xl px-4 py-2 text-base font-bold bg-white/5 text-slate-300">{state.message}</div>}

      {isHost ? (
        <div className="relative flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-center text-sm font-bold text-amber-300">🎙️ لوحة المضيف — أنت اللي تعرض القيم</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={toggleReveal} className={`cursor-pointer rounded-xl bg-gradient-to-l px-6 py-3 font-bold text-white transition-all hover:brightness-110 ${state.reveal ? "from-slate-600 to-slate-700" : "from-emerald-600 to-teal-600"}`}>{state.reveal ? "🙈 إخفاء الجواب" : "📢 كشف الجواب"}</button>
            <button onClick={() => award(0)} disabled={!state.reveal || state.scored !== -1} className="cursor-pointer rounded-xl bg-gradient-to-l from-sky-600 to-blue-600 px-6 py-3 font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">+5 أزرق 🫐</button>
            <button onClick={() => award(1)} disabled={!state.reveal || state.scored !== -1} className="cursor-pointer rounded-xl bg-gradient-to-l from-rose-600 to-red-600 px-6 py-3 font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">+5 أحمر 🍎</button>
            <button onClick={nextQ} disabled={state.scored === -1 && state.qIdx !== state.quiz.length - 1} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{state.qIdx + 1 >= state.quiz.length ? "🏁 النتيجة" : "السؤال التالي ←"}</button>
          </div>
          {state.buzz !== -1 && <p className="text-center text-base font-bold text-amber-300">🔔 فريق {TEAM_NAMES[state.buzz]} قرع الجرس! — اقرأ الجواب من عنده أولًا</p>}
        </div>
      ) : (
        <button onClick={buzz} disabled={myTeam === -1 || state.reveal || state.buzz !== -1 || state.scored !== -1} className={`relative w-full cursor-pointer rounded-xl bg-gradient-to-l px-6 py-4 text-xl font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${TEAM_UI[myTeam === -1 ? 0 : myTeam].grad}`}>
          🔔 فريقنا يعرف الجواب!
        </button>
      )}
      {state.buzz !== -1 && isHost && <p className="text-center text-base font-bold text-amber-300">🔔 فريق {TEAM_NAMES[state.buzz]} قرع الجرس — اسمع إجابته أولًا</p>}
    </div>
  );
}