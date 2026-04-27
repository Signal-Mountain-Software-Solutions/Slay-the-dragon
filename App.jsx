import { useEffect } from 'react'
import useGameStore from './store/gameStore'
import Header from './components/hud/Header'
import StatsPanel from './components/hud/StatsPanel'
import InventoryBar from './components/hud/InventoryBar'
import Notification from './components/hud/Notification'
import GameBoard from './components/board/GameBoard'
import CombatScreen from './components/combat/CombatScreen'
import TownScreen from './components/town/TownScreen'
import { VictoryScreen, GameOverScreen } from './components/screens/EndScreens'
import WandererOffer from './components/screens/WandererOffer'
import DifficultyScreen from './components/screens/DifficultyScreen'

export default function App() {
  const screen               = useGameStore(s => s.screen)
  const grid                 = useGameStore(s => s.grid)
  const returnToDifficulty   = useGameStore(s => s.returnToDifficulty)
  const pendingWandererOffer = useGameStore(s => s.pendingWandererOffer)

  // On first load: if no grid exists yet, go to difficulty screen
  useEffect(() => {
    if (!grid || Object.keys(grid).length === 0) returnToDifficulty()
  }, [])

  // Difficulty screen shown as a full-screen overlay before game starts
  if (screen === 'difficulty') {
    return (
      <div style={{ position: 'relative', zIndex: 1, width: '100vw', height: '100vh' }}>
        <DifficultyScreen />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <StatsPanel />
        <GameBoard />
      </div>
      <InventoryBar />

      {screen === 'combat'    && <CombatScreen />}
      {screen === 'town'      && <TownScreen />}
      {screen === 'victory'   && <VictoryScreen />}
      {screen === 'gameover'  && <GameOverScreen />}
      {screen === 'exploring' && pendingWandererOffer && <WandererOffer />}
      <Notification />
    </div>
  )
}
