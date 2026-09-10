import { useState, useRef } from "react";
const PROMPTS = ["قطة", "شمس", "بيت", "شجرة", "سيارة", "سمكة", "قمر", "نافذة", "باب", "ساعة", "مفتاح", "طائرة", "جبل", "نهر", "مطر"];

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function DrawingRelay({ state, broadcast, pc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
const [brushColor, setBrushColor] = useState("#fff");
  const brushSize = 4;

  const startGame = () => {
    broadcast({ phase: "playing", prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)], role: pc.isHost ? "draw" : "guess", round: 1, maxRounds: 3, history: [], scores: new Array(pc.players.length).fill(0), timeLeft: 30, message: "", drawingData: null });
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

  const submitGuess = () => {
    if (!state?.guess) return;
    const newHistory = [...(state.history || []), { prompt: state.prompt, guess: state.guess }];
    if (state.round >= state.maxRounds) { broadcast({ ...state, phase: "result", history: newHistory }); }
    else { broadcast({ ...state, phase: "draw", role: state.role === "draw" ? "guess" : "draw", prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)], round: state.round + 1, history: newHistory, timeLeft: 30, guess: "", drawingData: null }); }
  };

  const COLORS = ["#fff", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

  if (!state || state.phase === "lobby" || state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🎨</div><h2 className="text-2xl font-bold text-cyan-300">رسم بالتناوب</h2></div>
        <p className="text-center text-sm text-slate-400">واحد يرسم والآخر يخمن — 3 جولات</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-cyan-600 to-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-cyan-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⏱ الوقت: </span><span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>{state.timeLeft}</span></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">الجولة: </span><span className="font-bold text-amber-400">{state.round}/{state.maxRounds}</span></div></div>
      <div className={`w-full rounded-xl border px-6 py-3 text-center ${state.role === "draw" ? "border-amber-500/20 bg-amber-500/10" : "border-cyan-500/20 bg-cyan-500/10"}`}>{state.role === "draw" ? <p className="text-lg">ارسم: <span className="font-bold text-amber-300">{state.prompt}</span></p> : <p className="text-lg text-cyan-300">ما الذي يُرسم؟</p>}</div>
      {state.role === "draw" ? (
        <>
          <div className="flex gap-2">{COLORS.map((c) => <button key={c} onClick={() => setBrushColor(c)} className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-all ${brushColor === c ? "border-white scale-125" : "border-transparent opacity-60 hover:opacity-100"}`} style={{ backgroundColor: c }} />)}</div>
          <canvas ref={canvasRef} width={400} height={300} className="cursor-crosshair rounded-xl border border-white/10 bg-slate-800" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
        </>
      ) : (
        state.drawingData && <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-1"><img src={state.drawingData} alt="رسم" className="rounded-lg max-w-full" /></div>
      )}
      {state.role === "guess" && <div className="flex w-full gap-3"><input type="text" value={state.guess || ""} onChange={(e) => broadcast({ ...state, guess: e.target.value })} placeholder="اكتب تخمينك..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500" /><button onClick={submitGuess} disabled={!state.guess} className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40">تأكيد</button></div>}
    </div>
  );
}


