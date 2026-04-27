import { ENCOUNTER_TIERS, DRAGON_BASE, GRID_SIZE, SKILL_POOL, QUEST_TEMPLATES } from '../constants/enemies'
import { applyPickupEffect } from '../constants/items'

// ── PLAYER ──────────────────────────────────────────────────
export const createPlayer = () => ({
  level: 1, exp: 0, exp_to_level: 100,
  attack: 5, defense: 5, max_hp: 25, hp: 25,
  action_points: 2, gold: 0,
  inventory: [], skills: ['Basic Attack', 'Block', 'Strong Attack'],
  blessings: [], curses: [],
  pendingStrengthPotion: false,
})

export const gainExp = (player, amount) => {
  let p = { ...player, exp: player.exp + amount }
  const notifications = []
  while (p.exp >= p.exp_to_level) {
    p = {
      ...p,
      exp: p.exp - p.exp_to_level,
      level: p.level + 1,
      attack: p.attack + 2,
      defense: p.defense + 2,
      max_hp: p.max_hp + 5,
      hp: p.hp + 5,
      action_points: p.action_points + 0.25,
      exp_to_level: p.exp_to_level + 25,
    }
    notifications.push({ type: 'level', level: p.level })
    if (p.level % 3 === 0) {
      const available = SKILL_POOL.filter(s => !p.skills.includes(s))
      if (available.length > 0) {
        const skill = available[Math.floor(Math.random() * available.length)]
        p = { ...p, skills: [...p.skills, skill] }
        notifications.push({ type: 'skill', skill })
      }
    }
  }
  return { player: p, notifications }
}

// ── GRID ────────────────────────────────────────────────────
export const generateGrid = () => {
  const weights = { fight: 48, hard_fight: 5, event: 20, town: 5, camp: 5, treasure: 3, curse: 2, wilderness: 12 }
  const pool = []
  Object.entries(weights).forEach(([t, c]) => { for (let i = 0; i < c; i++) pool.push(t) })

  const grid = {}
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (x === 0 && y === 0) grid[`${x},${y}`] = 'start'
      else if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) grid[`${x},${y}`] = 'dragon'
      else grid[`${x},${y}`] = pool[Math.floor(Math.random() * pool.length)]
    }
  }

  // Pick one random town tile to secretly be a cultist church
  const townKeys = Object.entries(grid)
    .filter(([, v]) => v === 'town')
    .map(([k]) => k)
  const cultistChurchKey = townKeys.length > 0
    ? townKeys[Math.floor(Math.random() * townKeys.length)]
    : null

  return { grid, cultistChurchKey }
}

// BFS: can we reach (GRID_SIZE-1, GRID_SIZE-1) from `from` without stepping on `visited`?
const canReachDragon = (from, visited) => {
  const goal = `${GRID_SIZE - 1},${GRID_SIZE - 1}`
  if (from.x === GRID_SIZE - 1 && from.y === GRID_SIZE - 1) return true

  const queue = [from]
  const seen = new Set([`${from.x},${from.y}`])

  while (queue.length > 0) {
    const { x, y } = queue.shift()
    const neighbors = [
      { x: x-1, y: y+1 }, { x, y: y+1 }, { x: x+1, y: y+1 },
      { x: x-1, y },                       { x: x+1, y },
      { x: x-1, y: y-1 }, { x, y: y-1 }, { x: x+1, y: y-1 },
    ]
    for (const n of neighbors) {
      const key = `${n.x},${n.y}`
      if (n.x < 0 || n.x >= GRID_SIZE || n.y < 0 || n.y >= GRID_SIZE) continue
      if (seen.has(key)) continue
      if (key === goal) return true
      // Can walk through unvisited squares only
      if (!visited.has(key)) {
        seen.add(key)
        queue.push(n)
      }
    }
  }
  return false
}

export const getValidMoves = (position, visited) => {
  const { x, y } = position
  const neighbors = [
    { x: x-1, y: y+1 }, { x, y: y+1 }, { x: x+1, y: y+1 },
    { x: x-1, y },                       { x: x+1, y },
    { x: x-1, y: y-1 }, { x, y: y-1 }, { x: x+1, y: y-1 },
  ]

  return neighbors.filter(move => {
    if (move.x < 0 || move.x >= GRID_SIZE) return false
    if (move.y < 0 || move.y >= GRID_SIZE) return false
    if (visited.has(`${move.x},${move.y}`)) return false

    // Simulate visiting this square and check dragon is still reachable
    const newVisited = new Set([...visited, `${move.x},${move.y}`])
    return canReachDragon(move, newVisited)
  })
}

// ── DRAGON ──────────────────────────────────────────────────
export const createDragon = (diffMult = 1) => {
  const m = diffMult
  return {
    ...DRAGON_BASE,
    attack:        Math.floor(DRAGON_BASE.attack    * m),
    defense:       Math.floor(DRAGON_BASE.defense   * m),
    max_hp:        Math.floor(DRAGON_BASE.max_hp    * m),
    hp:            Math.floor(DRAGON_BASE.max_hp    * m),
    base_attack:   Math.floor(DRAGON_BASE.base_attack  * m),
    base_defense:  Math.floor(DRAGON_BASE.base_defense * m),
    base_hp:       Math.floor(DRAGON_BASE.base_hp      * m),
    increment: {
      attack:  Math.floor(DRAGON_BASE.increment.attack  * m),
      defense: Math.floor(DRAGON_BASE.increment.defense * m),
      hp:      Math.floor(DRAGON_BASE.increment.hp      * m),
    },
    minions: [],
  }
}

export const scaleDragon = (dragon, turn) => {
  const newPower = Math.floor(turn / 5)
  if (newPower <= dragon.power_level) return { dragon, powered: false }
  const d = {
    ...dragon,
    power_level: newPower,
    attack:  dragon.base_attack  + newPower * dragon.increment.attack,
    defense: dragon.base_defense + newPower * dragon.increment.defense,
    max_hp:  dragon.base_hp      + newPower * dragon.increment.hp,
    hp:      dragon.base_hp      + newPower * dragon.increment.hp,
  }
  return { dragon: d, powered: true }
}

// ── ENEMIES ─────────────────────────────────────────────────
export const mkEnemy = (name, atk, def, hp) => ({
  name, attack: atk, defense: def, max_hp: hp, hp, minions: [],
})

export const getEncounterByTier = (tier, type, diffMult = 1) => {
  const typeMult = type === 'hard_fight' ? 1.5 : 1
  const totalMult = typeMult * diffMult
  const list = ENCOUNTER_TIERS[Math.min(tier, 4)]
  const enc = list[Math.floor(Math.random() * list.length)]
  return {
    ...enc,
    atk: Math.floor(enc.atk * totalMult),
    def: Math.floor(enc.def * totalMult),
    hp:  Math.floor(enc.hp  * totalMult),
    count: enc.count ? enc.count() : 1,
  }
}

export const buildEnemies = (enc) => {
  const enemies = []
  if (enc.multi) {
    for (let i = 0; i < enc.count; i++)
      enemies.push(mkEnemy(`${enc.name} #${i+1}`, enc.atk, enc.def, enc.hp))
  } else if (enc.companion) {
    enemies.push(mkEnemy(enc.name, enc.atk, enc.def, enc.hp))
    enemies.push(mkEnemy(enc.companion.name, enc.companion.atk, enc.companion.def, enc.companion.hp))
  } else {
    const e = mkEnemy(enc.name, enc.atk, enc.def, enc.hp)
    if (enc.canSummon) e.canSummon = true
    if (enc.dropItem)  e.dropItem  = enc.dropItem
    if (enc.dropChance) e.dropChance = enc.dropChance
    enemies.push(e)
  }
  return enemies
}

// ── COMBAT ACTIONS ──────────────────────────────────────────
export const AP_COSTS = {
  attack: 1, block: 1, strong: 2, whirlwind: 2,
  ironwill: 1, cleave: 2, parry: 2, berserk: 1,
}

export const calcDamage = (atk, def) => Math.max(0, atk - def)

// Returns { enemies, logs, newBuffs } — pure, no side effects
export const resolvePlayerAction = (action, { player, enemies, selectedTarget, battleBuffs, blockBonus, apRemaining }) => {
  const cAtk = player.attack + battleBuffs.atk
  const target = enemies[selectedTarget]
  const logs = []
  let newEnemies = enemies.map(e => ({ ...e }))
  let newBuffs = { ...battleBuffs }
  let newBlockBonus = blockBonus
  let newAp = apRemaining - AP_COSTS[action]

  const t = newEnemies[selectedTarget]

  switch (action) {
    case 'attack': {
      const dmg = calcDamage(cAtk, t.defense)
      t.hp -= dmg
      logs.push({ msg: `You deal ${dmg} damage to ${t.name}!` })
      break
    }
    case 'strong': {
      const dmg = calcDamage(Math.floor(cAtk * 2.25), t.defense)
      t.hp -= dmg
      logs.push({ msg: `💥 Strong Attack! ${dmg} damage to ${t.name}!` })
      break
    }
    case 'whirlwind': {
      logs.push({ msg: '🌪 WHIRLWIND STRIKE!' })
      let total = 0
      for (let i = 0; i < 3; i++) {
        if (t.hp > 0) { const h = calcDamage(cAtk, t.defense); t.hp -= h; total += h }
      }
      logs.push({ msg: `Total: ${total} damage!` })
      break
    }
    case 'ironwill':
      if (newBuffs.ironWillStacks >= 5) {
        logs.push({ msg: '🛡 Iron Will is at maximum strength!' })
        newAp = apRemaining // no AP spent
      } else {
        newBuffs = { ...newBuffs, def: newBuffs.def + 2, ironWillStacks: newBuffs.ironWillStacks + 1 }
        logs.push({ msg: `🛡 IRON WILL! Defense +2! (${newBuffs.ironWillStacks}/5 stacks)` })
      }
      break
    case 'cleave': {
      logs.push({ msg: '⚔ CLEAVE!' })
      newEnemies = newEnemies.map(e => {
        if (e.hp <= 0) return e
        const d = calcDamage(cAtk, e.defense)
        logs.push({ msg: `Hit ${e.name} for ${d}!` })
        return { ...e, hp: e.hp - d }
      })
      break
    }
    case 'block':
      if (newBlockBonus === 0) {
        newBlockBonus = player.defense + battleBuffs.def
        logs.push({ msg: `🛡 You brace! Blocking ${newBlockBonus} damage this turn.` })
      } else {
        newBlockBonus += 2
        logs.push({ msg: `🛡 Braced harder! Block bonus now ${newBlockBonus} this turn.` })
      }
      break
    case 'berserk':
      if (newBuffs.berserkUses >= 2) {
        logs.push({ msg: '😤 Berserk is spent for this battle!' })
        newAp = apRemaining
      } else {
        newBuffs = { ...newBuffs, atk: newBuffs.atk + 4, def: newBuffs.def - 2, berserkUses: newBuffs.berserkUses + 1 }
        logs.push({ msg: `😤 BERSERK! ATK +4, DEF -2! (${newBuffs.berserkUses}/2 uses)` })
      }
      break
    default: break
  }

  // Auto-select next alive target if current is dead
  let newTarget = selectedTarget
  if (newEnemies[newTarget]?.hp <= 0) {
    const idx = newEnemies.findIndex(e => e.hp > 0)
    if (idx >= 0) newTarget = idx
  }

  return { enemies: newEnemies, logs, newBuffs, newBlockBonus, newAp, newTarget }
}

// ── ENEMY TURN ───────────────────────────────────────────────
export const resolveEnemyTurn = ({ player, enemies, battleBuffs, blockBonus, playerBlocking, playerParrying }) => {
  const cAtk = player.attack + battleBuffs.atk
  let newHp = player.hp
  let newEnemies = enemies.map(e => ({ ...e }))
  const logs = []
  let newParrying = playerParrying

  newEnemies.forEach((enemy, i) => {
    if (enemy.hp <= 0) return

    // Dragon summon
    if (enemy.isDragon && enemy.minions.filter(m => m.hp > 0).length < 2 && Math.random() < 0.3) {
      const goblin = mkEnemy(
        `Goblin #${newEnemies.length + 1}`,
        3 + Math.floor(Math.random() * 3), 2,
        15 + Math.floor(Math.random() * 6)
      )
      newEnemies[i] = { ...newEnemies[i], minions: [...newEnemies[i].minions, goblin] }
      newEnemies = [...newEnemies, goblin]
      logs.push({ msg: `🔮 Dragon summons ${goblin.name}!`, cls: 'log-danger' })
    }

    if (newParrying) {
      const fullNegate   = Math.random() < 0.5
      const halfNegate   = !fullNegate && Math.random() < 0.5
      const doubleCounter = Math.random() < 0.5
      const base = Math.max(0, cAtk * 2 - enemy.defense)
      const counter = doubleCounter ? base * 2 : base
      newEnemies[i] = { ...newEnemies[i], hp: newEnemies[i].hp - counter }

      let dmgTaken = 0
      if (fullNegate) dmgTaken = 0
      else if (halfNegate) dmgTaken = Math.floor(Math.max(0, enemy.attack - (playerBlocking ? blockBonus : 0)) / 2)
      else dmgTaken = Math.max(0, enemy.attack - (playerBlocking ? blockBonus : 0))
      newHp -= dmgTaken

      const negateTxt  = fullNegate ? '✨ Full negate!' : halfNegate ? '⚡ Half negate!' : '💢 No negate!'
      const counterTxt = doubleCounter ? `💥 Double counter for ${counter}!` : `Counter for ${counter}!`
      logs.push({ msg: `🗡 PARRY vs ${enemy.name}: ${negateTxt} ${counterTxt}${dmgTaken > 0 ? ` (took ${dmgTaken})` : ''}`, cls: 'log-victory' })
    } else {
      const dmg = Math.max(0, enemy.attack - (playerBlocking ? blockBonus : 0))
      newHp -= dmg
      const blocked = playerBlocking && blockBonus > 0 ? ` (blocked ${Math.min(blockBonus, enemy.attack)})` : ''
      logs.push({ msg: `${enemy.name} attacks for ${dmg}!${blocked}`, cls: 'log-danger' })
    }
  })

  return { newHp, enemies: newEnemies, logs }
}

// ── ENCOUNTER HANDLERS ───────────────────────────────────────
export const handleTreasure = (player, tier) => {
  const gold = Math.floor(Math.random() * 201) + 100 + tier * 50
  const items = ['Rare Gem', 'Ancient Artifact', 'Magic Scroll', 'Enchanted Ring', 'Seer Stone', 'Local Map']
  const item = items[Math.floor(Math.random() * items.length)]
  const newPlayer = applyPickupEffect(
    { ...player, gold: player.gold + gold, inventory: [...player.inventory, item] },
    item
  )
  // 10% cursed treasure, 15% ambush (resolved by store)
  const cursed = Math.random() < 0.10
  const ambush = Math.random() < 0.15
  return { player: newPlayer, gold, item, cursed, ambush }
}

export const handleEvent = (player) => {
  const roll = Math.random()

  // 5% trap — lose HP or lose gold
  if (roll < 0.05) {
    if (Math.random() < 0.5) {
      const dmg = Math.floor(player.max_hp * 0.2)
      return { player: { ...player, hp: Math.max(1, player.hp - dmg) }, ev: 'trap', trapType: 'damage', trapDmg: dmg, wandererOffer: false, item: null, blessing: null }
    } else {
      const lost = Math.floor(player.gold * 0.05)
      return { player: { ...player, gold: Math.max(0, player.gold - lost) }, ev: 'trap', trapType: 'gold', trapGold: lost, wandererOffer: false, item: null, blessing: null }
    }
  }

  // 5% cultists — apply a curse
  if (roll < 0.10) {
    const curse = ['Curse of Weakness', 'Curse of Frailty', 'Curse of Misfortune'][Math.floor(Math.random() * 3)]
    const newPlayer = applyPickupEffect({ ...player, curses: [...player.curses, curse] }, curse)
    return { player: newPlayer, ev: 'cultists', curse, wandererOffer: false, item: null, blessing: null }
  }

  // 10% wanderer offering Seer Stone
  if (roll < 0.20) {
    return { player, ev: 'strange wanderer', wandererOffer: true, item: null, blessing: null }
  }

  const events = ['mysterious shrine', 'traveling merchant', 'ancient tome']
  const ev = events[Math.floor(Math.random() * events.length)]
  if (Math.random() < 0.5) {
    const item = ['Health Potion', 'Strength Ring', 'Lucky Charm'][Math.floor(Math.random() * 3)]
    const newPlayer = applyPickupEffect({ ...player, inventory: [...player.inventory, item] }, item)
    return { player: newPlayer, ev, item, blessing: null, wandererOffer: false }
  } else {
    const blessing = ['Blessing of Strength', 'Blessing of Defense'][Math.floor(Math.random() * 2)]
    const newPlayer = applyPickupEffect({ ...player, blessings: [...player.blessings, blessing] }, blessing)
    return { player: newPlayer, ev, item: null, blessing, wandererOffer: false }
  }
}

export const handleCurse = (player) => {
  const curse = ['Curse of Weakness', 'Curse of Frailty', 'Curse of Misfortune'][Math.floor(Math.random() * 3)]
  const newPlayer = applyPickupEffect({ ...player, curses: [...player.curses, curse] }, curse)
  return { player: newPlayer, curse }
}

// ── WILDERNESS ───────────────────────────────────────────────
// Returns one of five outcomes — the store handles the side effects
// (starting fights, placing quests, revealing tiles)
export const rollWildernessOutcome = () => {
  const roll = Math.random()
  if (roll < 0.20) return 'berries'      // 20% — heal
  if (roll < 0.40) return 'ambush'       // 20% — fight
  if (roll < 0.58) return 'traveler'     // 18% — quest
  if (roll < 0.78) return 'brambles'     // 20% — damage
  return 'dragon_sighting'               // 22% — reveal surrounding tiles
}

export const applyWildernessBerries = (player) => {
  const heal = Math.floor(player.max_hp * 0.25)
  return { player: { ...player, hp: Math.min(player.max_hp, player.hp + heal) }, heal }
}

export const applyWildernessBrambles = (player) => {
  const dmg = Math.floor(player.max_hp * 0.15)
  return { player: { ...player, hp: Math.max(1, player.hp - dmg) }, dmg }
}

// Returns the set of keys that the dragon sighting reveals (3-radius ring around pos)
export const dragonSightingReveal = (pos, visited, grid, GRID_SIZE_ARG) => {
  const size = GRID_SIZE_ARG || GRID_SIZE
  const revealed = []
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = pos.x + dx, ny = pos.y + dy
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue
      const key = `${nx},${ny}`
      if (!visited.has(key)) revealed.push(key)
    }
  }
  return revealed
}

// ── QUESTS ──────────────────────────────────────────────────
export const placeQuestTile = (position, visited, reward) => {
  const candidates = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) continue
      if (x === position.x && y === position.y) continue
      if (visited.has(`${x},${y}`)) continue
      candidates.push({ x, y, dist: Math.max(Math.abs(x - position.x), Math.abs(y - position.y)) })
    }
  }
  const pool = candidates.filter(c => c.dist >= 2 && c.dist <= 5)
  const chosen = (pool.length > 0 ? pool : candidates)[Math.floor(Math.random() * (pool.length || candidates.length))]
  return chosen ? { tile: chosen, reward } : null
}

export const pickQuestTemplate = () =>
  QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)]
