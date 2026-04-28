import { useEffect } from 'react';
import useGameStore from './store/gameStore';

import Header from './components/hud/Header';
import StatsPanel from './components/hud/StatsPanel';
import InventoryBar from './components/hud/InventoryBar';
import Notification from './components/hud/Notification';

import GameBoard from './components/board/GameBoard';
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

  // On first load: if no grid exists yet, go to difficulty screen
  useEffect(() => {
    if (!grid || Object.keys(grid).length === 0) returnToDifficulty();
  }, []); // mount only

  // Difficulty screen shown as a full-screen overlay before game starts
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

 // inside the non-difficulty return

return (
  <div className="app">
    <Header />
    <Notification />

    <main className="mainRow">
      {/* Board */}
      <section className="rightPanel">
        <GameBoard />
      </section>

      {/* Items (above stats on mobile) */}
      <section className="inventoryPanel">
        <InventoryBar />
      </section>

      {/* Stats (collapsible / scrollable) */}
      <aside className="statsDock">
        <StatsPanel />
      </aside>
    </main>

    {/* overlays unchanged */}
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