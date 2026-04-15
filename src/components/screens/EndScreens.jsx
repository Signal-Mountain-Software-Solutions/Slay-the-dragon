import useGameStore from '../../store/gameStore'

export function VictoryScreen() {
  const player  = useGameStore(s => s.player)
  const turn    = useGameStore(s => s.turn)
  const visited = useGameStore(s => s.visited)
  const initGame = useGameStore(s => s.initGame)

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.8rem', color: 'var(--gold-light)', textShadow: '0 0 30px rgba(240,192,64,0.6)', marginBottom: 20, letterSpacing: 2 }}>
          🎊 VICTORY 🎊
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--parchment)', margin: '8px 0', fontStyle: 'italic' }}>
          The Dragon lies slain. The realm is saved.
        </p>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.8rem', color: 'var(--mist)', letterSpacing: 2, lineHeight: 2, margin: '16px 0' }}>
          Final Level: <span style={{ color: 'var(--gold)' }}>{player.level}</span><br />
          Gold Amassed: <span style={{ color: 'var(--gold)' }}>{player.gold}</span><br />
          Turns Taken: <span style={{ color: 'var(--gold)' }}>{turn}</span><br />
          Tiles Explored: <span style={{ color: 'var(--gold)' }}>{visited.length}</span>
        </div>
        <button className="btn-restart" onClick={initGame}>Play Again</button>
      </div>
    </div>
  )
}

export function GameOverScreen() {
  const player  = useGameStore(s => s.player)
  const turn    = useGameStore(s => s.turn)
  const initGame = useGameStore(s => s.initGame)

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.8rem', color: 'var(--blood)', textShadow: '0 0 30px rgba(139,26,26,0.6)', marginBottom: 20, letterSpacing: 2 }}>
          💀 DEFEATED 💀
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--mist)', margin: '8px 0', fontStyle: 'italic' }}>
          Your quest ends here, brave warrior.
        </p>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.8rem', color: 'var(--mist)', letterSpacing: 2, lineHeight: 2, margin: '16px 0' }}>
          Reached Level: <span style={{ color: 'var(--gold)' }}>{player.level}</span><br />
          Gold: <span style={{ color: 'var(--gold)' }}>{player.gold}</span><br />
          Survived: <span style={{ color: 'var(--gold)' }}>{turn} turns</span>
        </div>
        <button className="btn-restart danger" onClick={initGame}>Try Again</button>
      </div>
    </div>
  )
}
