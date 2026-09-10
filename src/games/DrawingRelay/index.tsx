import { useState, useRef } from "react";
const PROMPTS = ["قطة", "شمس", "بيت", "شجرة", "سيارة", "سمكة", "قمر", "نافذة", "باب", "ساعة", "مفتاح", "طائرة", "جبل", "نهر", "مطر"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function DrawingRelay({ state, broadcast, pc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [brushColor, setBrushColor] = useState("#fff");
  const brushSize = 4;
  const len = Math.max(2, (pc.players || []).length);
  const me = pc.playerIdx;

  const startGame = () => {
    broadcast({ phase: "playing", prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)], drawerIdx: 0, round: 1, maxRounds: 3, history: [], scores: new Array(len).fill(0), message: "", drawingData: null, guess: "" });
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect(); const cx = "touches" in e ? e.touches[0].clientX : e.clientX; const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: ((cx - rect.left) / rect.width) * canvas.width, y: ((cy - rect.top) / rect.height) * canvas.height };
  };
  const startDraw = (e: any) => { drawing.current = true; lastPos.current = getPos(e); };
  const draw = (e: any) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d"); if (!ctx) return;
    const pos = getPos(e); const last = lastPos.current;
    if (last) { ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = brushColor; ctx.lineWidth = brushSize; ctx.lineCap = "round"; ctx.stroke(); }
    lastPos.current = pos;
    const data = canvasRef.current.toDataURL();
    broadcast({ ...state, drawingData: data });
  };
  const stopDraw = () => { drawing.current = false; };

  const isDrawer = me === state.drawerIdx && me !== -1;

  const submitGuess = () => {
    if (!state?.guess || isDrawer) return;
    if (state.guess.trim() === state.prompt) {
      const scores = [...(state.scores || [])]; while (scores.length <= me) scores.push(0);
      scores[me] += 10;
      broadcast({ ...state, message: `✅ ${state.guess} صحيحة! +10 — الراسم يضغط إنهاء الجولة` });
    } else {
      broadcast({ ...state, message: "❌ ليست الكلمة — حاول مرة أخرى" });
    }
  };

  const endRound = () => {
    if (!isDrawer) return;
    if (state.round >= state.maxRounds) { broadcast({ ...state, phase: "result" }); }
    else { broadcast({ ...state, phase: "playing", drawerIdx: (state.drawerIdx + 1) % len, prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)], round: state.round + 1, message: "", drawingData: null, guess: "" }); }
  };

  const COLORS = ["#fff", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

  if (!state || state.phase === "lobby") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-2 right-4 text-4xl animate-float opacity-25 select-none">🎨</span>
          <span className="absolute bottom-4 left-5 text-4xl animate-float opacity-25 select-none" style={{ animationDelay: "-1.5s" }}>🖌️</span>
          <span className="absolute top-1/2 left-8 text-3xl animate-spin-slow opacity-15 select-none">🎨</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        </div>
        <div className="text-center relative"><div className="mb-2 text-6xl animate-pop">🎨</div><h2 className="text-3xl font-bold text-cyan-300">رسم بالتناوب</h2></div>
        <p className="text-center text-base text-slate-400">واحد يرسم والآخر يحزر — تبادلوا الأدوار كل جولة</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-cyan-600 to-blue-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-cyan-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-3 left-6 text-4xl animate-float opacity-25 select-none">🏆</span>
          <span className="absolute bottom-5 right-5 text-4xl animate-spin-slow opacity-20 select-none">✨</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-400">انتهت الجولات! 🎨</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm text-slate-400">النتيجة</p><p className="my-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">{state.scores?.join(" - ") || "0"}</p></div>
        {pc.isHost && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">إعادة اللعب</button>}
      </div>
    );
  }

  const drawerName = pc.players?.[state.drawerIdx]?.name || `لاعب ${state.drawerIdx + 1}`;

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-2 right-3 text-3xl animate-float opacity-20 select-none">🎨</span>
        <span className="absolute bottom-12 left-2 text-3xl animate-spin-slow opacity-15 select-none">🖌️</span>
        <span className="absolute top-24 left-6 text-2xl animate-float opacity-15 select-none" style={{ animationDelay: "-2s" }}>✦</span>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>
      <div className="flex gap-4 relative">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">الجولة: </span><span className="text-base font-bold text-amber-400">{state.round}/{state.maxRounds}</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">⭐ النقاط: </span><span className="text-base font-bold text-cyan-300">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className={`w-full rounded-xl border px-6 py-4 text-center relative ${isDrawer ? "border-amber-500/20 bg-amber-500/10" : "border-cyan-500/20 bg-cyan-500/10"}`}>
        {isDrawer ? <p className="text-xl">أنت الراسم 🎨 — ارسم: <span className="font-bold text-amber-300">{state.prompt}</span></p> : <p className="text-xl">الراسم الآن: <span className="font-bold text-cyan-300">{drawerName}</span> 🤔 ما الذي يُرسم؟</p>}
      </div>
      {isDrawer ? (
        <>
          <div className="flex gap-3">{COLORS.map((c) => <button key={c} onClick={() => setBrushColor(c)} className={`h-11 w-11 cursor-pointer rounded-full border-2 transition-all ${brushColor === c ? "border-white scale-125" : "border-transparent opacity-60 hover:opacity-100"}`} style={{ backgroundColor: c }} />)}</div>
          <canvas ref={canvasRef} width={560} height={380} className="w-full max-w-xl cursor-crosshair rounded-xl border border-white/10 bg-slate-800" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          <button onClick={endRound} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-amber-500/25 hover:brightness-110">إنهاء الجولة 🎬</button>
        </>
      ) : (
        <>
          {state.drawingData && <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-1"><img src={state.drawingData} alt="رسم" className="rounded-lg max-w-full" /></div>}
          <div className="flex w-full gap-3">
            <input type="text" value={state.guess || ""} onChange={(e) => broadcast({ ...state, guess: e.target.value })} placeholder="اكتب تخمينك..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-slate-500 outline-none focus:border-cyan-500" />
            <button onClick={submitGuess} disabled={!state.guess} className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40">حزّر</button>
          </div>
          {state.message && <div className="rounded-xl px-4 py-2 text-base font-bold bg-white/5 text-slate-300">{state.message}</div>}
        </>
      )}
    </div>
  );
}