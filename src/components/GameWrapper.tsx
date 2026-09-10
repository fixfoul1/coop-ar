import { useState, useCallback, useMemo, useEffect } from "react";
import { WordChain } from "../games/WordChain";
import { DrawingRelay } from "../games/DrawingRelay";
import { MazeRunner } from "../games/MazeRunner";
import { ColorMatch } from "../games/ColorMatch";
import { SimonSays } from "../games/SimonSays";
import { RoomLobby } from "./RoomLobby";
import { ConnectionStatus } from "./ConnectionStatus";

interface Props { game: string; username: string; pc: any; onBack: () => void; }

const TITLES: Record<string, string> = { "word-chain": "سلسلة الكلمات", "drawing-relay": "رسم بالتناوب", "maze-runner": "لعبة المتاهة", "color-match": "تطابق الألوان", "simon-says": "سايمون يقول" };
const EMOJIS: Record<string, string> = { "word-chain": "🔤", "drawing-relay": "🎨", "maze-runner": "🏰", "color-match": "🎯", "simon-says": "🧠" };

export function GameWrapper({ game, pc, onBack }: Props) {
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState("");

  const broadcast = useCallback((d: any) => pc.sendAll(d), [pc]);

  const handleData = useCallback((data: any) => {
    if (data && typeof data === "object" && data.type) return;
    setState(data);
  }, []);

  const GameComponent = useMemo(() => {
    switch (game) {
      case "word-chain": return WordChain;
      case "drawing-relay": return DrawingRelay;
      case "maze-runner": return MazeRunner;
      case "color-match": return ColorMatch;
      case "simon-says": return SimonSays;
      default: return null;
    }
  }, [game]);

  useEffect(() => { setError(""); }, [pc.status]);

  if (!pc.roomCode) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <div className="text-center">
          <div className="mb-2 text-5xl animate-float">{EMOJIS[game] || "🎮"}</div>
          <h2 className="mb-1 text-2xl font-bold text-violet-300">{TITLES[game] || game}</h2>
          <p className="text-sm text-slate-400">لعبة تعاونية — حتى 6 لاعبين</p>
        </div>
        <RoomLobby roomCode={null} onCreateRoom={() => { setError(""); pc.createRoom(handleData); }} onJoinRoom={(c) => { setError(""); pc.joinRoom(c, handleData); }} />
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <button onClick={onBack} className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-400 hover:bg-slate-700">رجوع</button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-lg items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-violet-300">{EMOJIS[game]} {TITLES[game]}</h2>
        <ConnectionStatus status={pc.status} />
      </div>
      <RoomLobby roomCode={pc.roomCode} onCreateRoom={() => {}} onJoinRoom={() => {}} />
      {pc.status === "connecting" && <p className="animate-pulse text-sm text-amber-400">جارٍ الاتصال...</p>}
      {pc.status === "error" && <p className="text-sm text-red-400">فشل الاتصال — تحقق من الكود</p>}
      {pc.status === "connected" && GameComponent && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pc.players.map((p: any, i: number) => (
              <span key={i} className={`rounded-full border px-3 py-1 text-xs ${i === 0 ? "border-violet-500/40 bg-violet-500/10 text-violet-300" : "border-white/10 bg-white/5 text-slate-300"}`}>{p.name}{i === 0 && " 👑"}</span>
            ))}
          </div>
          <GameComponent state={state} broadcast={broadcast} pc={pc} />
        </div>
      )}
    </div>
  );
}