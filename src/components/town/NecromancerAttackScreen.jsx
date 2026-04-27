import useGameStore from '../../store/gameStore'

export default function NecromancerAttackScreen() {
  const startNecromancerAttack = useGameStore(s => s.startNecromancerAttack)
  const leaveTown              = useGameStore(s => s.leaveTown)

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>💀</div>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: '0.85rem', color: '#E07070', marginBottom: 12, letterSpacing: 1 }}>
        A Necromancer in the Church!
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--mist)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 20 }}>
        As you enter the church, a dark figure rises from behind the altar.
        Skeletal hands reach from the shadows. There is no blessing here — only battle.
      </p>
      <button
        className="btn-town"
        style={{ borderColor: 'rgba(180,40,40,0.5)', color: '#E07070', marginBottom: 8 }}
        onClick={startNecromancerAttack}
      >
        ⚔ Face the Necromancer
      </button>
      <button className="btn-back" onClick={leaveTown}>
        Flee the church
      </button>
    </div>
  )
}
