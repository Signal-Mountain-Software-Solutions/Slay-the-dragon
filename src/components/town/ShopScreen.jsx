import useGameStore from '../../store/gameStore'

export default function ShopScreen() {
  const player      = useGameStore(s => s.player)
  const buyItem     = useGameStore(s => s.buyItem)
  const buyStat     = useGameStore(s => s.buyStat)
  const setTownScreen = useGameStore(s => s.setTownScreen)

  const items = [
    { label: 'Health Potion', desc: 'Restores 50% of max HP (use from inventory)', cost: 50,  action: () => buyItem('Health Potion', 50) },
    { label: 'Strength Potion', desc: '+2 ATK for one battle (use from inventory)', cost: 100, action: () => buyItem('Strength Potion', 100) },
    { label: 'Sharpening Stone', desc: 'Permanent +2 Attack',   cost: 150, action: () => buyStat('attack',  2, 150, 'Sharpening Stone') },
    { label: 'Metal Shield',     desc: 'Permanent +2 Defense',  cost: 150, action: () => buyStat('defense', 2, 150, 'Metal Shield') },
  ]

  return (
    <div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.8rem', color: 'var(--gold)', textAlign: 'center', marginBottom: 14, letterSpacing: 2 }}>
        💰 Your Gold: {player.gold}
      </div>
      {items.map(item => (
        <button
          key={item.label}
          className="shop-item"
          disabled={player.gold < item.cost}
          onClick={() => { item.action(); setTownScreen(null) }}
        >
          <div style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: 2 }}>{item.label} — {item.cost} Gold</div>
          <div style={{ color: 'var(--mist)', fontSize: '0.65rem', fontFamily: "'IM Fell English',serif" }}>{item.desc}</div>
        </button>
      ))}
      <button className="btn-back" onClick={() => setTownScreen(null)}>← Back</button>
    </div>
  )
}
