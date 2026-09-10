import { useEffect, useRef } from "react";

interface Cell { x: number; y: number; }

function genMaze(size: number) {
  const n = size % 2 === 0 ? size + 1 : size;
  const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(true));
  const vis: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const carve = (ax: number, ay: number, bx: number, by: number) => { grid[(ay + by) / 2][(ax + bx) / 2] = false; };
  function dfs(x: number, y: number) {
    vis[y][x] = true; grid[y][x] = false;
    [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5).forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < n && !vis[ny][nx]) { carve(x, y, nx, ny); dfs(nx, ny); }
    });
  }
  dfs(1, 1);
  const walls: Cell[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (grid[y][x]) walls.push({ x, y });
  const traps: Cell[] = [];
  let tries = n * n;
  while (traps.length < Math.max(3, Math.floor((n * n) / 14)) && tries > 0) {
    tries--;
    const x = 1 + Math.floor(Math.random() * (n - 2)), y = 1 + Math.floor(Math.random() * (n - 2));
    if (grid[y][x]) continue;
    if (x === 1 && y === 1) continue;
    if (x === n - 2 && y === n - 2) continue;
    if (Math.abs(x - 1) + Math.abs(y - 1) <= 2) continue;
    if (!traps.some((t) => t.x === x && t.y === y)) traps.push({ x, y });
  }
  return { width: n, height: n, walls, traps, start: { x: 1, y: 1 } as Cell, end: { x: n - 2, y: n - 2 } as Cell };
}

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function MazeRunner({ state, broadcast, pc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const len = Math.max(1, (pc.players || []).length);
  const isGuide = pc.isHost;
  const me = pc.playerIdx;

  useEffect(() => {
    if (!canvasRef.current || !state || state.phase !== "playing") return;
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const lv = state.level;
    if (!lv) return;
    const cs = Math.min(Math.floor(canvas.width / lv.width), Math.floor(canvas.height / lv.height));
    const ox = Math.floor((canvas.width - cs * lv.width) / 2); const oy = Math.floor((canvas.height - cs * lv.height) / 2);
    ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < lv.height; y++) for (let x = 0; x < lv.width; x++) {
      const sx = ox + x * cs, sy = oy + y * cs;
      const isWall = lv.walls.some((w: Cell) => w.x === x && w.y === y);
      const isTrap = lv.traps.some((t: Cell) => t.x === x && t.y === y);
      let visible = isGuide;
      if (!isGuide && Math.abs(x - state.playerX) + Math.abs(y - state.playerY) <= 2) visible = true;
      if (!visible) { ctx.fillStyle = "#050510"; ctx.fillRect(sx, sy, cs, cs); continue; }
      if (isWall) { ctx.fillStyle = "#312e81"; ctx.fillRect(sx, sy, cs, cs); }
      else if (isTrap) { ctx.fillStyle = "rgba(217,70,239,.35)"; ctx.fillRect(sx, sy, cs, cs); }
      else { ctx.fillStyle = "rgba(30,27,75,.5)"; ctx.fillRect(sx, sy, cs, cs); }
    }
    const eg = ctx.createRadialGradient(ox + lv.end.x * cs + cs / 2, oy + lv.end.y * cs + cs / 2, 0, ox + lv.end.x * cs + cs / 2, oy + lv.end.y * cs + cs / 2, cs * 1.5);
    eg.addColorStop(0, "rgba(16,185,129,.8)"); eg.addColorStop(1, "rgba(16,185,129,0)");
    ctx.fillStyle = eg; ctx.fillRect(ox + lv.end.x * cs - cs, oy + lv.end.y * cs - cs, cs * 3, cs * 3);
    ctx.fillStyle = "#10b981"; ctx.fillRect(ox + lv.end.x * cs + cs * .2, oy + lv.end.y * cs + cs * .2, cs * .6, cs * .6);
    const pg = ctx.createRadialGradient(ox + state.playerX * cs + cs / 2, oy + state.playerY * cs + cs / 2, 0, ox + state.playerX * cs + cs / 2, oy + state.playerY * cs + cs / 2, cs * 2);
    pg.addColorStop(0, "rgba(99,102,241,.6)"); pg.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = pg; ctx.fillRect(ox + state.playerX * cs - cs * 1.5, oy + state.playerY * cs - cs * 1.5, cs * 4, cs * 4);
    ctx.fillStyle = "#818cf8"; ctx.fillRect(ox + state.playerX * cs + cs * .15, oy + state.playerY * cs + cs * .15, cs * .7, cs * .7);
  }, [state, isGuide]);

  const startGame = () => {
    const level = genMaze(9);
    broadcast({ phase: "playing", level, playerX: 1, playerY: 1, currentLevel: 1, scores: new Array(len).fill(0), message: "" });
  };

  const blocked = (x: number, y: number) =>
    state && (state.level.walls.some((w: Cell) => w.x === x && w.y === y) || state.level.traps.some((t: Cell) => t.x === x && t.y === y));

  const move = (dir: string) => {
    if (!state || isGuide) return;
    let nx = state.playerX, ny = state.playerY;
    if (dir === "up") ny--; else if (dir === "down") ny++; else if (dir === "left") nx--; else if (dir === "right") nx++;
    if (nx < 0 || nx >= state.level.width || ny < 0 || ny >= state.level.height) return;
    if (blocked(nx, ny)) { broadcast({ ...state, message: "🚧 محجوب — جرّب اتجاه ثاني" }); return; }
    let next = { ...state, playerX: nx, playerY: ny, message: "" };
    if (nx === state.level.end.x && ny === state.level.end.y) {
      const scores = [...(state.scores || [])]; while (scores.length <= me) scores.push(0);
      scores[me] += 5;
      if (state.currentLevel >= 5) { broadcast({ ...next, scores, phase: "result" }); return; }
      const nl = genMaze(9 + Math.min(state.currentLevel * 2, 8));
      next = { ...state, level: nl, playerX: nl.start.x, playerY: nl.start.y, currentLevel: state.currentLevel + 1, scores, message: `🏁 وصلتوا للمستوى ${state.currentLevel + 1}!` };
    }
    broadcast(next);
  };

  if (!state || state.phase === "lobby") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-2 right-4 text-4xl animate-float opacity-25 select-none">🏰</span>
          <span className="absolute bottom-4 left-5 text-4xl animate-float opacity-25 select-none" style={{ animationDelay: "-1.5s" }}>🟢</span>
          <span className="absolute top-1/2 left-8 text-3xl animate-spin-slow opacity-15 select-none">🗺️</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
        </div>
        <div className="text-center relative"><div className="mb-2 text-6xl animate-pop">🏰</div><h2 className="text-3xl font-bold text-amber-300">لعبة المتاهة</h2></div>
        <p className="text-center text-base text-slate-400">المضيف يوجّه والمتحرك يمشي — 5 مستويات</p>
        {isGuide && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-amber-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!isGuide && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-base text-amber-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-3 left-6 text-4xl animate-float opacity-25 select-none">🏆</span>
          <span className="absolute bottom-5 right-5 text-4xl animate-spin-slow opacity-20 select-none">✨</span>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-400">أكملتو المتاهة! 🏆</h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><p className="text-sm text-slate-400">النتيجة</p><p className="my-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-500">{state.scores?.join(" - ") || "0"}</p></div>
        {isGuide && <button onClick={() => broadcast({ phase: "lobby" })} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:brightness-110">إعادة اللعب</button>}
      </div>
    );
  }

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-2 right-3 text-3xl animate-float opacity-20 select-none">🏰</span>
        <span className="absolute bottom-12 left-2 text-3xl animate-spin-slow opacity-15 select-none">🗺️</span>
        <span className="absolute top-24 left-6 text-2xl animate-float opacity-15 select-none" style={{ animationDelay: "-2s" }}>✦</span>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />
      </div>
      <div className="flex gap-4 relative">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">المستوى: </span><span className="text-base font-bold text-amber-400">{state.currentLevel}/5</span></div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-base">⭐ النقاط: </span><span className="text-base font-bold text-emerald-400">{state.scores?.join(" - ") || "0"}</span></div>
      </div>
      <div className={`w-full rounded-xl border px-6 py-3 text-center relative ${isGuide ? "border-violet-500/20 bg-violet-500/10" : "border-amber-500/20 bg-amber-500/10"}`}>
        <p className={`text-base ${isGuide ? "text-violet-300" : "text-amber-300"}`}>{isGuide ? "👑 أنت الموجّه: تشوف كل الخريطة والفخاخ اللي بـ 🟣 — وجّه صديقك للهدف الأخضر!" : "🕹️ أنت المتحرك: ما تشوف إلا حولك بس — اسمع توجيهات الموجّه!"}</p>
      </div>
      {state.message && <div className="rounded-xl px-4 py-2 text-base font-bold bg-white/5 text-slate-300">{state.message}</div>}
      <div className="rounded-xl border border-white/10 bg-white/5 p-1"><canvas ref={canvasRef} width={520} height={520} className="w-full max-w-xl rounded-lg" /></div>
      {isGuide ? (
        <p className="text-sm text-slate-500">التحكم عند صديقك المتحرك — وجّهه بالصوت 👂</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button onClick={() => move("up")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-2xl text-white transition-all hover:border-amber-500/40 hover:scale-110 active:scale-95">↑</button>
          <div />
          <button onClick={() => move("left")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-2xl text-white transition-all hover:border-amber-500/40 hover:scale-110 active:scale-95">←</button>
          <button onClick={() => move("down")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-2xl text-white transition-all hover:border-amber-500/40 hover:scale-110 active:scale-95">↓</button>
          <button onClick={() => move("right")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-2xl text-white transition-all hover:border-amber-500/40 hover:scale-110 active:scale-95">→</button>
        </div>
      )}
    </div>
  );
}