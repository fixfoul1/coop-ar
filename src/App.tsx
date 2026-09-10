import { useState } from "react";
import { Layout } from "./components/Layout";
import { UsernameModal } from "./components/UsernameModal";
import { useUsername } from "./hooks/useUsername";
import { Home } from "./pages/Home";
import { GamePage } from "./pages/GamePage";

export default function App() {
  const { username, setUsername } = useUsername();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <Layout>
      {!username && <UsernameModal onSave={setUsername} />}
      {selectedGame && username ? (
        <GamePage
          game={selectedGame}
          username={username}
          onBack={() => setSelectedGame(null)}
        />
      ) : (
        <Home onSelectGame={setSelectedGame} />
      )}
    </Layout>
  );
}
