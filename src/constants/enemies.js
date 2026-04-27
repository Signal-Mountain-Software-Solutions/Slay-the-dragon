export const ENCOUNTER_WEIGHTS = {
  fight: 48, hard_fight: 5, event: 20, town: 5, camp: 5, treasure: 3, curse: 2, wilderness: 12,
}

export const TERRAIN_ICONS = {
  fight: '⚔', hard_fight: '💀', event: '✦', town: '🏘', camp: '🏕',
  treasure: '💰', curse: '☠', dragon: '🐉', start: '★', wilderness: '🌲',
}

export const ENCOUNTER_TIERS = {
  0: [
    { name: 'Goblin',        atk: 3, def: 2, hp: 15 },
    { name: 'Slime',         atk: 2, def: 1, hp: 10, count: () => Math.random() > 0.5 ? 1 : 2 },
    { name: 'Angry Chicken', atk: 2, def: 1, hp: 8  },
  ],
  1: [
    { name: 'Goblin',        atk: 5, def: 3, hp: 20 },
    { name: 'Wolf',          atk: 6, def: 3, hp: 22 },
    { name: 'Zombie',        atk: 5, def: 4, hp: 25 },
    { name: 'Wild Boar',     atk: 6, def: 4, hp: 23 },
    { name: 'Angry Chicken', atk: 4, def: 2, hp: 12, count: () => Math.random() > 0.5 ? 2 : 3, multi: true },
  ],
  2: [
    { name: 'Hob-Goblin',        atk: 8,  def: 5, hp: 35 },
    { name: 'Orc',               atk: 9,  def: 6, hp: 40 },
    { name: 'Bear',              atk: 10, def: 5, hp: 45 },
    { name: 'Skeleton Warrior',  atk: 8,  def: 7, hp: 35 },
  ],
  3: [
    { name: 'Wolf',             atk: 10, def: 5, hp: 30, count: () => Math.random() > 0.5 ? 2 : 3, multi: true },
    { name: 'Lizard Man',       atk: 12, def: 8, hp: 50 },
    { name: 'Skeleton Warrior', atk: 11, def: 9, hp: 45,
      companion: { name: 'Skeleton Archer', atk: 9, def: 6, hp: 35 } },
  ],
  4: [
    { name: 'Necromancer', atk: 14, def: 8,  hp: 60, canSummon: true },
    { name: 'Orc',         atk: 15, def: 10, hp: 55, count: () => Math.random() > 0.5 ? 2 : 3, multi: true },
    { name: 'Giant Chicken', atk: 10, def: 8,  hp: 70, dropItem: 'Chicken Leg' },
    { name: 'Giant Boar',    atk: 16, def: 12, hp: 75, dropItem: 'Porkchop' },
    { name: 'Baby Dragon',   atk: 18, def: 12, hp: 80, dropChance: 0.25 },
  ],
}

export const DRAGON_BASE = {
  name: 'Dragon',
  attack: 15, defense: 15, max_hp: 125, hp: 125,
  base_attack: 15, base_defense: 15, base_hp: 125,
  increment: { attack: 2, defense: 2, hp: 5 },
  power_level: 0, isDragon: true,
}

export const QUEST_TEMPLATES = [
  { desc: 'Investigate the ruined watchtower',    gold: 200, exp: 175 },
  { desc: "Retrieve the stolen merchant's seal",  gold: 175, exp: 200 },
  { desc: 'Drive out the beast at the crossroads',gold: 150, exp: 225 },
  { desc: "Recover the soldier's lost standard",  gold: 225, exp: 150 },
  { desc: 'Cleanse the cursed shrine',            gold: 180, exp: 180 },
  { desc: 'Scout the dark forest edge',           gold: 130, exp: 250 },
]

export const WILDERNESS_QUEST_TEMPLATES = [
  { desc: 'Find the lost hermit deep in the forest', gold: 160, exp: 190 },
  { desc: 'Gather rare herbs from the cursed glade', gold: 140, exp: 210 },
  { desc: 'Track the beast that prowls these woods',  gold: 170, exp: 180 },
  { desc: 'Bring word to the ranger outpost ahead',   gold: 120, exp: 220 },
]

export const BLESSING_NAMES = [
  'Blessing of Strength', 'Blessing of Defense',
  'Blessing of Vitality', 'Blessing of Endurance',
]

export const SKILL_POOL = ['Whirlwind Strike', 'Iron Will', 'Cleave', 'Parry', 'Berserk']

export const GRID_SIZE = 10

// Difficulty multipliers — applied to all enemy stats and dragon base/increment stats
export const DIFFICULTY = {
  easy:   { enemyMult: 1.00, dragonMult: 1.00, scoreBonus: 0,    label: 'Easy',   color: '#70C070', desc: 'For those learning the way of the sword.' },
  medium: { enemyMult: 1.25, dragonMult: 1.25, scoreBonus: 500,  label: 'Medium', color: '#C8A040', desc: 'The realm is a dangerous place. Tread carefully.' },
  hard:   { enemyMult: 1.50, dragonMult: 1.50, scoreBonus: 1500, label: 'Hard',   color: '#C84040', desc: 'Only legends survive. You will likely die.' },
}
