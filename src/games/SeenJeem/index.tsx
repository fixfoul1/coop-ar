interface Props { pc: any; state: any; broadcast: (s: any) => void; }

const TEAM_NAMES = ["الأزرق", "الأحمر"];
const TEAM_EMOJI = ["🫐", "🍎"];
const TEAM_UI = [
  { text: "text-sky-300", bar: "from-sky-500 to-cyan-400", grad: "from-sky-600 to-blue-600", border: "border-sky-500/40" },
  { text: "text-rose-300", bar: "from-rose-500 to-red-400", grad: "from-rose-600 to-red-600", border: "border-rose-500/40" },
];

const CATS = [
  { id: 0, name: "معلومات عامة", emoji: "🧠", chip: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  { id: 1, name: "علوم وتقنية", emoji: "🔬", chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  { id: 2, name: "جغرافيا وطبيعة", emoji: "📍", chip: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" },
  { id: 3, name: "تاريخ وأحداث", emoji: "🏛️", chip: "border-violet-500/40 bg-violet-500/10 text-violet-300" },
  { id: 4, name: "رياضة وترفيه", emoji: "🏆", chip: "border-pink-500/40 bg-pink-500/10 text-pink-300" },
  { id: 5, name: "أدب ولغة", emoji: "📚", chip: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
];

const IMG = {
  cat: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/500px-Cat_November_2010-1a.jpg",
  lion: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Lion_%28Panthera_leo%29_male_6y.jpg/500px-Lion_%28Panthera_leo%29_male_6y.jpg",
  giza: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Giza_pyramids.JPG/500px-Giza_pyramids.JPG",
  kaaba: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Kaaba_mirror_edit.jpg/500px-Kaaba_mirror_edit.jpg",
  taj: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/500px-Taj_Mahal_%28Edited%29.jpeg",
  bigben: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Big_Ben_London.jpg",
  flagSa: "https://flagcdn.com/w240/sa.png",
  flagKw: "https://flagcdn.com/w240/kw.png",
  flagAe: "https://flagcdn.com/w240/ae.png",
};

const QS = [
  // 🧠 معلومات عامة
  { cat: 0, q: "كم عدد أيام السنة الكبيسة؟", o: ["360", "365", "366", "364"], a: 2 },
  { cat: 0, q: "ما أكبر كوكب في المجموعة الشمسية؟", o: ["الأرض", "المريخ", "المشتري", "زحل"], a: 2 },
  { cat: 0, q: "أي بحر يفصل مصر عن السعودية؟", o: ["البحر الأبيض المتوسط", "البحر الأحمر", "البحر الأسود", "الخليج العربي"], a: 1 },
  { cat: 0, q: "ما اسم أشهر سفينة غرقت في التاريخ؟", o: ["التايتنك", "الماي فلاور", "الفيكتوريا", "كوين ماري"], a: 0 },
  { cat: 0, q: "ما الكوكب الأقرب إلى الشمس؟", o: ["عطارد", "الزهرة", "المريخ", "الأرض"], a: 0 },
  { cat: 0, q: "كم عدد أيام الأسبوع؟", o: ["6", "7", "8", "9"], a: 1 },
  { cat: 0, q: "كم دقيقة في الساعة الواحدة؟", o: ["60", "100", "30", "90"], a: 0 },
  { cat: 0, q: "ما اسم هذا الحيوان؟", img: IMG.lion, o: ["الأسد", "النمر", "الفهد", "الذئب"], a: 0 },
  // 🔬 علوم وتقنية
  { cat: 1, q: "ما الغاز الذي نتنفسه ليعيش الجسم؟", o: ["الأكسجين", "النيتروجين", "الهيدروجين", "ثاني أكسيد الكربون"], a: 0 },
  { cat: 1, q: "كم عدد أجنحة النحلة؟", o: ["جناحان", "4 أجنحة", "6 أجنحة", "8 أجنحة"], a: 1 },
  { cat: 1, q: "أي جزء من الجسم يضخ الدم؟", o: ["الرئة", "الكبد", "القلب", "المعدة"], a: 2 },
  { cat: 1, q: "ما أسرع حيوان بري في العالم؟", o: ["الحصان", "الأسد", "الفهد", "الغزال"], a: 2 },
  { cat: 1, q: "كم عدد الحواس عند الإنسان؟", o: ["4", "5", "6", "7"], a: 1 },
  { cat: 1, q: "كم عدد أرجل العنكبوت؟", o: ["6", "8", "10", "12"], a: 1 },
  { cat: 1, q: "أي عضو في الجسم يصفي الدم؟", o: ["الكلى", "الكبد", "القلب", "الرئة"], a: 0 },
  { cat: 1, q: "ما اسم هذا الحيوان؟", img: IMG.cat, o: ["القطة", "الكلب", "الأرنب", "الثعلب"], a: 0 },
  // 📍 جغرافيا وطبيعة
  { cat: 2, q: "ما عاصمة السعودية؟", o: ["جدة", "الرياض", "الدمام", "مكة"], a: 1 },
  { cat: 2, q: "ما أطول نهر في العالم؟", o: ["النيل", "الأمازون", "دجلة", "الفرات"], a: 0 },
  { cat: 2, q: "كم عدد قارات العالم؟", o: ["5", "6", "7", "8"], a: 2 },
  { cat: 2, q: "ما أكبر دولة عربية مساحة؟", o: ["السعودية", "مصر", "الجزائر", "العراق"], a: 2 },
  { cat: 2, q: "لمن علم هذه الدولة؟", img: IMG.flagSa, o: ["السعودية", "الكويت", "الإمارات", "قطر"], a: 0 },
  { cat: 2, q: "لمن علم هذه الدولة؟", img: IMG.flagKw, o: ["السعودية", "الكويت", "البحرين", "عُمان"], a: 1 },
  { cat: 2, q: "لمن علم هذه الدولة؟", img: IMG.flagAe, o: ["سوريا", "الأردن", "الإمارات", "اليمن"], a: 2 },
  { cat: 2, q: "ما اسم هذا المعلم الواقع في لندن؟", img: IMG.bigben, o: ["بيغ بن", "برج خليفة", "برج إيفل", "مونار"], a: 0 },
  // 🏛️ تاريخ وأحداث
  { cat: 3, q: "من أول خليفة للمسلمين؟", o: ["عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب", "أبو بكر الصديق"], a: 3 },
  { cat: 3, q: "من الذي فتح القسطنطينية؟", o: ["محمد الفاتح", "صلاح الدين", "طارق بن زياد", "هارون الرشيد"], a: 0 },
  { cat: 3, q: "في أي عام تأسست الكويت الحديثة؟", o: ["1701", "1752", "1800", "1899"], a: 1 },
  { cat: 3, q: "أول غزوة في الإسلام؟", o: ["بدر", "أحد", "الخندق", "حنين"], a: 0 },
  { cat: 3, q: "في أي عام اكتشفت أمريكا؟", o: ["1492", "1510", "1776", "1820"], a: 0 },
  { cat: 3, q: "من وحّد المملكة العربية السعودية الحديثة؟", o: ["الملك عبدالعزيز آل سعود", "الملك فيصل", "الملك خالد", "الملك سعود"], a: 0 },
  { cat: 3, q: "من بنى الأهرامات في الصورة؟", img: IMG.giza, o: ["الفراعنة", "الرومان", "اليونانيون", "الفرس"], a: 0 },
  { cat: 3, q: "أين يقع المعلم في الصورة؟", img: IMG.kaaba, o: ["مكة", "المدينة", "القدس", "الطائف"], a: 0 },
  // 🏆 رياضة وترفيه
  { cat: 4, q: "كم عدد لاعبي كرة القدم في الفريق؟", o: ["9", "10", "11", "12"], a: 2 },
  { cat: 4, q: "كل كم سنة تقام الألعاب الأولمبية؟", o: ["سنة", "سنتان", "4 سنوات", "5 سنوات"], a: 2 },
  { cat: 4, q: "كم عدد لاعبي كرة السلة في الفريق؟", o: ["5", "6", "7", "11"], a: 0 },
  { cat: 4, q: "من فاز بأول كأس عالم لكرة القدم؟", o: ["البرازيل", "إيطاليا", "أوروغواي", "ألمانيا"], a: 2 },
  { cat: 4, q: "ما الدولة الأكثر فوزًا بكأس العالم؟", o: ["البرازيل", "ألمانيا", "إيطاليا", "الأرجنتين"], a: 0 },
  { cat: 4, q: "كم عدد لاعبي الكرة الطائرة في الفريق؟", o: ["6", "7", "9", "11"], a: 0 },
  { cat: 4, q: "من اللاعب الملقب بـ «الدون»؟", o: ["كريستيانو رونالدو", "ميسي", "نيمار", "محمد صلاح"], a: 0 },
  { cat: 4, q: "أين تقام سباقات الفورمولا 1 في قطر؟", o: ["حلبة لوسيل", "حلبة جدة", "حلبة البحرين", "حلبة دبي"], a: 0 },
  // 📚 أدب ولغة
  { cat: 5, q: "ما مضاد كلمة «كبير»؟", o: ["ضخم", "صغير", "واسع", "طويل"], a: 1 },
  { cat: 5, q: "أكمل المثل: «الصديق وقت...»", o: ["اللعب", "الضيق", "النوم", "المال"], a: 1 },
  { cat: 5, q: "ما الكلمة التي تبدأ وتنتهي بالحرف نفسه؟", o: ["قلم", "باب", "ورد", "جبل"], a: 1 },
  { cat: 5, q: "لغز: دائمًا آكل ولا أشبع، ما أنا؟", o: ["الأرض", "النار", "الماء", "الشمس"], a: 1 },
  { cat: 5, q: "ما جمع كلمة «كتاب»؟", o: ["أكتاب", "كتب", "كتبة", "كتابة"], a: 1 },
  { cat: 5, q: "ما مضاد كلمة «فرح»؟", o: ["حزن", "غضب", "خوف", "ملل"], a: 0 },
  { cat: 5, q: "ما جمع كلمة «وردة»؟", o: ["ورود", "أوراد", "وردية", "أورود"], a: 0 },
  { cat: 5, q: "من مؤلف «كليلة ودمنة»؟", o: ["ابن المقفع", "الجاحظ", "المتنبي", "ابن خلدون"], a: 0 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const ALL_CATS = [0, 1, 2, 3, 4, 5];

export function SeenJeem({ state, broadcast, pc }: Props) {
  const me = pc.playerIdx;
  const len = Math.max(1, (pc.players || []).length);
  const isHost = pc.isHost;

  const selectedCats = (state?.cats && state.cats.length ? state.cats : ALL_CATS) as number[];

  const toggleCat = (c: number) => {
    if (me === -1) return;
    const cur = selectedCats;
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c];
    if (!next.length) return;
    broadcast({ ...state, cats: next });
  };

  const startGame = () => {
    const pool = shuffle(QS.filter((q) => selectedCats.includes(q.cat)));
    const quiz = pool.slice(0, Math.min(12, pool.length));
    broadcast({ phase: "playing", quiz, qIdx: 0, teamScore: [0, 0], teams: new Array(len).fill(-1), reveal: false, scored: -1, buzz: -1, cats: selectedCats, message: "السؤال الأول — المضيف يكشف السؤال ويقرأه" });
  };

  const pickTeam = (t: number) => {
    if (!state || me === -1 || state.phase !== "lobby" && state.phase !== undefined) return;
    if (state.phase !== "lobby") return;
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
          <span className="absolute top-1/2 left-8 text-3xl animate-spin-slow opacity-15 select-none">🎯</span>
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
              {me !== -1 && <button onClick={() => state ? pickTeam(t) : null} className={`cursor-pointer rounded-xl bg-gradient-to-l ${TEAM_UI[t].grad} px-6 py-2 text-sm font-bold text-white transition-all hover:brightness-110 ${myTeam === t ? "opacity-50 cursor-not-allowed" : ""}`}>{myTeam === t ? "اخترت هذا ✓" : `▶ أريد هذا الفريق`}</button>}
            </div>
          ))}
        </div>
        <div className="relative w-full rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-center text-base font-bold text-amber-300">🎛️ اختيار الفئات — اختاروها بحرية مع بعض</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATS.map((c) => {
              const on = selectedCats.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleCat(c.id)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold transition-all ${on ? `${c.chip} shadow-lg` : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300"}`}>{c.emoji} {c.name} {on ? "✓" : ""}</button>
              );
            })}
          </div>
        </div>
        {isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-amber-500/25 hover:brightness-110">ابدأ اللعبة 🎙️</button>}
        {!isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-amber-400">في انتظار المضيف — اختر فريقك واختارو الفئات مع بعض</p>}
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
  const catInfo = CATS.find((c) => c.id === q.cat) || CATS[0];

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
            <div className={`h-full rounded-full bg-gradient-to-l ${TEAM_UI[0].bar}`} style={{ width: `${50 + (state.teamScore[0] - state.teamScore[1]) * 3}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className={`font-bold ${TEAM_UI[0].text}`}>🫐 أزرق: {state.teamScore[0]}</span>
            <span className={`font-bold ${TEAM_UI[1].text}`}>أحمر: {state.teamScore[1]} 🍎</span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-2">
        {CATS.filter((c) => selectedCats.includes(c.id)).map((c) => (
          <span key={c.id} className={`rounded-full border px-3 py-1 text-xs font-bold ${c.chip}`}>{c.emoji} {c.name}</span>
        ))}
      </div>
      <div className="relative w-full rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-full border px-3 py-1 text-sm font-bold ${catInfo.chip}`}>{catInfo.emoji} {catInfo.name}</span>
          <span className="text-sm text-slate-400">سؤال {state.qIdx + 1}/{state.quiz.length}</span>
        </div>
        {q.img && (
          <div className="mb-4 flex justify-center">
            <img src={q.img} alt="السؤال" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} className="h-44 w-full max-w-md rounded-xl border border-white/10 bg-slate-800 object-cover" />
          </div>
        )}
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