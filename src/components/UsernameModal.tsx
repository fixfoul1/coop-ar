import { useState } from "react";

interface Props { onSave: (name: string) => void; }

export function UsernameModal({ onSave }: Props) {
  const [input, setInput] = useState("");
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const t = input.trim(); if (t && t.length <= 20) onSave(t); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-4 text-center text-4xl">🎮</div>
        <h2 className="mb-2 text-center text-xl font-bold text-white">ما اسمك؟</h2>
        <p className="mb-6 text-center text-sm text-slate-400">اختر اسم مستخدم للعب</p>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="اسم المستخدم" maxLength={20} autoFocus
          className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all" />
        <button type="submit" disabled={!input.trim()}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-cyan-600 px-4 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">ابدأ اللعب</button>
      </form>
    </div>
  );
}
