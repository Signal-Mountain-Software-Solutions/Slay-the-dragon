import useGameStore from '../../store/gameStore'
import { ITEM_DEFS, getItemEffect, isUsable } from '../../constants/items'

function Chip({ name, type }) {
  const useItem = useGameStore(s => s.useItem)
  const usable = isUsable(name)
  const effect = getItemEffect(name)
  const chipType = usable ? 'usable' : type

  return (
    <div
      className={`inv-chip ${chipType}`}
      onClick={usable ? () => useItem(name) : undefined}
      title={usable ? 'Click to use' : undefined}
    >
      <span className="inv-chip-name">
        {name}{usable && <span style={{ fontSize: '0.5rem', opacity: 0.8, marginLeft: 4 }}>[USE]</span>}
      </span>
      {effect && <span className="inv-chip-effect">{effect}</span>}
    </div>
  )
}

export default function InventoryBar() {
  const player = useGameStore(s => s.player)

  const chips = [
    ...player.inventory.map(name => ({ name, type: 'item' })),
    ...player.blessings.map(name => ({ name, type: 'blessing' })),
    ...player.curses.map(name => ({ name, type: 'curse' })),
  ]

  return (
    <div style={{
      flexShrink: 0, zIndex: 1,
      background: 'linear-gradient(180deg,rgba(10,8,4,0.97) 0%,rgba(18,13,6,0.99) 100%)',
      borderTop: '1px solid rgba(212,160,23,0.2)',
      padding: '6px 16px', display: 'flex', alignItems: 'center',
      minHeight: 54, overflowX: 'auto', gap: 0,
    }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.55rem', color: 'rgba(212,160,23,0.5)', letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: 12 }}>
        Inventory &amp; Effects
      </div>

      {player.pendingStrengthPotion && (
        <div className="inv-chip" style={{ borderColor: 'rgba(220,160,40,0.7)', background: 'rgba(60,40,5,0.6)', marginRight: 6 }}>
          <span className="inv-chip-name" style={{ color: '#E0B040' }}>⚡ Strength Potion</span>
          <span className="inv-chip-effect" style={{ color: '#B08030' }}>Active next battle</span>
        </div>
      )}

      {chips.length === 0 && !player.pendingStrengthPotion
        ? <span style={{ fontFamily: "'IM Fell English',serif", fontSize: '0.7rem', color: 'rgba(138,122,106,0.4)', fontStyle: 'italic' }}>No items yet...</span>
        : chips.map((c, i) => <Chip key={`${c.name}-${i}`} name={c.name} type={c.type} />)
      }
    </div>
  )
}
