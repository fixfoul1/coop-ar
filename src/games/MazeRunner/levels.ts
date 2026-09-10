export interface MazeLevel {
  width: number;
  height: number;
  walls: boolean[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
  hostBlocked: { x: number; y: number }[];
}

function generateMaze(w: number, h: number): boolean[][] {
  const grid: boolean[][] = Array.from({ length: h }, () => Array(w).fill(true));
  const visited: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));

  const dirs = [
    [0, -2],
    [0, 2],
    [-2, 0],
    [2, 0],
  ];

  const dfs = (x: number, y: number) => {
    visited[y][x] = true;
    grid[y][x] = false;
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny][nx]) {
        grid[y + dy / 2][x + dx / 2] = false;
        dfs(nx, ny);
      }
    }
  };

  dfs(1, 1);
  return grid;
}

export function generateLevel(levelNum: number): MazeLevel {
  const baseSize = 7 + Math.min(levelNum * 2, 8);
  const w = baseSize % 2 === 0 ? baseSize + 1 : baseSize;
  const h = w;
  const walls = generateMaze(w, h);

  const hostBlocked: { x: number; y: number }[] = [];
  const wallCount = Math.floor((w * h) / 6);
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    if (!walls[y][x] && !(x === 1 && y === 1) && !(x === w - 2 && y === h - 2)) {
      hostBlocked.push({ x, y });
    }
  }

  return {
    width: w,
    height: h,
    walls,
    start: { x: 1, y: 1 },
    end: { x: w - 2, y: h - 2 },
    hostBlocked,
  };
}

export function isHostBlocked(level: MazeLevel, x: number, y: number): boolean {
  return level.hostBlocked.some((b) => b.x === x && b.y === y);
}
