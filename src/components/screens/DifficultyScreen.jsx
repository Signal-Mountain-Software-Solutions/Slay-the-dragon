import useGameStore from '../../store/gameStore'
import { DIFFICULTY } from '../../constants/enemies'

const ICONS = { easy: '🌿', medium: '⚔', hard: '💀' }

export default function DifficultyScreen() {
  const initGame = useGameStore(s => s.initGame)

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ textAlign: 'center', maxWidth: 480 }}>

        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🐉</div>
        <h2 style={{
          fontFamily: "'Cinzel Decorative',serif",
          fontSize: '1.4rem',
          color: 'var(--gold)',
          textShadow: '0 0 20px rgba(212,160,23,0.4)',
          marginBottom: 6,
          letterSpacing: 2,
        }}>
          How to Slay a Dragon
        </h2>
        <p style={{
          fontFamily: "'IM Fell English',serif",
          fontStyle: 'italic',
          color: 'var(--mist)',
          fontSize: '0.85rem',
          marginBottom: 28,
        }}>
          Choose your fate, warrior.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button
              key={key}
              onClick={() => initGame(key)}
              style={{
                background: `${d.color}0d`,
                border: `1px solid ${d.color}55`,
                borderRadius: 4,
                padding: '14px 18px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${d.color}22`; e.currentTarget.style.borderColor = `${d.color}99` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${d.color}0d`; e.currentTarget.style.borderColor = `${d.color}55` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem', color: d.color, letterSpacing: 1 }}>
                  {ICONS[key]} {d.label}
                </span>
                {d.scoreBonus > 0 && (
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: 1 }}>
                    +{d.scoreBonus.toLocaleString()} score bonus
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'IM Fell English',serif", fontSize: '0.78rem', color: 'var(--mist)', fontStyle: 'italic' }}>
                {d.desc}
              </div>
              <div style={{ marginTop: 6, fontSize: '0.62rem', color: `${d.color}88`, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
                {key === 'easy'   && 'Enemies ×1.0 · Dragon ×1.0'}
                {key === 'medium' && 'Enemies ×1.25 · Dragon ×1.25'}
                {key === 'hard'   && 'Enemies ×1.5 · Dragon ×1.5'}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
