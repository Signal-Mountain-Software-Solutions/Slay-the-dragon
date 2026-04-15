import useGameStore from '../../store/gameStore'
import { AP_COSTS } from '../../logic/game'

export default function ActionButtons() {
  const player          = useGameStore(s => s.player)
  const apRemaining     = useGameStore(s => s.apRemaining)
  const battleBuffs     = useGameStore(s => s.battleBuffs)
  const playerParrying  = useGameStore(s => s.playerParrying)
  const enemyTurnPending = useGameStore(s => s.enemyTurnPending)
  const performAction   = useGameStore(s => s.performAction)
  const doEnemyTurn     = useGameStore(s => s.doEnemyTurn)

  const actions = [
    { label: 'Basic Attack', sub: '1 AP',           action: 'attack',    cls: 'btn-attack', ap: 1 },
    { label: 'Block',        sub: '1 AP',           action: 'block',     cls: 'btn-block',  ap: 1 },
    { label: 'Strong Attack',sub: '2 AP',           action: 'strong',    cls: 'btn-strong', ap: 2 },
  ]

  if (player.skills.includes('Whirlwind Strike'))
    actions.push({ label: 'Whirlwind', sub: '2 AP', action: 'whirlwind', cls: 'btn-skill', ap: 2 })

  if (player.skills.includes('Iron Will')) {
    const stacks = battleBuffs.ironWillStacks || 0
    actions.push({
      label: `Iron Will${stacks > 0 ? ` (${stacks}/5)` : ''}`,
      sub: '1 AP · +2 DEF', action: 'ironwill', cls: 'btn-skill', ap: 1,
      disabled: stacks >= 5, disabledTitle: 'Iron Will maxed (5/5)',
    })
  }

  if (player.skills.includes('Cleave'))
    actions.push({ label: 'Cleave', sub: '2 AP', action: 'cleave', cls: 'btn-skill', ap: 2 })

  if (player.skills.includes('Parry'))
    actions.push({ label: 'Parry', sub: '2 AP', action: 'parry', cls: 'btn-skill', ap: 2 })

  if (player.skills.includes('Berserk')) {
    const bu = battleBuffs.berserkUses || 0
    actions.push({
      label: `Berserk${bu > 0 ? ` (${bu}/2)` : ''}`,
      sub: '1 AP · ATK+4 DEF-2', action: 'berserk', cls: 'btn-skill', ap: 1,
      disabled: bu >= 2, disabledTitle: 'Berserk spent (2/2)',
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 14 }}>
      {actions.map(a => {
        const parryUsed = a.action === 'parry' && playerParrying
        const isDisabled = enemyTurnPending || apRemaining < a.ap || parryUsed || !!a.disabled
        return (
          <button
            key={a.action}
            className={`action-btn ${a.cls}`}
            disabled={isDisabled}
            title={parryUsed ? 'Already in parry stance' : a.disabled ? a.disabledTitle : undefined}
            onClick={() => performAction(a.action)}
          >
            {a.label}<br /><small style={{ opacity: 0.7 }}>{a.sub}</small>
          </button>
        )
      })}
      <button
        className="action-btn btn-end"
        disabled={enemyTurnPending}
        onClick={() => doEnemyTurn()}
      >
        End Turn<br /><small style={{ opacity: 0.7 }}>Skip</small>
      </button>
    </div>
  )
}
