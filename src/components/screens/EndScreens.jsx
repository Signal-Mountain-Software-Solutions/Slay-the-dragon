import useGameStore from '../../store/gameStore'
import { calcScore, RANK_COLORS } from '../../logic/score'
import { DIFFICULTY } from '../../constants/enemies'

function ScoreBreakdown({ player, stats, dragon, difficulty }) {
  const { lines, total, rank } = calcScore({ player, stats, dragon, difficulty })
  const rankColor = RANK_COLORS[rank]

  return (
    <div style={{ marginTop: 16, marginBottom: 20 }}>
      {/* Rank badge */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{
          display: 'inline-block',
          fontFamily: "'Cinzel Decorative',serif",
          fontSize: '2.8rem',
          color: rankColor,
          textShadow: `0 0 24px ${rankColor}88`,
          lineHeight: 1,
          border: `2px solid ${rankColor}66`,
          borderRadius: 6,
          padding: '4px 20px',
          background: `${rankColor}11`,
        }}>
          {rank}
        </div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', color: 'var(--mist)', letterSpacing: 3, marginTop: 6 }}>
          FINAL SCORE: <span style={{ color: rankColor, fontSize: '0.85rem' }}>{total.toLocaleString()}</span>
          {difficulty && (
            <span style={{ color: DIFFICULTY[difficulty]?.color, marginLeft: 10 }}>
              [{DIFFICULTY[difficulty]?.label}]
            </span>
          )}
        </div>
      </div>

      {/* Score lines */}
      <div style={{
        background: 'rgba(10,8,4,0.6)',
        border: '1px solid rgba(212,160,23,0.12)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 14px',
            borderBottom: i < lines.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.6rem', color: line.positive ? '#70C070' : '#C84040' }}>
                {line.positive ? '▲' : '▼'}
              </span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.68rem', color: 'var(--mist)', letterSpacing: 1 }}>
                {line.label}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(138,122,106,0.6)' }}>
                {line.value}
              </span>
            </div>
            <span style={{
              fontFamily: "'Cinzel',serif",
              fontSize: '0.75rem',
              color: line.positive ? '#70C070' : '#C84040',
              fontWeight: 700,
            }}>
              {line.score >= 0 ? '+' : ''}{line.score.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderTop: '1px solid rgba(212,160,23,0.25)',
          background: 'rgba(212,160,23,0.05)',
        }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: 2 }}>
            TOTAL
          </span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.85rem', color: rankColor, fontWeight: 700 }}>
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export function VictoryScreen() {
  const player             = useGameStore(s => s.player)
  const turn               = useGameStore(s => s.turn)
  const visited            = useGameStore(s => s.visited)
  const dragon             = useGameStore(s => s.dragon)
  const stats              = useGameStore(s => s.stats)
  const difficulty         = useGameStore(s => s.difficulty)
  const returnToDifficulty = useGameStore(s => s.returnToDifficulty)

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ textAlign: 'center', maxWidth: 520 }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.8rem', color: 'var(--gold-light)', textShadow: '0 0 30px rgba(240,192,64,0.6)', marginBottom: 8, letterSpacing: 2 }}>
          🎊 VICTORY 🎊
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--parchment)', marginBottom: 4, fontStyle: 'italic' }}>
          The Dragon lies slain. The realm is saved.
        </p>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', color: 'var(--mist)', letterSpacing: 2, marginBottom: 4 }}>
          Level {player.level} · {turn} turns · {visited.length} tiles explored
        </div>

        <ScoreBreakdown player={player} stats={stats} dragon={dragon} difficulty={difficulty} />

        <button className="btn-restart" onClick={returnToDifficulty}>Play Again</button>
      </div>
    </div>
  )
}

export function GameOverScreen() {
  const player             = useGameStore(s => s.player)
  const turn               = useGameStore(s => s.turn)
  const dragon             = useGameStore(s => s.dragon)
  const stats              = useGameStore(s => s.stats)
  const difficulty         = useGameStore(s => s.difficulty)
  const returnToDifficulty = useGameStore(s => s.returnToDifficulty)

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ textAlign: 'center', maxWidth: 520 }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.8rem', color: 'var(--blood)', textShadow: '0 0 30px rgba(139,26,26,0.6)', marginBottom: 8, letterSpacing: 2 }}>
          💀 DEFEATED 💀
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--mist)', marginBottom: 4, fontStyle: 'italic' }}>
          Your quest ends here, brave warrior.
        </p>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', color: 'var(--mist)', letterSpacing: 2, marginBottom: 4 }}>
          Level {player.level} · {turn} turns
        </div>

        <ScoreBreakdown player={player} stats={stats} dragon={dragon} difficulty={difficulty} />

        <button className="btn-restart danger" onClick={returnToDifficulty}>Try Again</button>
      </div>
    </div>
  )
}
