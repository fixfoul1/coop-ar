import { useState, useCallback, useEffect, useRef } from "react";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { RoomLobby } from "../../components/RoomLobby";
import { usePeerConnection } from "../../hooks/usePeerConnection";
import { getRandomPrompt } from "./prompts";

type Phase = "lobby" | "drawing" | "guessing" | "result";
type Role = "draw" | "guess";

interface DrawingRelayState {
  phase: Phase;
  role: Role;
  prompt: string;
  guess: string;
  drawingData: string | null;
  round: number;
  maxRounds: number;
  history: { prompt: string; guess: string }[];
  timeLeft: number;
  message: string;
}

const INITIAL_STATE: DrawingRelayState = {
  phase: "lobby",
  role: "draw",
  prompt: "",
  guess: "",
  drawingData: null,
  round: 1,
  maxRounds: 3,
  history: [],
  timeLeft: 30,
  message: "",
};

interface DrawingRelayProps {
  username: string;
  onBack: () => void;
}

export function DrawingRelay({ username: _username, onBack }: DrawingRelayProps) {
  const [state, setState] = useState<DrawingRelayState>(INITIAL_STATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);

  const {
    status,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    sendData,
    disconnect,
  } = usePeerConnection();

  const startGame = useCallback(() => {
    const prompt = getRandomPrompt();
    const newState: DrawingRelayState = {
      phase: "drawing",
      role: "draw",
      prompt,
      guess: "",
      drawingData: null,
      round: 1,
      maxRounds: 3,
      history: [],
      timeLeft: 30,
      message: "",
    };
    setState(newState);
    sendData({ type: "game-start", state: newState });
  }, [sendData]);

  const handleData = useCallback((data: unknown) => {
    const msg = data as {
      type: string;
      state?: DrawingRelayState;
      drawingData?: string;
      guess?: string;
      prompt?: string;
    };
    if (msg.type === "game-start" && msg.state) {
      setState(msg.state);
    } else if (msg.type === "drawing" && msg.drawingData) {
      setState((prev) => ({ ...prev, drawingData: msg.drawingData! }));
    } else if (msg.type === "submit-guess" && msg.guess) {
      setState((prev) => ({
        ...prev,
        guess: msg.guess!,
        phase: prev.role === "draw" ? "guessing" : "drawing",
      }));
    } else if (msg.type === "next-round" && msg.state) {
      setState(msg.state);
    } else if (msg.type === "timer-tick") {
      setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }
  }, []);

  useEffect(() => {
    if (state.phase === "drawing" || state.phase === "guessing") {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase, state.role]);

  const getCanvasPos = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
  };

  const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    const last = lastPosRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPosRef.current = pos;
    const data = canvasRef.current.toDataURL();
    sendData({ type: "drawing", drawingData: data });
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const submitGuess = () => {
    if (!state.guess) return;
    sendData({ type: "submit-guess", guess: state.guess });
    const newHistory = [...state.history, { prompt: state.prompt, guess: state.guess }];
    if (state.round >= state.maxRounds) {
      setState((prev) => ({ ...prev, phase: "result", history: newHistory }));
    } else {
      const nextPrompt = getRandomPrompt();
      setState((prev) => {
        const newState: DrawingRelayState = {
          ...prev,
          phase: "drawing",
          role: prev.role === "draw" ? "guess" : "draw",
          prompt: nextPrompt,
          guess: "",
          drawingData: null,
          round: prev.round + 1,
          history: newHistory,
          timeLeft: 30,
          message: "",
        };
        sendData({ type: "next-round", state: newState });
        return newState;
      });
    }
  };

  const handleCreateRoom = () => createRoom(handleData);
  const handleJoinRoom = (code: string) => joinRoom(code, handleData);
  const handleBack = () => { disconnect(); onBack(); };

  if (state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center">
          <div className="mb-2 text-5xl">🎨</div>
          <h2 className="text-2xl font-bold text-cyan-300">رسم بالتناوب</h2>
        </div>
        <p className="text-center text-sm text-slate-400">
          واحد يرسم والآخر يخمن — كرر 3 مرات
        </p>
        <ConnectionStatus status={status} />
        <RoomLobby isHost={isHost} roomCode={roomCode} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        {roomCode && status === "connected" && isHost && (
          <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-cyan-600 to-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110">
            ابدأ اللعبة
          </button>
        )}
        {roomCode && status === "connected" && !isHost && (
          <p className="animate-pulse text-sm text-cyan-400">في انتظار المضيف...</p>
        )}
        <button onClick={handleBack} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
          رجوع
        </button>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-400">
          انتهت اللعبة!
        </h2>
        <div className="w-full space-y-3">
          {state.history.map((h, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="mb-1 text-xs text-slate-500">الجولة {i + 1}</p>
              <p className="text-sm">الملاحظة: <span className="font-bold text-amber-400">{h.prompt}</span></p>
              <p className="text-sm">التخمين: <span className="font-bold text-cyan-400">{h.guess}</span></p>
            </div>
          ))}
        </div>
        <button onClick={handleBack} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110">
          العودة للقائمة
        </button>
      </div>
    );
  }

  const COLORS = ["#ffffff", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#ec4899", "#f97316"];

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm text-slate-400">الوقت: </span>
          <span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>{state.timeLeft}</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm text-slate-400">الجولة: </span>
          <span className="font-bold text-amber-400">{state.round}/{state.maxRounds}</span>
        </div>
      </div>

      <div className={`w-full rounded-xl border px-6 py-3 text-center ${
        state.role === "draw"
          ? "border-amber-500/20 bg-amber-500/10"
          : "border-cyan-500/20 bg-cyan-500/10"
      }`}>
        {state.role === "draw" ? (
          <p className="text-lg">ارسم: <span className="font-bold text-amber-300">{state.prompt}</span></p>
        ) : (
          <p className="text-lg text-cyan-300">ما الذي يُرسم؟</p>
        )}
      </div>

      {state.role === "draw" ? (
        <>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setBrushColor(c)}
                className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-all ${
                  brushColor === c ? "border-white scale-125 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-xs text-slate-400">الحجم:</span>
            <input
              type="range"
              min={2}
              max={12}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-28 accent-cyan-500"
            />
          </div>
        </>
      ) : (
        state.drawingData && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-1">
            <img src={state.drawingData} alt="الرسم" className="rounded-lg" />
          </div>
        )
      )}

      {state.role === "draw" && (
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="cursor-crosshair rounded-xl border border-white/10 bg-slate-800"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      )}

      {state.role === "guess" && (
        <div className="flex w-full gap-3">
          <input
            type="text"
            value={state.guess}
            onChange={(e) => setState((prev) => ({ ...prev, guess: e.target.value }))}
            placeholder="اكتب تخمينك..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
          />
          <button
            onClick={submitGuess}
            disabled={!state.guess}
            className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            تأكيد
          </button>
        </div>
      )}

      {state.role === "draw" && (
        <button onClick={clearCanvas} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
          مسح اللوحة
        </button>
      )}

      <button onClick={handleBack} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
        رجوع
      </button>
    </div>
  );
}
