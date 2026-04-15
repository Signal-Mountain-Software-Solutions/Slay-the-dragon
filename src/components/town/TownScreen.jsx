import useGameStore from '../../store/gameStore'
import ShopScreen from './ShopScreen'
import TavernScreen from './TavernScreen'
import ChurchScreen from './ChurchScreen'

export default function TownScreen() {
  const townScreen    = useGameStore(s => s.townScreen)
  const townVisited   = useGameStore(s => s.townVisited)
  const setTownScreen = useGameStore(s => s.setTownScreen)
  const leaveTown     = useGameStore(s => s.leaveTown)

  const renderContent = () => {
    if (townScreen === 'shop')   return <ShopScreen />
    if (townScreen === 'tavern') return <TavernScreen />
    if (townScreen === 'church') return <ChurchScreen />

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--mist)', fontSize: '0.8rem', marginBottom: 6 }}>
          Your wounds are tended to. What do you seek?
        </p>
        <button className="btn-town" disabled={townVisited.shop}   onClick={() => setTownScreen('shop')}>
          🛒 Visit Shop{townVisited.shop ? ' (closed)' : ''}
        </button>
        <button className="btn-town" disabled={townVisited.tavern} onClick={() => setTownScreen('tavern')}>
          🍺 Visit Tavern{townVisited.tavern ? ' (closed)' : ''}
        </button>
        <button className="btn-town" disabled={townVisited.church} onClick={() => setTownScreen('church')}>
          ⛪ Visit Church{townVisited.church ? ' (closed)' : ''}
        </button>
        <button className="btn-back" onClick={leaveTown}>Leave Town</button>
      </div>
    )
  }

  return (
    <div className="overlay">
      <div className="overlay-box">
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", textAlign: 'center', marginBottom: 20, fontSize: '1.3rem', color: 'var(--gold)', letterSpacing: 2 }}>
          🏘 Town
        </h2>
        {renderContent()}
      </div>
    </div>
  )
}
