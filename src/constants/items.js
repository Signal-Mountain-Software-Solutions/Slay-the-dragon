export const ITEM_DEFS = {
  // Treasure room
  'Rare Gem':            { effect: '+1 AP',              apply: p => ({ ...p, action_points: p.action_points + 1 }) },
  'Ancient Artifact':    { effect: '+1 ATK, +1 DEF',     apply: p => ({ ...p, attack: p.attack + 1, defense: p.defense + 1 }) },
  'Enchanted Ring':      { effect: '+20 Max HP, +20 HP', apply: p => ({ ...p, max_hp: p.max_hp + 20, hp: p.hp + 20 }) },
  'Magic Scroll':        { effect: '+1 ATK, +1 DEF',     apply: p => ({ ...p, attack: p.attack + 1, defense: p.defense + 1 }) },
  // Event drops
  'Health Potion':       { effect: 'Heals 50% Max HP', usable: true,
                           apply: p => ({ ...p, hp: Math.min(p.max_hp, p.hp + Math.floor(p.max_hp * 0.5)) }) },
  'Strength Potion':     { effect: '+2 ATK next battle', usable: true, battleOnly: true,
                           apply: p => ({ ...p, pendingStrengthPotion: true }) },
  'Strength Ring':       { effect: '+2 ATK',             apply: p => ({ ...p, attack: p.attack + 2 }) },
  'Lucky Charm':         { effect: '+1 AP',              apply: p => ({ ...p, action_points: p.action_points + 1 }) },
  // Enemy drops
  'Chicken Leg':         { effect: 'Heals 25% Max HP', usable: true,
                           apply: p => ({ ...p, hp: Math.min(p.max_hp, p.hp + Math.floor(p.max_hp * 0.25)) }) },
  'Porkchop':            { effect: 'Heals 35% Max HP', usable: true,
                           apply: p => ({ ...p, hp: Math.min(p.max_hp, p.hp + Math.floor(p.max_hp * 0.35)) }) },
  'Dragon Scale Shield': { effect: '+4 DEF',             apply: p => ({ ...p, defense: p.defense + 4 }) },
  'Dragon Tooth Sword':  { effect: '+4 ATK',             apply: p => ({ ...p, attack: p.attack + 4 }) },
  // Blessings
  'Blessing of Strength':  { effect: '+2 ATK',               apply: p => ({ ...p, attack: p.attack + 2 }) },
  'Blessing of Defense':   { effect: '+2 DEF',               apply: p => ({ ...p, defense: p.defense + 2 }) },
  'Blessing of Vitality':  { effect: '+10 Max HP, +10 HP',   apply: p => ({ ...p, max_hp: p.max_hp + 10, hp: p.hp + 10 }) },
  'Blessing of Endurance': { effect: '+1 AP',                apply: p => ({ ...p, action_points: p.action_points + 1 }) },
  // Curses
  'Curse of Weakness':     { effect: '-2 ATK',               apply: p => ({ ...p, attack: Math.max(1, p.attack - 2) }) },
  'Curse of Frailty':      { effect: '-2 DEF',               apply: p => ({ ...p, defense: Math.max(0, p.defense - 2) }) },
  'Curse of Misfortune':   { effect: '-10 Max HP, -10 HP',   apply: p => ({ ...p, max_hp: Math.max(10, p.max_hp - 10), hp: Math.max(1, p.hp - 10) }) },
}

export const getItemEffect = name => ITEM_DEFS[name]?.effect || ''

export const isUsable = name => !!ITEM_DEFS[name]?.usable

// Apply permanent effect on pickup (skip usable items — those apply on use)
export const applyPickupEffect = (player, name) => {
  const def = ITEM_DEFS[name]
  if (!def || def.usable) return player
  return def.apply(player)
}

// Apply usable item on demand, removes from inventory
export const applyUseEffect = (player, name) => {
  const def = ITEM_DEFS[name]
  if (!def?.usable) return player
  const idx = player.inventory.indexOf(name)
  if (idx === -1) return player
  const newInv = [...player.inventory]
  newInv.splice(idx, 1)
  return def.apply({ ...player, inventory: newInv })
}
