import useGameStore from '../../store/gameStore'

export default function CultistChurchScreen() {
  const player             = useGameStore(s => s.player)
  const payCultistBribe    = useGameStore(s => s.payCultistBribe)
  const acceptCultistCurse = useGameStore(s => s.acceptCultistCurse)

  const canAfford = player.gold >= 500

  return (
    <div>
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#C04040', fontSize: '0.8rem', marginBottom: 12 }}>
        The robes. The candles. The symbols on the walls. This is no church of the gods.
      </p>
      <div style={{ background: 'rgba(80,10,10,0.3)', border: '1px solid rgba(180,40,40,0.4)', borderRadius: 4, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🕯</div>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: '0.8rem', color: '#E07070', marginBottom: 6, letterSpacing: 1 }}>
          Secret Cultist Church
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--mist)', fontStyle: 'italic', lineHeight: 1.6 }}>
          The cultists surround you. You cannot leave without their blessing — or their curse.
          Pay them to look away, or accept the ritual.
        </p>
      </div>
      <button
        className="btn-town"
        style={{ marginBottom: 8, opacity: canAfford ? 1 : 0.4, borderColor: 'rgba(212,160,23,0.5)', color: 'var(--gold)' }}
        disabled={!canAfford}
        onClick={payCultistBribe}
      >
        💰 Pay 500 Gold to Leave{!canAfford ? ` (need ${500 - player.gold} more)` : ''}
      </button>
      <button
        className="btn-town"
        style={{ borderColor: 'rgba(180,40,40,0.5)', color: '#E07070' }}
        onClick={acceptCultistCurse}
      >
        🕯 Submit to the Ritual (receive a curse)
      </button>
    </div>
  )
}
