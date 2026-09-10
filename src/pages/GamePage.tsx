import { WordChain } from "../games/WordChain";
import { DrawingRelay } from "../games/DrawingRelay";
import { MazeRunner } from "../games/MazeRunner";

interface GamePageProps {
  game: string;
  username: string;
  onBack: () => void;
}

export function GamePage({ game, username, onBack }: GamePageProps) {
  switch (game) {
    case "word-chain":
      return <WordChain username={username} onBack={onBack} />;
    case "drawing-relay":
      return <DrawingRelay username={username} onBack={onBack} />;
    case "maze-runner":
      return <MazeRunner username={username} onBack={onBack} />;
    default:
      return (
        <div className="text-center">
          <p className="mb-4 text-xl">لعبة غير موجودة</p>
          <button
            onClick={onBack}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
          >
            رجوع
          </button>
        </div>
      );
  }
}
