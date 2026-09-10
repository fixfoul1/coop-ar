import { useEffect, useRef } from "react";

function genMaze(size: number) {
  const n = size % 2 === 0 ? size + 1 : size;
  const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(true));
  const vis: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  function dfs(x: number, y: number) { vis[y][x] = true; grid[y][x] = false; [[0,-2],[0,2],[-2,0],[2,0]].sort(() => Math.random()-0.5).forEach(([dx,dy]) => { const nx=x+dx, ny=y+dy; if (nx>=0&&nx<n&&ny>=0&&ny<n&&!vis[ny][nx]) { grid[y+dy/2][x+dx/2]=false; dfs(nx,ny); } }); }
  dfs(1,1);
  const walls: {x:number;y:number}[] = []; const wc = Math.floor(n*n/6);
  for (let i=0;i<wc;i++) { const x=Math.floor(Math.random()*n), y=Math.floor(Math.random()*n); if (!grid[y][x]&&!(x===1&&y===1)&&!(x===n-2&&y===n-2)) walls.push({x,y}); }
  return { width: n, height: n, walls, start: {x:1,y:1}, end: {x:n-2,y:n-2}, hostBlocked: walls };
}

interface Props { pc: any; state: any; broadcast: (s: any) => void; }

export function MazeRunner({ state, broadcast, pc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startGame = () => broadcast({ phase: "playing", level: genMaze(9), playerX: 1, playerY: 1, endX: 7, endY: 7, timeLeft: 120, currentLevel: 1, scores: new Array(pc.players.length).fill(0), started: true });

  const move = (dir: string) => {
    if (!state) return;
    let nx = state.playerX, ny = state.playerY;
    if (dir === "up") ny--; else if (dir === "down") ny++; else if (dir === "left") nx--; else if (dir === "right") nx++;
    if (nx >= 0 && nx < state.level.width && ny >= 0 && ny < state.level.height && !state.level.walls[ny][nx] && !state.level.hostBlocked.some((b: any) => b.x === nx && b.y === ny)) {
      let newState = { ...state, playerX: nx, playerY: ny };
      if (nx === state.endX && ny === state.endY) { newState.currentLevel++; const nl = genMaze(9 + Math.min(newState.currentLevel * 2, 8)); newState.level = nl; newState.playerX = nl.start.x; newState.playerY = nl.start.y; newState.endX = nl.end.x; newState.endY = nl.end.y; }
      broadcast(newState);
    }
  };

  if (!state || state.phase === "lobby" || state.phase === "result") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center"><div className="mb-2 text-5xl">🏰</div><h2 className="text-2xl font-bold text-amber-300">لعبة المتاهة</h2></div>
        <p className="text-center text-sm text-slate-400">L1 يرى الخريطة — L2 يتحرك</p>
        {pc.isHost && pc.roomCode && pc.status === "connected" && <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 font-bold text-white shadow-lg shadow-amber-500/25 hover:brightness-110">ابدأ اللعبة</button>}
        {!pc.isHost && pc.roomCode && pc.status === "connected" && <p className="animate-pulse text-sm text-amber-400">في انتظار المضيف...</p>}
      </div>
    );
  }

  useEffect(() => {
    if (!state?.started || !canvasRef.current) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const lv = state.level; const cs = Math.min(Math.floor(canvas.width / lv.width), Math.floor(canvas.height / lv.height));
    const ox = Math.floor((canvas.width - cs * lv.width) / 2); const oy = Math.floor((canvas.height - cs * lv.height) / 2);
    ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < lv.height; y++) for (let x = 0; x < lv.width; x++) {
      const sx = ox + x*cs, sy = oy + y*cs;
      if (lv.hostBlocked.some((b: any) => b.x === x && b.y === y)) { ctx.fillStyle = "rgba(139,92,246,.15)"; ctx.fillRect(sx, sy, cs, cs); }
      else if (lv.walls[y][x]) { ctx.fillStyle = "#312e81"; ctx.fillRect(sx, sy, cs, cs); }
      else { ctx.fillStyle = "rgba(30,27,75,.5)"; ctx.fillRect(sx, sy, cs, cs); }
    }
    const eg = ctx.createRadialGradient(ox+state.endX*cs+cs/2, oy+state.endY*cs+cs/2, 0, ox+state.endX*cs+cs/2, oy+state.endY*cs+cs/2, cs*1.5);
    eg.addColorStop(0, "rgba(16,185,129,.8)"); eg.addColorStop(1, "rgba(16,185,129,0)");
    ctx.fillStyle = eg; ctx.fillRect(ox+state.endX*cs-cs, oy+state.endY*cs-cs, cs*3, cs*3);
    ctx.fillStyle = "#10b981"; ctx.fillRect(ox+state.endX*cs+cs*.2, oy+state.endY*cs+cs*.2, cs*.6, cs*.6);
    const pg = ctx.createRadialGradient(ox+state.playerX*cs+cs/2, oy+state.playerY*cs+cs/2, 0, ox+state.playerX*cs+cs/2, oy+state.playerY*cs+cs/2, cs*2);
    pg.addColorStop(0, "rgba(99,102,241,.6)"); pg.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = pg; ctx.fillRect(ox+state.playerX*cs-cs*1.5, oy+state.playerY*cs-cs*1.5, cs*4, cs*4);
    ctx.fillStyle = "#818cf8"; ctx.fillRect(ox+state.playerX*cs+cs*.15, oy+state.playerY*cs+cs*.15, cs*.7, cs*.7);
  }, [state]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">⏱ الوقت: </span><span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>{state.timeLeft}</span></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"><span className="text-sm">المستوى: </span><span className="font-bold text-amber-400">{state.currentLevel}/5</span></div></div>
      <div className={`w-full rounded-xl border px-6 py-3 text-center ${pc.isHost ? "border-violet-500/20 bg-violet-500/10" : "border-amber-500/20 bg-amber-500/10"}`}><p className={`text-sm ${pc.isHost ? "text-violet-300" : "text-amber-300"}`}>{pc.isHost ? "👑 أنت المضيف: تُشوف الخريطة وجّه صديقك!" : "🕹️ أنت المتحرك: تحرك نحو النقطة الخضراء"}</p></div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-1"><canvas ref={canvasRef} width={400} height={400} className="rounded-lg" /></div>
      <div className="grid grid-cols-3 gap-2"><div /> <button onClick={() => move("up")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white hover:border-amber-500/40 hover:scale-110">↑</button> <div /> <button onClick={() => move("left")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white hover:border-amber-500/40 hover:scale-110">←</button> <button onClick={() => move("down")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white hover:border-amber-500/40 hover:scale-110">↓</button> <button onClick={() => move("right")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white hover:border-amber-500/40 hover:scale-110">→</button></div>
    </div>
  );
}

