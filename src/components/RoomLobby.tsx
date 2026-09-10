import { useState } from "react";

interface Props { roomCode: string | null; onCreateRoom: () => void; onJoinRoom: (code: string) => void; }

export function RoomLobby({ roomCode, onCreateRoom, onJoinRoom }: Props) {
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { if (roomCode) { navigator.clipboard.writeText(roomCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } };
  if (roomCode) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
        <p className="mb-2 text-sm text-slate-400">كود الغرفة</p>
        <button onClick={handleCopy} className="mb-4 w-full cursor-pointer select-none rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 font-mono text-2xl font-bold text-violet-300 transition-all hover:bg-violet-500/20 hover:scale-[1.02]">{roomCode}</button>
        <p className="text-xs text-slate-500">{copied ? "تم النسخ!" : "اضغط للنسخ — شاركه مع صديقك"}</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-md space-y-4">
      <button onClick={onCreateRoom} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110">إنشاء غرفة جديدة</button>
      <div className="flex items-center gap-3">
        <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="أدخل كود الغرفة"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all" />
        <button onClick={() => { if (joinCode.trim()) onJoinRoom(joinCode.trim()); }} disabled={!joinCode.trim()}
          className="cursor-pointer rounded-lg bg-gradient-to-l from-emerald-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">انضم</button>
      </div>
    </div>
  );
}
