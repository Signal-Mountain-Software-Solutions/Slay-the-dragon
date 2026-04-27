import { useEffect } from 'react';
import useGameStore from './store/gameStore';

import Header from './components/hud/Header';
import StatsPanel from './components/hud/StatsPanel';
import InventoryBar from './components/hud/InventoryBar';
import Notification from './components/hud/Notification';

import GameBoard from './components/board/GameBoard.jsx';
import CombatScreen from './components/combat/CombatScreen';
import TownScreen from './components/town/TownScreen';
import { VictoryScreen, GameOverScreen } from './components/screens/EndScreens';
import WandererOffer from './components/screens/WandererOffer';
import DifficultyScreen from './components/screens/DifficultyScreen';

export default function App() {
  const screen = useGameStore(s => s.screen);
  const grid = useGameStore(s => s.grid);
  const returnToDifficulty = useGameStore(s => s.returnToDifficulty);
  const pendingWandererOffer = useGameStore(s => s.pendingWandererOffer);

  useEffect(() => {
    if (!grid || Object.keys(grid).length === 0) returnToDifficulty();
  }, []); // only on mount

  if (screen === 'difficulty') {
    return (
      <div className="app">
        <div className="overlay">
          <div className="overlay-box">
            <DifficultyScreen />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <StatsPanel />
      <Notification />

      <main className="game-stage">
        <GameBoard />
      </main>

      <InventoryBar />

      {screen === 'combat' && (
        <div className="overlay">
          <div className="overlay-box">
            <CombatScreen />
          </div>
        </div>
      )}

      {screen === 'town' && (
        <div className="overlay">
          <div className="overlay-box">
            <TownScreen />
          </div>
        </div>
      )}

      {screen === 'victory' && (
        <div className="overlay">
          <div className="overlay-box">
            <VictoryScreen />
          </div>
        </div>
      )}

      {screen === 'gameover' && (
        <div className="overlay">
          <div className="overlay-box">
            <GameOverScreen />
          </div>
        </div>
      )}

      {screen === 'exploring' && pendingWandererOffer && (
        <div className="overlay">
          <div className="overlay-box">
            <WandererOffer />
          </div>
        </div>
      )}
    </div>
  );
}