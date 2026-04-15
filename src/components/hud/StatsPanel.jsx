import useGameStore from '../../store/gameStore'

export default function StatsPanel() {
  const player = useGameStore(s => s.player)
  const position = useGameStore(s => s.position)

  return (
    <div style={{
      width: 220, flexShrink: 0, padding: 12,
      background: 'linear-gradient(180deg,rgba(20,15,8,0.97) 0%,rgba(30,22,12,0.95) 100%)',
      borderRight: '1px solid rgba(212,160,23,0.2)',
      display: 'flex', flexDirection: 'column', gap: 8,
      overflowY: 'auto', zIndex: 1,
    }}>
      <div className="stat-card">
        <div className="stat-card-title">Warrior</div>
        <div className="stat-card-value">Lv. {player.level}</div>
      </div>

      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--mist)', marginBottom: 2, fontFamily: "'Cinzel',serif" }}>
          <span>❤ HP</span><span>{player.hp}/{player.max_hp}</span>
        </div>
        <div className="bar-track"><div className="bar-fill bar-hp" style={{ width: `${(player.hp / player.max_hp) * 100}%` }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--mist)', margin: '6px 0 2px', fontFamily: "'Cinzel',serif" }}>
          <span>✦ EXP</span><span>{player.exp}/{player.exp_to_level}</span>
        </div>
        <div className="bar-track"><div className="bar-fill bar-exp" style={{ width: `${(player.exp / player.exp_to_level) * 100}%` }} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { icon: '⚔', label: 'ATK',  val: player.attack },
          { icon: '🛡', label: 'DEF',  val: player.defense },
          { icon: '💰', label: 'GOLD', val: player.gold },
          { icon: '⚡', label: 'AP',   val: Math.floor(player.action_points) },
        ].map(({ icon, label, val }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-title">{icon} {label}</div>
            <div className="stat-card-value">{val}</div>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <div className="stat-card-title">Position</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.85rem' }}>({position.x}, {position.y})</div>
      </div>

      <div className="stat-card">
        <div className="stat-card-title">Skills</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--mist)', lineHeight: 1.6 }}>
          {player.skills.map(s => <div key={s} style={{ color: '#70C070' }}>• {s}</div>)}
        </div>
      </div>
    </div>
  )
}
