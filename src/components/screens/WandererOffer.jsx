import useGameStore from '../../store/gameStore'

export default function WandererOffer() {
  const player               = useGameStore(s => s.player)
  const acceptWandererOffer  = useGameStore(s => s.acceptWandererOffer)
  const declineWandererOffer = useGameStore(s => s.declineWandererOffer)

  const canAfford = player.gold >= 100

  return (
    <div className="overlay">
      <div className="overlay-box" style={{ maxWidth: 480, textAlign: 'center' }}>
        {/* Decorative top */}
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🧙</div>

        <h2 style={{
          fontFamily: "'Cinzel Decorative',serif",
          fontSize: '1.1rem',
          color: 'var(--gold)',
          letterSpacing: 2,
          marginBottom: 16,
        }}>
          A Strange Encounter
        </h2>

        <p style={{
          fontFamily: "'IM Fell English',serif",
          fontSize: '0.9rem',
          color: 'var(--parchment)',
          fontStyle: 'italic',
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
          You meet a strange man in the woods. He peers at you with pale eyes and
          produces a faintly glowing gem from his cloak.
        </p>

        {/* Offer box */}
        <div style={{
          background: 'rgba(212,160,23,0.07)',
          border: '1px solid rgba(212,160,23,0.25)',
          borderRadius: 4,
          padding: '14px 18px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>💎</div>
          <p style={{
            fontFamily: "'Cinzel',serif",
            fontSize: '0.8rem',
            color: 'var(--gold)',
            letterSpacing: 1,
            marginBottom: 6,
          }}>
            Seer Stone
          </p>
          <p style={{
            fontFamily: "'IM Fell English',serif",
            fontSize: '0.8rem',
            color: 'var(--mist)',
            fontStyle: 'italic',
            marginBottom: 10,
          }}>
            "This gem will show you the future — every path ahead laid bare."
          </p>
          <p style={{
            fontFamily: "'Cinzel',serif",
            fontSize: '0.75rem',
            color: canAfford ? 'var(--gold)' : 'var(--blood)',
            letterSpacing: 1,
          }}>
            100 Gold · You have: {player.gold}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            className="action-btn btn-town"
            style={{ flex: 1, maxWidth: 180, opacity: canAfford ? 1 : 0.4 }}
            disabled={!canAfford}
            onClick={acceptWandererOffer}
          >
            Purchase
          </button>
          <button
            className="action-btn btn-end"
            style={{ flex: 1, maxWidth: 180, padding: '12px 6px' }}
            onClick={declineWandererOffer}
          >
            Decline
          </button>
        </div>

        {!canAfford && (
          <p style={{
            marginTop: 10,
            fontFamily: "'Cinzel',serif",
            fontSize: '0.65rem',
            color: 'var(--blood)',
            letterSpacing: 1,
          }}>
            Not enough gold
          </p>
        )}
      </div>
    </div>
  )
}
