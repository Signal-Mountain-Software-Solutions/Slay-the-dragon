import { DIFFICULTY } from '../constants/enemies'

// Consumable items that count as "unused" bonus — held but not used
const USABLE_ITEMS = new Set(['Health Potion', 'Strength Potion', 'Chicken Leg', 'Porkchop'])

export const calcScore = ({ player, stats, dragon, difficulty }) => {
  const lines = []

  // ── POSITIVES ─────────────────────────────────────────────
  const goldScore = Math.floor(player.gold / 10)
  lines.push({ label: 'Gold remaining',     value: `${player.gold}g`,              score: goldScore,    positive: true })

  const unusedItems = player.inventory.filter(n => USABLE_ITEMS.has(n)).length
  const itemScore = unusedItems * 50
  lines.push({ label: 'Unused consumables', value: `×${unusedItems}`,              score: itemScore,    positive: true })

  const killScore = stats.enemiesKilled * 20
  lines.push({ label: 'Enemies slain',      value: `×${stats.enemiesKilled}`,      score: killScore,    positive: true })

  const blessingScore = player.blessings.length * 75
  lines.push({ label: 'Blessings received', value: `×${player.blessings.length}`,  score: blessingScore, positive: true })

  const questScore = stats.questsCompleted * 200
  lines.push({ label: 'Quests completed',   value: `×${stats.questsCompleted}`,    score: questScore,   positive: true })

  const levelScore = (player.level - 1) * 150
  lines.push({ label: 'Final level',        value: `Lv.${player.level}`,           score: levelScore,   positive: true })

  // Difficulty bonus
  const diff = DIFFICULTY[difficulty]
  if (diff?.scoreBonus > 0) {
    lines.push({ label: `${diff.label} difficulty`, value: 'bonus',                score: diff.scoreBonus, positive: true })
  }

  // ── NEGATIVES ─────────────────────────────────────────────
  const dragonPenalty = dragon.power_level * 300
  lines.push({ label: 'Dragon power level', value: `Lv.${dragon.power_level}`,     score: -dragonPenalty, positive: false })

  const cursePenalty = player.curses.length * 100
  lines.push({ label: 'Curses afflicted',   value: `×${player.curses.length}`,     score: -cursePenalty,  positive: false })

  const trapPenalty = stats.trapsTriggered * 50
  lines.push({ label: 'Traps triggered',    value: `×${stats.trapsTriggered}`,     score: -trapPenalty,   positive: false })

  const total = lines.reduce((sum, l) => sum + l.score, 0)

  // Rank thresholds scale with difficulty so they feel equally achievable
  const base = diff?.scoreBonus ?? 0
  let rank = 'F'
  if      (total >= 3000 + base) rank = 'S'
  else if (total >= 2000 + base) rank = 'A'
  else if (total >= 1200 + base) rank = 'B'
  else if (total >= 600  + base) rank = 'C'
  else if (total >= 0)           rank = 'D'

  return { lines, total, rank }
}

export const RANK_COLORS = {
  S: '#F0C040', A: '#70C070', B: '#7090E0', C: '#C8A040', D: '#8A7A6A', F: '#C84040'
}
