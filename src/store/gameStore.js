import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createPlayer, gainExp, generateGrid, getValidMoves,
  createDragon, scaleDragon, mkEnemy, getEncounterByTier, buildEnemies,
  resolvePlayerAction, resolveEnemyTurn, AP_COSTS,
  handleTreasure, handleEvent, handleCurse, placeQuestTile, pickQuestTemplate,
} from '../logic/game'
import { applyUseEffect, getItemEffect, ITEM_DEFS } from '../constants/items'
import { BLESSING_NAMES, GRID_SIZE } from '../constants/enemies'

const INITIAL_COMBAT = {
  enemies: [], selectedTarget: 0,
  battleBuffs: { atk: 0, def: 0, ironWillStacks: 0, berserkUses: 0 },
  playerBlocking: false, playerParrying: false,
  blockBonus: 0, apRemaining: 0,
  enemyTurnPending: false,
  encounterData: null,
}

const useGameStore = create(
  persist(
    (set, get) => ({
      // ── world ──
      player: createPlayer(),
      position: { x: 0, y: 0 },
      visited: ['0,0'],
      turn: 0,
      grid: {},
      dragon: createDragon(),
      activeQuest: null,
      townVisited: { shop: false, tavern: false, church: false },

      // ── ui ──
      gameLog: ['Welcome to How to Slay a Dragon! Your quest: Defeat the Dragon at (9,9)'],
      screen: 'exploring', // exploring | combat | town | victory | gameover
      townScreen: null,    // null | shop | tavern | church
      notification: null,
      pendingQuestReward: null,
      pendingBlessing: null,

      // ── combat ──
      ...INITIAL_COMBAT,

      // ── actions ──
      initGame: () => {
        set({
          player: createPlayer(),
          position: { x: 0, y: 0 },
          visited: ['0,0'],
          turn: 0,
          grid: generateGrid(),
          dragon: createDragon(),
          activeQuest: null,
          townVisited: { shop: false, tavern: false, church: false },
          gameLog: ['Welcome to How to Slay a Dragon! Your quest: Defeat the Dragon at (9,9)'],
          screen: 'exploring',
          townScreen: null,
          notification: null,
          ...INITIAL_COMBAT,
        })
      },

      addLog: (msg, cls = '') => set(s => ({
        gameLog: [...s.gameLog.slice(-50), { msg, cls }]
      })),

      showNotification: (msg) => {
        set({ notification: msg })
        setTimeout(() => set({ notification: null }), 2500)
      },

      moveTo: (newPos) => {
        const s = get()
        if (s.enemyTurnPending) return
        const newVisited = [...s.visited, `${newPos.x},${newPos.y}`]
        const newTurn = s.turn + 1

        // Dragon scaling
        const { dragon, powered } = scaleDragon(s.dragon, newTurn)

        set({ position: newPos, visited: newVisited, turn: newTurn, dragon })

        if (powered) {
          get().addLog(`🐉 The Dragon grows stronger! Power Level: ${dragon.power_level}`, 'log-danger')
          get().showNotification(`Dragon Power Level ${dragon.power_level}!`)
        }

        get().handleEncounter(newPos)
      },

      handleEncounter: (pos) => {
        const s = get()
        const key = `${pos.x},${pos.y}`

        // Quest completion
        if (s.activeQuest && s.activeQuest.tile.x === pos.x && s.activeQuest.tile.y === pos.y) {
          const { gold, exp, desc } = s.activeQuest.reward
          const { player, notifications } = gainExp({ ...s.player, gold: s.player.gold + gold }, exp)
          set({ player, activeQuest: null })
          notifications.forEach(n => {
            if (n.type === 'level') get().addLog(`🎉 LEVEL UP! Now Level ${n.level}!`, 'log-level')
            if (n.type === 'skill') get().addLog(`✨ New Skill: ${n.skill}!`, 'log-level')
          })
          get().addLog(`⭐ Quest complete: "${desc}"! Earned ${gold} Gold & ${exp} EXP!`, 'log-level')
          get().showNotification('Quest Complete!')
        }

        const type = s.grid[key]
        const tier = Math.floor(Math.max(pos.x, pos.y) / 2)

        switch (type) {
          case 'fight':
          case 'hard_fight': get().startFight(type, tier); break

          case 'town': {
            const newPlayer = { ...get().player, hp: get().player.max_hp }
            set({ player: newPlayer, screen: 'town', townScreen: null, townVisited: { shop: false, tavern: false, church: false } })
            get().addLog('🏘 You arrive at a town. HP fully restored!', 'log-victory')
            break
          }
          case 'camp': {
            const p = get().player
            const heal = Math.floor(p.max_hp / 2)
            set({ player: { ...p, hp: Math.min(p.max_hp, p.hp + heal) } })
            get().addLog(`🏕 You rest. Restored ${heal} HP!`, 'log-victory')
            break
          }
          case 'treasure': {
            const { player, gold, item } = handleTreasure(get().player, tier)
            set({ player })
            get().addLog(`💰 Treasure! ${gold} gold and ${item}! (${getItemEffect(item)})`, 'log-gold')
            break
          }
          case 'event': {
            const result = handleEvent(get().player)
            set({ player: result.player })
            get().addLog(`📜 EVENT: Found a ${result.ev}!`)
            if (result.item)     get().addLog(`Received: ${result.item} (${getItemEffect(result.item)})`, 'log-gold')
            if (result.blessing) get().addLog(`Received: ${result.blessing} (${getItemEffect(result.blessing)})`, 'log-gold')
            break
          }
          case 'curse': {
            const { player, curse } = handleCurse(get().player)
            set({ player })
            get().addLog(`💀 CURSE! Afflicted: ${curse} (${getItemEffect(curse)})`, 'log-danger')
            break
          }
          case 'dragon': get().startDragonFight(); break
        }
      },

      // ── COMBAT ──────────────────────────────────────────────
      startFight: (type, tier) => {
        const s = get()
        const enc = getEncounterByTier(tier, type)
        const enemies = buildEnemies(enc)
        const exp  = type === 'fight' ? 50 + tier * 25 : 100 + tier * 50
        const gold = type === 'fight' ? 50 + tier * 25 : 100 + tier * 50

        let buffs = { atk: 0, def: 0, ironWillStacks: 0, berserkUses: 0 }
        let logMsg = null
        let newPlayer = s.player

        if (s.player.pendingStrengthPotion) {
          buffs = { ...buffs, atk: 2 }
          newPlayer = { ...newPlayer, pendingStrengthPotion: false }
          logMsg = '🧪 Strength Potion activates! ATK +2 for this battle!'
        }

        const label = enc.multi
          ? `⚔ ${enc.count} ${enc.name}s appear!`
          : enc.companion
            ? `⚔ ${enc.name} and ${enc.companion.name} appear!`
            : `⚔ A ${enc.name} appears!`

        set({
          player: newPlayer,
          enemies,
          selectedTarget: 0,
          battleBuffs: buffs,
          playerBlocking: false,
          playerParrying: false,
          blockBonus: 0,
          apRemaining: Math.floor(newPlayer.action_points),
          enemyTurnPending: false,
          encounterData: { type, tier, exp, gold, enemyData: enc },
          screen: 'combat',
        })
        get().addLog(label, 'log-danger')
        if (logMsg) get().addLog(logMsg, 'log-gold')
      },

      startDragonFight: () => {
        const s = get()
        const d = { ...s.dragon, isDragon: true, minions: [] }
        let buffs = { atk: 0, def: 0, ironWillStacks: 0, berserkUses: 0 }
        let newPlayer = s.player

        if (s.player.pendingStrengthPotion) {
          buffs = { ...buffs, atk: 2 }
          newPlayer = { ...newPlayer, pendingStrengthPotion: false }
          get().addLog('🧪 Strength Potion activates! ATK +2 for this battle!', 'log-gold')
        }

        set({
          player: newPlayer,
          enemies: [d],
          selectedTarget: 0,
          battleBuffs: buffs,
          playerBlocking: false,
          playerParrying: false,
          blockBonus: 0,
          apRemaining: Math.floor(newPlayer.action_points),
          enemyTurnPending: false,
          encounterData: { type: 'dragon', tier: 5, exp: 500, gold: 1000, enemyData: null },
          screen: 'combat',
        })
        get().addLog('🐉 THE DRAGON AWAITS!', 'log-danger')
      },

      setSelectedTarget: (idx) => set({ selectedTarget: idx }),

      performAction: (action) => {
        const s = get()
        if (s.enemyTurnPending) return

        const cost = AP_COSTS[action] || 1
        if (s.apRemaining < cost) return

        const target = s.enemies[s.selectedTarget]
        if (!target || target.hp <= 0) {
          const idx = s.enemies.findIndex(e => e.hp > 0)
          if (idx >= 0) set({ selectedTarget: idx })
          return
        }

        // Parry special case
        if (action === 'parry') {
          set({ playerParrying: true, apRemaining: s.apRemaining - cost })
          get().addLog('🗡 PARRY STANCE! You will counter the next attack!')
          if (s.apRemaining - cost <= 0) get().doEnemyTurn()
          return
        }

        const result = resolvePlayerAction(action, {
          player: s.player,
          enemies: s.enemies,
          selectedTarget: s.selectedTarget,
          battleBuffs: s.battleBuffs,
          blockBonus: s.blockBonus,
          apRemaining: s.apRemaining,
        })

        result.logs.forEach(l => get().addLog(l.msg, l.cls || ''))

        if (result.enemies.every(e => e.hp <= 0)) {
          set({ enemies: result.enemies })
          get().endCombat(true)
          return
        }

        set({
          enemies: result.enemies,
          battleBuffs: result.newBuffs,
          blockBonus: result.newBlockBonus,
          apRemaining: result.newAp,
          selectedTarget: result.newTarget,
        })

        if (result.newAp <= 0) get().doEnemyTurn()
      },

      doEnemyTurn: () => {
        set({ enemyTurnPending: true })
        setTimeout(() => {
          const s = get()
          const result = resolveEnemyTurn({
            player: s.player,
            enemies: s.enemies,
            battleBuffs: s.battleBuffs,
            blockBonus: s.blockBonus,
            playerBlocking: s.playerBlocking,
            playerParrying: s.playerParrying,
          })

          result.logs.forEach(l => get().addLog(l.msg, l.cls || ''))

          const newPlayer = { ...s.player, hp: result.newHp }
          set({
            player: newPlayer,
            enemies: result.enemies,
            playerBlocking: false,
            playerParrying: false,
            blockBonus: 0,
            enemyTurnPending: false,
            apRemaining: Math.floor(s.player.action_points),
          })

          if (result.newHp <= 0) { get().endCombat(false); return }
          if (result.enemies.every(e => e.hp <= 0)) { get().endCombat(true); return }
        }, 600)
      },

      endCombat: (victory) => {
        set({ enemyTurnPending: false })
        if (victory) {
          get().addLog('✅ Victory!', 'log-victory')
          const s = get()
          const { exp, gold, enemyData } = s.encounterData
          let p = { ...s.player, gold: s.player.gold + gold }

          if (enemyData?.dropItem) {
            p = { ...p, inventory: [...p.inventory, enemyData.dropItem] }
            get().addLog(`Found: ${enemyData.dropItem}! (${getItemEffect(enemyData.dropItem)})`, 'log-gold')
          }
          if (enemyData?.dropChance && Math.random() < enemyData.dropChance) {
            const drops = ['Dragon Scale Shield', 'Dragon Tooth Sword']
            const drop = drops[Math.floor(Math.random() * 2)]
            p = { ...p, inventory: [...p.inventory, drop] }
            get().addLog(`🌟 Rare Drop: ${drop}! (${getItemEffect(drop)})`, 'log-gold')
          }

          const { player, notifications } = gainExp(p, exp)
          notifications.forEach(n => {
            if (n.type === 'level') { get().addLog(`🎉 LEVEL UP! Now Level ${n.level}!`, 'log-level'); get().showNotification(`Level ${n.level}!`) }
            if (n.type === 'skill') { get().addLog(`✨ New Skill: ${n.skill}!`, 'log-level'); get().showNotification(`Skill: ${n.skill}!`) }
          })
          get().addLog(`Gained ${exp} EXP and ${gold} Gold!`, 'log-gold')
          set({ player, screen: s.encounterData.type === 'dragon' ? 'victory' : 'exploring' })
        } else {
          get().addLog('💀 You have been defeated!', 'log-danger')
          set({ screen: 'gameover' })
        }
      },

      useItem: (name) => {
        const s = get()
        const newPlayer = applyUseEffect(s.player, name)
        if (newPlayer === s.player) return
        const def = ITEM_DEFS[name]
        const msg = def?.battleOnly
          ? `🧪 Used ${name} — will apply at the start of your next battle!`
          : `🧪 Used ${name}! (${getItemEffect(name)})`
        set({ player: newPlayer })
        get().addLog(msg, 'log-gold')
      },

      // ── TOWN ────────────────────────────────────────────────
      setTownScreen: (screen) => set({ townScreen: screen }),
      leaveTown: () => set({ screen: 'exploring', townScreen: null }),

      buyItem: (name, cost) => {
        const s = get()
        if (s.player.gold < cost) return
        const newPlayer = { ...s.player, gold: s.player.gold - cost, inventory: [...s.player.inventory, name] }
        set({ player: newPlayer, townVisited: { ...s.townVisited, shop: true } })
        get().addLog(`Purchased ${name}!`, 'log-gold')
      },

      buyStat: (stat, amount, cost, label) => {
        const s = get()
        if (s.player.gold < cost) return
        set({ player: { ...s.player, gold: s.player.gold - cost, [stat]: s.player[stat] + amount }, townVisited: { ...s.townVisited, shop: true } })
        get().addLog(`Purchased ${label}! ${stat} +${amount}`, 'log-gold')
      },

      acceptQuest: () => {
        const s = get()
        const reward = s.pendingQuestReward
        const quest = placeQuestTile(s.position, new Set(s.visited), reward)
        if (!quest) { get().addLog('No valid quest location found.', 'log-danger'); return }
        set({ activeQuest: quest, townVisited: { ...s.townVisited, tavern: true }, pendingQuestReward: null, screen: 'exploring', townScreen: null })
        get().addLog(`📜 Quest accepted: "${reward.desc}" — head to (${quest.tile.x}, ${quest.tile.y})!`, 'log-gold')
      },

      setPendingQuestReward: (reward) => set({ pendingQuestReward: reward }),

      acceptBlessing: () => {
        const s = get()
        const name = s.pendingBlessing
        if (!name) return
        const { apply } = ITEM_DEFS[name] || {}
        const newPlayer = apply ? apply({ ...s.player, blessings: [...s.player.blessings, name] }) : s.player
        set({ player: newPlayer, pendingBlessing: null, townVisited: { ...s.townVisited, church: true } })
        get().addLog(`✦ Received ${name}! (${getItemEffect(name)})`, 'log-gold')
      },

      setPendingBlessing: () => {
        const name = BLESSING_NAMES[Math.floor(Math.random() * BLESSING_NAMES.length)]
        set({ pendingBlessing: name })
        return name
      },

      acceptQuestReward: (gold, exp) => {
        const s = get()
        const { player, notifications } = gainExp({ ...s.player, gold: s.player.gold + gold }, exp)
        notifications.forEach(n => {
          if (n.type === 'level') get().addLog(`🎉 LEVEL UP! Now Level ${n.level}!`, 'log-level')
        })
        get().addLog(`Quest reward: ${gold} Gold, ${exp} EXP!`, 'log-gold')
        set({ player, townVisited: { ...s.townVisited, tavern: true }, townScreen: null })
      },
    }),
    {
      name: 'dragon-slayer-save',
      partialize: (s) => ({
        player: s.player, position: s.position, visited: s.visited,
        turn: s.turn, grid: s.grid, dragon: s.dragon,
        activeQuest: s.activeQuest, gameLog: s.gameLog.slice(-20),
        screen: s.screen === 'combat' ? 'exploring' : s.screen,
      }),
    }
  )
)

export default useGameStore
