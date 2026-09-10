import { useState } from "react";
import { Layout } from "./components/Layout";
import { UsernameModal } from "./components/UsernameModal";
import { GameWrapper } from "./components/GameWrapper";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { Home } from "./pages/Home";

export default function App() {
  const [username, setUsername] = useState(() => { try { return localStorage.getItem("coop-ar-u") || ""; } catch { return ""; } });
  const [game, setGame] = useState<string | null>(null);
  const pc = usePeerConnection();

  const handleSave = (n: string) => { try { localStorage.setItem("coop-ar-u", n); } catch {} setUsername(n); };
  const handleBack = () => { pc.disconnect(); setGame(null); };

  return (
    <Layout>
      {!username && <UsernameModal onSave={handleSave} />}
      {game && username ? <GameWrapper game={game} username={username} pc={pc} onBack={handleBack} /> : <Home onSelectGame={setGame} />}
    </Layout>
  );
}
