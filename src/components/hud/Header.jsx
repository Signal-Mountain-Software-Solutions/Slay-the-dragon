import useGameStore from '../../store/gameStore'

export default function Header() {
  const turn = useGameStore(s => s.turn)
  const activeQuest = useGameStore(s => s.activeQuest)
  const dragon = useGameStore(s => s.dragon)

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 20px', flexShrink: 0, zIndex: 1,
      background: 'linear-gradient(180deg,rgba(10,8,4,0.95) 0%,rgba(26,18,8,0.85) 100%)',
      borderBottom: '2px solid', borderImage: 'linear-gradient(90deg,transparent,#D4A017,#C8411B,#D4A017,transparent) 1',
    }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '1.1rem', color: 'var(--gold)', textShadow: '0 0 20px rgba(212,160,23,0.5)', letterSpacing: 2 }}>
        ⚔ How to Slay a Dragon ⚔
      </h1>

      {activeQuest && (
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: 1, textAlign: 'center', maxWidth: 260, lineHeight: 1.4, opacity: 0.9 }}>
          📜 QUEST · ({activeQuest.tile.x},{activeQuest.tile.y})
          <br /><span style={{ opacity: 0.7, fontSize: '0.55rem' }}>{activeQuest.reward.desc}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {dragon.power_level > 0 && (
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.6rem', color: 'var(--ember)', letterSpacing: 2, animation: 'flicker 2s ease-in-out infinite' }}>
            🐉 THE DRAGON GROWS STRONGER
          </div>
        )}
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.75rem', color: 'var(--mist)', letterSpacing: 3 }}>
          TURN {turn}
        </div>
      </div>
    </div>
  )
}
