import useGameStore from '../../store/gameStore';
import { getItemEffect, isUsable } from '../../constants/items';

function Chip({ name, type }) {
  const useItem = useGameStore(s => s.useItem);

  const usable = isUsable(name);
  const effect = getItemEffect(name);

  const chipType = usable ? 'usable' : type;

  return (
    <button
      type="button"
      className={`inv-chip ${chipType}`}
      onClick={usable ? () => useItem(name) : undefined}
      title={usable ? 'Click to use' : undefined}
    >
      <div className="inv-chip-name">
        {name} {usable && <span>[USE]</span>}
      </div>
      {effect && <div className="inv-chip-effect">{effect}</div>}
    </button>
  );
}

export default function InventoryBar() {
  const player = useGameStore(s => s.player);

  const chips = [
    ...player.inventory.map(name => ({ name, type: 'item' })),
    ...player.blessings.map(name => ({ name, type: 'blessing' })),
    ...player.curses.map(name => ({ name, type: 'curse' })),
  ];

  return (
    <section className="inventoryBar">
      <div className="inventoryHeader">Inventory & Effects</div>

      {player.pendingStrengthPotion && (
        <div className="inventoryHint">⚡ Strength Potion Active next battle</div>
      )}

      <div className="inventoryRow">
        {chips.length === 0 && !player.pendingStrengthPotion ? (
          <div className="inventoryEmpty">No items yet...</div>
        ) : (
          chips.map((c, i) => <Chip key={`${c.type}-${c.name}-${i}`} name={c.name} type={c.type} />)
        )}
      </div>
    </section>
  );
}
