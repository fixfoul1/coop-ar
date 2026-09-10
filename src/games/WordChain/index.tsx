import { useState, useCallback, useEffect, useRef } from "react";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { RoomLobby } from "../../components/RoomLobby";
import { usePeerConnection } from "../../hooks/usePeerConnection";
import { ARABIC_CATEGORIES, getCategoryWord, getLettersForWord } from "./dictionary";

type GamePhase = "lobby" | "playing" | "result";

interface GameState {
  phase: GamePhase;
  category: string;
  targetWord: string;
  letters: string[];
  selectedIndices: number[];
  currentWord: string;
  score: number;
  timeLeft: number;
  round: number;
  message: string;
}

const INITIAL_STATE: GameState = {
  phase: "lobby",
  category: "",
  targetWord: "",
  letters: [],
  selectedIndices: [],
  currentWord: "",
  score: 0,
  timeLeft: 90,
  round: 1,
  message: "",
};

interface WordChainProps {
  username: string;
  onBack: () => void;
}

export function WordChain({ username: _username, onBack }: WordChainProps) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    const cat = getCategoryWord(Object.keys(ARABIC_CATEGORIES)[Math.floor(Math.random() * Object.keys(ARABIC_CATEGORIES).length)]);
    const categoryKey = Object.keys(ARABIC_CATEGORIES).find((k) =>
      ARABIC_CATEGORIES[k].includes(cat!)
    )!;
    const word = getCategoryWord(categoryKey)!;
    const letters = getLettersForWord(word, 5);

    const newState: GameState = {
      phase: "playing",
      category: categoryKey,
      targetWord: word,
      letters,
      selectedIndices: [],
      currentWord: "",
      score: 0,
      timeLeft: 90,
      round: 1,
      message: "",
    };
    setState(newState);
    sendData({ type: "game-start", state: newState });
  }, [sendData]);

  const handleData = useCallback(
    (data: unknown) => {
      const msg = data as { type: string; state?: GameState; index?: number; word?: string };
      if (msg.type === "game-start" && msg.state) {
        setState(msg.state);
      } else if (msg.type === "select-letter" && msg.index !== undefined) {
        setState((prev) => {
          if (prev.selectedIndices.includes(msg.index!)) return prev;
          const newSelected = [...prev.selectedIndices, msg.index!];
          const newWord = newSelected.map((i) => prev.letters[i]).join("");
          return { ...prev, selectedIndices: newSelected, currentWord: newWord };
        });
      } else if (msg.type === "submit-word" && msg.word) {
        setState((prev) => {
          if (prev.targetWord === msg.word) {
            return { ...prev, score: prev.score + 10, message: "صحيح!", currentWord: "", selectedIndices: [] };
          }
          return { ...prev, message: "خطأ! حاول مرة أخرى", currentWord: "", selectedIndices: [] };
        });
      } else if (msg.type === "timer-tick") {
        setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }
    },
    []
  );

  useEffect(() => {
    if (state.phase === "playing" && state.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, phase: "result" };
          }
          if (isHost && prev.timeLeft % 5 === 0) {
            sendData({ type: "timer-tick" });
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase, isHost, sendData]);

  const selectLetter = (index: number) => {
    if (state.selectedIndices.includes(index)) return;
    const newSelected = [...state.selectedIndices, index];
    const newWord = newSelected.map((i) => state.letters[i]).join("");
    setState((prev) => ({ ...prev, selectedIndices: newSelected, currentWord: newWord }));
    sendData({ type: "select-letter", index });
  };

  const submitWord = () => {
    if (!state.currentWord) return;
    if (state.currentWord === state.targetWord) {
      setState((prev) => ({
        ...prev,
        score: prev.score + 10,
        message: "صحيح! +10 نقاط",
        currentWord: "",
        selectedIndices: [],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        message: "غير صحيح! حاول مرة أخرى",
        currentWord: "",
        selectedIndices: [],
      }));
    }
    sendData({ type: "submit-word", word: state.currentWord });
  };

  const clearSelection = () => {
    setState((prev) => ({ ...prev, currentWord: "", selectedIndices: [] }));
  };

  const handleCreateRoom = () => createRoom(handleData);
  const handleJoinRoom = (code: string) => joinRoom(code, handleData);
  const handleBack = () => { disconnect(); onBack(); };

  if (state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center">
          <div className="mb-2 text-5xl">🔤</div>
          <h2 className="text-2xl font-bold text-violet-300">سلسلة الكلمات</h2>
        </div>
        <p className="text-center text-sm text-slate-400">
          تعاونوا لتكوين كلمات عربية من الحروف المتاحة
        </p>
        <ConnectionStatus status={status} />
        <RoomLobby isHost={isHost} roomCode={roomCode} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        {roomCode && status === "connected" && isHost && (
          <button
            onClick={startGame}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110"
          >
            ابدأ اللعبة
          </button>
        )}
        {roomCode && status === "connected" && !isHost && (
          <p className="animate-pulse text-sm text-violet-400">
            في انتظار المضيف لبدء اللعبة...
          </p>
        )}
        <button
          onClick={handleBack}
          className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          رجوع
        </button>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-violet-400 to-cyan-400">
          انتهت اللعبة!
        </h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <p className="text-sm text-slate-400">النتيجة النهائية</p>
          <p className="my-2 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-500">
            {state.score}
          </p>
          <p className="text-sm text-slate-400">
            الكلمة كانت: <span className="font-bold text-violet-300">{state.targetWord}</span>
          </p>
        </div>
        <button
          onClick={handleBack}
          className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm text-slate-400">الوقت: </span>
          <span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
            {state.timeLeft}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm text-slate-400">النقاط: </span>
          <span className="font-bold text-amber-400">{state.score}</span>
        </div>
      </div>

      <div className="w-full rounded-xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 text-center">
        <p className="text-xs text-violet-300/70">الفئة</p>
        <p className="text-xl font-bold text-violet-300">{state.category}</p>
      </div>

      {state.message && (
        <div
          className={`w-full rounded-xl px-4 py-3 text-center text-sm font-bold backdrop-blur-sm ${
            state.message.includes("صحيح")
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="min-h-[3.5rem] w-full rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center">
        <p className="text-2xl font-bold tracking-wider text-cyan-300">
          {state.currentWord || "···"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {state.letters.map((letter, i) => (
          <button
            key={i}
            onClick={() => selectLetter(i)}
            disabled={state.selectedIndices.includes(i)}
            className={`h-14 w-14 cursor-pointer rounded-xl text-lg font-bold transition-all ${
              state.selectedIndices.includes(i)
                ? "cursor-not-allowed border border-violet-500/30 bg-violet-500/20 text-violet-300 opacity-40"
                : "border border-white/10 bg-white/5 text-white hover:border-violet-500/40 hover:bg-violet-500/10 hover:scale-110"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={clearSelection}
          className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          مسح
        </button>
        <button
          onClick={submitWord}
          disabled={!state.currentWord}
          className="cursor-pointer rounded-xl bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-2 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          تأكيد
        </button>
      </div>
    </div>
  );
}
