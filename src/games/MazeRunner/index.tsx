import { useState, useCallback, useEffect, useRef } from "react";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { RoomLobby } from "../../components/RoomLobby";
import { usePeerConnection } from "../../hooks/usePeerConnection";
import { generateLevel, isHostBlocked, type MazeLevel } from "./levels";

type Phase = "lobby" | "playing" | "result";

interface MazeState {
  phase: Phase;
  level: MazeLevel;
  playerX: number;
  playerY: number;
  fogRadius: number;
  timeLeft: number;
  currentLevel: number;
  maxLevels: number;
  message: string;
  won: boolean;
}

function getInitialState(levelNum: number): MazeState {
  const level = generateLevel(levelNum);
  return {
    phase: "lobby",
    level,
    playerX: level.start.x,
    playerY: level.start.y,
    fogRadius: 3,
    timeLeft: 120,
    currentLevel: levelNum,
    maxLevels: 5,
    message: "",
    won: false,
  };
}

interface MazeRunnerProps {
  username: string;
  onBack: () => void;
}

export function MazeRunner({ username: _username, onBack }: MazeRunnerProps) {
  const [state, setState] = useState<MazeState>(getInitialState(1));
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const newState = getInitialState(1);
    newState.phase = "playing";
    setState(newState);
    sendData({ type: "game-start", state: newState });
  }, [sendData]);

  const handleData = useCallback((data: unknown) => {
    const msg = data as { type: string; state?: MazeState; direction?: string };
    if (msg.type === "game-start" && msg.state) {
      setState(msg.state);
    } else if (msg.type === "move" && msg.direction) {
      setState((prev) => {
        if (prev.phase !== "playing") return prev;
        const dir = msg.direction!;
        let nx = prev.playerX;
        let ny = prev.playerY;
        if (dir === "up") ny--;
        else if (dir === "down") ny++;
        else if (dir === "left") nx--;
        else if (dir === "right") nx++;

        if (
          nx >= 0 && nx < prev.level.width &&
          ny >= 0 && ny < prev.level.height &&
          !prev.level.walls[ny][nx] &&
          !isHostBlocked(prev.level, nx, ny)
        ) {
          return { ...prev, playerX: nx, playerY: ny };
        }
        return prev;
      });
    } else if (msg.type === "timer-tick") {
      setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }
  }, []);

  useEffect(() => {
    if (state.phase === "playing" && state.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, phase: "result", won: false };
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

  useEffect(() => {
    if (state.phase === "playing") {
      const handleKey = (e: KeyboardEvent) => {
        let dir: string | null = null;
        if (e.key === "ArrowUp" || e.key === "w") dir = "up";
        else if (e.key === "ArrowDown" || e.key === "s") dir = "down";
        else if (e.key === "ArrowLeft" || e.key === "a") dir = "left";
        else if (e.key === "ArrowRight" || e.key === "d") dir = "right";

        if (dir) {
          e.preventDefault();
          setState((prev) => {
            if (prev.phase !== "playing") return prev;
            let nx = prev.playerX;
            let ny = prev.playerY;
            if (dir === "up") ny--;
            else if (dir === "down") ny++;
            else if (dir === "left") nx--;
            else if (dir === "right") nx++;

            if (
              nx >= 0 && nx < prev.level.width &&
              ny >= 0 && ny < prev.level.height &&
              !prev.level.walls[ny][nx] &&
              !isHostBlocked(prev.level, nx, ny)
            ) {
              const newState = { ...prev, playerX: nx, playerY: ny };
              if (nx === prev.level.end.x && ny === prev.level.end.y) {
                if (prev.currentLevel >= prev.maxLevels) {
                  return { ...newState, phase: "result" as const, won: true };
                }
                const nextLevel = generateLevel(prev.currentLevel + 1);
                return {
                  ...newState,
                  level: nextLevel,
                  playerX: nextLevel.start.x,
                  playerY: nextLevel.start.y,
                  currentLevel: prev.currentLevel + 1,
                  message: "_LEVEL_COMPLETE",
                };
              }
              return newState;
            }
            return prev;
          });
          if (dir) sendData({ type: "move", direction: dir });
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [state.phase, sendData]);

  useEffect(() => {
    if (state.phase === "playing" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cellSize = Math.min(
        Math.floor(canvas.width / state.level.width),
        Math.floor(canvas.height / state.level.height)
      );
      const offsetX = Math.floor((canvas.width - cellSize * state.level.width) / 2);
      const offsetY = Math.floor((canvas.height - cellSize * state.level.height) / 2);

      ctx.fillStyle = "#0f0a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < state.level.height; y++) {
        for (let x = 0; x < state.level.width; x++) {
          const screenX = offsetX + x * cellSize;
          const screenY = offsetY + y * cellSize;

          if (isHost && isHostBlocked(state.level, x, y)) {
            ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
            ctx.fillRect(screenX, screenY, cellSize, cellSize);
            ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, cellSize, cellSize);
            continue;
          }

          if (state.level.walls[y][x]) {
            ctx.fillStyle = "#312e81";
            ctx.fillRect(screenX, screenY, cellSize, cellSize);
          } else {
            if (!isHost) {
              const dx = x - state.playerX;
              const dy = y - state.playerY;
              if (Math.sqrt(dx * dx + dy * dy) > state.fogRadius) {
                ctx.fillStyle = "#0f0a2e";
                ctx.fillRect(screenX, screenY, cellSize, cellSize);
                continue;
              }
              const dist = Math.sqrt(dx * dx + dy * dy);
              const alpha = Math.max(0, 1 - dist / state.fogRadius);
              ctx.fillStyle = `rgba(30, 27, 75, ${1 - alpha * 0.7})`;
              ctx.fillRect(screenX, screenY, cellSize, cellSize);
            } else {
              ctx.fillStyle = "rgba(30, 27, 75, 0.5)";
              ctx.fillRect(screenX, screenY, cellSize, cellSize);
            }
          }
        }
      }

      const endGlow = ctx.createRadialGradient(
        offsetX + state.level.end.x * cellSize + cellSize / 2,
        offsetY + state.level.end.y * cellSize + cellSize / 2,
        0,
        offsetX + state.level.end.x * cellSize + cellSize / 2,
        offsetY + state.level.end.y * cellSize + cellSize / 2,
        cellSize * 1.5
      );
      endGlow.addColorStop(0, "rgba(16, 185, 129, 0.8)");
      endGlow.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = endGlow;
      ctx.fillRect(
        offsetX + state.level.end.x * cellSize - cellSize,
        offsetY + state.level.end.y * cellSize - cellSize,
        cellSize * 3,
        cellSize * 3
      );
      ctx.fillStyle = "#10b981";
      ctx.fillRect(
        offsetX + state.level.end.x * cellSize + cellSize * 0.2,
        offsetY + state.level.end.y * cellSize + cellSize * 0.2,
        cellSize * 0.6,
        cellSize * 0.6
      );

      const playerGlow = ctx.createRadialGradient(
        offsetX + state.playerX * cellSize + cellSize / 2,
        offsetY + state.playerY * cellSize + cellSize / 2,
        0,
        offsetX + state.playerX * cellSize + cellSize / 2,
        offsetY + state.playerY * cellSize + cellSize / 2,
        cellSize * 2
      );
      playerGlow.addColorStop(0, "rgba(99, 102, 241, 0.6)");
      playerGlow.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = playerGlow;
      ctx.fillRect(
        offsetX + state.playerX * cellSize - cellSize * 1.5,
        offsetY + state.playerY * cellSize - cellSize * 1.5,
        cellSize * 4,
        cellSize * 4
      );
      ctx.fillStyle = "#818cf8";
      ctx.fillRect(
        offsetX + state.playerX * cellSize + cellSize * 0.15,
        offsetY + state.playerY * cellSize + cellSize * 0.15,
        cellSize * 0.7,
        cellSize * 0.7
      );
    }
  }, [state, isHost]);

  const move = (dir: string) => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;
      let nx = prev.playerX;
      let ny = prev.playerY;
      if (dir === "up") ny--;
      else if (dir === "down") ny++;
      else if (dir === "left") nx--;
      else if (dir === "right") nx++;

      if (
        nx >= 0 && nx < prev.level.width &&
        ny >= 0 && ny < prev.level.height &&
        !prev.level.walls[ny][nx] &&
        !isHostBlocked(prev.level, nx, ny)
      ) {
        return { ...prev, playerX: nx, playerY: ny };
      }
      return prev;
    });
    sendData({ type: "move", direction: dir });
  };

  const handleCreateRoom = () => createRoom(handleData);
  const handleJoinRoom = (code: string) => joinRoom(code, handleData);
  const handleBack = () => { disconnect(); onBack(); };

  if (state.phase === "lobby") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <div className="text-center">
          <div className="mb-2 text-5xl">🏰</div>
          <h2 className="text-2xl font-bold text-amber-300">لعبة المتاهة</h2>
        </div>
        <p className="text-center text-sm text-slate-400">
          L1 يرى الخريطة — L2 يتحرك. تعاونوا للوصول للنهاية!
        </p>
        <ConnectionStatus status={status} />
        <RoomLobby isHost={isHost} roomCode={roomCode} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        {roomCode && status === "connected" && isHost && (
          <button onClick={startGame} className="w-full cursor-pointer rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-6 py-4 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110">
            ابدأ اللعبة
          </button>
        )}
        {roomCode && status === "connected" && !isHost && (
          <p className="animate-pulse text-sm text-amber-400">في انتظار المضيف...</p>
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-400">
          {state.won ? "فوز!" : "انتهى الوقت!"}
        </h2>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <p className="text-sm text-slate-400">المستوى</p>
          <p className="my-2 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-500">
            {state.currentLevel}/{state.maxLevels}
          </p>
        </div>
        <button onClick={handleBack} className="cursor-pointer rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110">
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
          <span className={`font-bold ${state.timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>{state.timeLeft}</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm text-slate-400">المستوى: </span>
          <span className="font-bold text-amber-400">{state.currentLevel}/{state.maxLevels}</span>
        </div>
      </div>

      <div className={`w-full rounded-xl border px-6 py-3 text-center ${
        isHost
          ? "border-violet-500/20 bg-violet-500/10"
          : "border-amber-500/20 bg-amber-500/10"
      }`}>
        <p className={`text-sm ${isHost ? "text-violet-300" : "text-amber-300"}`}>
          {isHost ? "أنت ترى الخريطة — وجّه صديقك!" : "تحرك نحو النقطة الخضراء"}
        </p>
      </div>

      {state.message === "_LEVEL_COMPLETE" && (
        <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-sm font-bold text-emerald-400">
          المستوى التالي!
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-1">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div />
        <button onClick={() => move("up")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:scale-110">↑</button>
        <div />
        <button onClick={() => move("left")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:scale-110">←</button>
        <button onClick={() => move("down")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:scale-110">↓</button>
        <button onClick={() => move("right")} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:scale-110">→</button>
      </div>

      <button onClick={handleBack} className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
        رجوع
      </button>
    </div>
  );
}
