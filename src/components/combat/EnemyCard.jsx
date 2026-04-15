import useGameStore from '../../store/gameStore'

export default function EnemyCard({ enemy, index }) {
  const selectedTarget   = useGameStore(s => s.selectedTarget)
  const enemies          = useGameStore(s => s.enemies)
  const setSelectedTarget = useGameStore(s => s.setSelectedTarget)
  const dragon           = useGameStore(s => s.dragon)

  const realIdx = enemies.indexOf(enemy)
  const isSelected = selectedTarget === realIdx

  return (
    <div
      className={`enemy-card ${isSelected ? 'selected' : ''}`}
      onClick={() => setSelectedTarget(realIdx)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.85rem', color: 'var(--ember)' }}>
          {enemy.name}{enemy.isDragon ? ` ⚡Lv${dragon.power_level}` : ''}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--mist)', letterSpacing: 1 }}>
          HP: {enemy.hp}/{enemy.max_hp} · ATK: {enemy.attack} · DEF: {enemy.defense}
        </span>
      </div>
      <div className="bar-track">
        <div className="bar-fill bar-enemy" style={{ width: `${(enemy.hp / enemy.max_hp) * 100}%` }} />
      </div>
    </div>
  )
}
