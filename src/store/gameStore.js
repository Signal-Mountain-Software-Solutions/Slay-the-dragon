import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createPlayer, gainExp, generateGrid, getValidMoves,
  createDragon, scaleDragon, mkEnemy, getEncounterByTier, buildEnemies,
  resolvePlayerAction, resolveEnemyTurn, AP_COSTS,
  handleTreasure, handleEvent, handleCurse, placeQuestTile, pickQuestTemplate,
  rollWildernessOutcome, applyWildernessBerries, applyWildernessBrambles, dragonSightingReveal,
} from '../logic/game'
import { applyUseEffect, getItemEffect, ITEM_DEFS } from '../constants/items'
import { BLESSING_NAMES, GRID_SIZE, WILDERNESS_QUEST_TEMPLATES, DIFFICULTY } from '../constants/enemies'

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
      cultistChurchKey: null,
      pendingCultistChurch: false,
      pendingNecromancerAttack: false,
      stats: { enemiesKilled: 0, questsCompleted: 0, trapsTriggered: 0 },
      difficulty: null,

      // ── ui ──
      gameLog: [{ msg: 'Welcome to How to Slay a Dragon! Your quest: Defeat the Dragon at (9,9)', cls: 'log-gold' }],
      screen: 'difficulty',
      townScreen: null,
      notification: null,
      pendingQuestReward: null,
      pendingBlessing: null,
      pendingWandererOffer: false,
      dragonRevealedTiles: [],

      // ── combat ──
      ...INITIAL_COMBAT,

      // ── actions ──
      initGame: (difficulty = 'easy') => {
        const { grid, cultistChurchKey } = generateGrid()
        const diffMult = DIFFICULTY[difficulty]?.enemyMult ?? 1
        set({
          player: createPlayer(),
          position: { x: 0, y: 0 },
          visited: ['0,0'],
          turn: 0,
          grid,
          cultistChurchKey,
          dragon: createDragon(diffMult),
          activeQuest: null,
          townVisited: { shop: false, tavern: false, church: false },
          pendingCultistChurch: false,
          pendingNecromancerAttack: false,
          stats: { enemiesKilled: 0, questsCompleted: 0, trapsTriggered: 0 },
          difficulty,
          gameLog: [{ msg: 'Welcome to How to Slay a Dragon! Your quest: Defeat the Dragon at (9,9)', cls: 'log-gold' }],
          screen: 'exploring',
          townScreen: null,
          notification: null,
          pendingBlessing: null,
          pendingQuestReward: null,
          pendingWandererOffer: false,
          dragonRevealedTiles: [],
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
          // 30% chance of bonus vision item with quest reward
          const visionBonus = Math.random() < 0.3
            ? (['Seer Stone', 'Local Map'][Math.floor(Math.random() * 2)])
            : null
          let basePlayer = { ...s.player, gold: s.player.gold + gold }
          if (visionBonus) basePlayer = { ...basePlayer, inventory: [...basePlayer.inventory, visionBonus] }
          const { player, notifications } = gainExp(basePlayer, exp)
          set({ player, activeQuest: null })
          notifications.forEach(n => {
            if (n.type === 'level') get().addLog(`🎉 LEVEL UP! Now Level ${n.level}!`, 'log-level')
            if (n.type === 'skill') get().addLog(`✨ New Skill: ${n.skill}!`, 'log-level')
          })
          get().addLog(`⭐ Quest complete: "${desc}"! Earned ${gold} Gold & ${exp} EXP!`, 'log-level')
          if (visionBonus) get().addLog(`🎁 Bonus reward: ${visionBonus}!`, 'log-gold')
          get().showNotification('Quest Complete!')
          set(s2 => ({ stats: { ...s2.stats, questsCompleted: s2.stats.questsCompleted + 1 } }))
        }

        const type = s.grid[key]
        const tier = Math.floor(Math.max(pos.x, pos.y) / 2)

        switch (type) {
          case 'fight':
          case 'hard_fight': get().startFight(type, tier); break

          case 'town': {
            const s3 = get()
            const isCultist = s3.cultistChurchKey === key
            const isDeep = pos.x > 4 || pos.y > 4
            const necromancerRoll = isDeep && Math.random() < 0.10

             set({
              player: newPlayer,
              screen: 'town',
              townScreen: null,
              townVisited: { shop: false, tavern: false, church: false },
              pendingCultistChurch: isCultist,
              pendingNecromancerAttack: !isCultist && necromancerRoll,
            })
            get().addLog('🏘 You arrive at a town.', 'log-victory')
            if (isCultist) get().addLog('Something feels wrong about this place...', 'log-danger')
            else if (necromancerRoll) get().addLog('The streets are unnervingly quiet...', 'log-danger')
            break
          }
          case 'camp': {
            const p = get().player
            const heal = Math.floor(p.max_hp / 2)
            const healed = { ...p, hp: Math.min(p.max_hp, p.hp + heal) }
            set({ player: healed })
            get().addLog(`🏕 You rest. Restored ${heal} HP!`, 'log-victory')
            // 15% chance of ambush after healing
            if (Math.random() < 0.15) {
              set(s2 => ({ stats: { ...s2.stats, trapsTriggered: s2.stats.trapsTriggered + 1 } }))
              get().addLog('⚔ Bandits were waiting for you to let your guard down!', 'log-danger')
              get().startFight('fight', tier)
            }
            break
          }
          case 'treasure': {
            const { player, gold, item, cursed, ambush } = handleTreasure(get().player, tier)
            set({ player })
            get().addLog(`💰 Treasure! ${gold} gold and ${item}! (${getItemEffect(item)})`, 'log-gold')
            if (cursed) {
              const { player: cp, curse } = handleCurse(get().player)
              set({ player: cp })
              set(s2 => ({ stats: { ...s2.stats, trapsTriggered: s2.stats.trapsTriggered + 1 } }))
              get().addLog(`💀 The chest was cursed! Afflicted: ${curse} (${getItemEffect(curse)})`, 'log-danger')
            }
            if (ambush) {
              set(s2 => ({ stats: { ...s2.stats, trapsTriggered: s2.stats.trapsTriggered + 1 } }))
              get().addLog('⚔ Guardians burst from the shadows to reclaim the treasure!', 'log-danger')
              get().startFight('fight', tier)
            }
            break
          }
          case 'event': {
            const result = handleEvent(get().player)
            if (result.ev === 'trap') {
              set({ player: result.player })
              set(s2 => ({ stats: { ...s2.stats, trapsTriggered: s2.stats.trapsTriggered + 1 } }))
              if (result.trapType === 'damage') {
                get().addLog(`🪤 EVENT: You spring a hidden trap! Lost ${result.trapDmg} HP!`, 'log-danger')
                if (result.player.hp <= 0) { set({ screen: 'gameover' }) }
              } else {
                get().addLog(`🪤 EVENT: Cutpurses relieve you of ${result.trapGold} Gold while you're distracted!`, 'log-danger')
              }
            } else if (result.ev === 'cultists') {
              set({ player: result.player })
              set(s2 => ({ stats: { ...s2.stats, trapsTriggered: s2.stats.trapsTriggered + 1 } }))
              get().addLog(`🕯 EVENT: Cultists ambush you in the night and place a hex upon you!`, 'log-danger')
              get().addLog(`Afflicted: ${result.curse} (${getItemEffect(result.curse)})`, 'log-danger')
            } else if (result.wandererOffer) {
              set({ pendingWandererOffer: true })
              get().addLog('📜 EVENT: You meet a strange man in the woods...', '')
              get().addLog('He offers you a mysterious gem that will show you the future for 100 Gold.', 'log-gold')
            } else {
              set({ player: result.player })
              get().addLog(`📜 EVENT: Found a ${result.ev}!`)
              if (result.item)     get().addLog(`Received: ${result.item} (${getItemEffect(result.item)})`, 'log-gold')
              if (result.blessing) get().addLog(`Received: ${result.blessing} (${getItemEffect(result.blessing)})`, 'log-gold')
            }
            break
          }
          case 'curse': {
            const { player, curse } = handleCurse(get().player)
            set({ player })
            get().addLog(`💀 CURSE! Afflicted: ${curse} (${getItemEffect(curse)})`, 'log-danger')
            break
          }
          case 'wilderness': {
            get().addLog('🌲 You have entered an unexplored wilderness...', '')
            const outcome = rollWildernessOutcome()
            const s2 = get()

            switch (outcome) {
              case 'berries': {
                const { player: p, heal } = applyWildernessBerries(s2.player)
                set({ player: p })
                get().addLog(`🍓 You find wild berries and eat your fill. Restored ${heal} HP!`, 'log-victory')
                break
              }
              case 'ambush': {
                get().addLog('⚔ Something lunges from the undergrowth — you\'re ambushed!', 'log-danger')
                const tier = Math.floor(Math.max(pos.x, pos.y) / 2)
                get().startFight('fight', tier)
                break
              }
              case 'traveler': {
                if (s2.activeQuest) {
                  get().addLog('🧭 A weary traveler approaches, but you already have a task to complete.', '')
                } else {
                  const reward = WILDERNESS_QUEST_TEMPLATES[Math.floor(Math.random() * WILDERNESS_QUEST_TEMPLATES.length)]
                  const quest = placeQuestTile(pos, new Set(s2.visited), reward)
                  if (quest) {
                    set({ activeQuest: quest })
                    get().addLog(`🧭 A traveler emerges from the trees with a task for you.`, '')
                    get().addLog(`"${reward.desc}" — head to (${quest.tile.x}, ${quest.tile.y})`, 'log-gold')
                    get().addLog(`Reward: ${reward.gold} Gold & ${reward.exp} EXP`, 'log-gold')
                    get().showNotification('New Quest!')
                  } else {
                    get().addLog('🧭 A traveler passes by in silence. No quest to offer.', '')
                  }
                }
                break
              }
              case 'brambles': {
                const { player: p, dmg } = applyWildernessBrambles(s2.player)
                set({ player: p })
                set(s3 => ({ stats: { ...s3.stats, trapsTriggered: s3.stats.trapsTriggered + 1 } }))
                get().addLog(`🌿 You stumble into thick brambles. Lost ${dmg} HP forcing your way through.`, 'log-danger')
                if (p.hp <= 0) { get().endCombat(false) }
                break
              }
              case 'dragon_sighting': {
                const revealKeys = dragonSightingReveal(pos, new Set(s2.visited), s2.grid, GRID_SIZE)
                const merged = [...new Set([...s2.dragonRevealedTiles, ...revealKeys])]
                set({ dragonRevealedTiles: merged })
                get().addLog('🐉 A dragon soars overhead, and in its wake you glimpse the land ahead!', 'log-gold')
                get().addLog(`${revealKeys.length} surrounding tiles revealed.`, 'log-gold')
                get().showNotification('Tiles Revealed!')
                break
              }
            }
            break
          }
          case 'dragon': get().startDragonFight(); break
        }
      },

      // ── COMBAT ──────────────────────────────────────────────
      startFight: (type, tier) => {
        const s = get()
        const diffMult = DIFFICULTY[s.difficulty]?.enemyMult ?? 1
        const enc = getEncounterByTier(tier, type, diffMult)
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

        // Block special case — set playerBlocking true so resolveEnemyTurn applies blockBonus
        if (action === 'block') {
          const result = resolvePlayerAction('block', {
            player: s.player,
            enemies: s.enemies,
            selectedTarget: s.selectedTarget,
            battleBuffs: s.battleBuffs,
            blockBonus: s.blockBonus,
            apRemaining: s.apRemaining,
          })
          result.logs.forEach(l => get().addLog(l.msg, l.cls || ''))
          set({
            playerBlocking: true,
            blockBonus: result.newBlockBonus,
            apRemaining: result.newAp,
          })
          if (result.newAp <= 0) get().doEnemyTurn()
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

          // Count enemies killed this fight
          const killed = s.enemies.filter(e => e.hp <= 0).length
          set({ stats: { ...s.stats, enemiesKilled: s.stats.enemiesKilled + killed } })

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
        set({ player: newPlayer, pendingBlessing: null, townScreen: null, townVisited: { ...s.townVisited, church: true } })
        get().addLog(`✦ Received ${name}! (${getItemEffect(name)})`, 'log-gold')
      },

      setPendingBlessing: () => {
        const name = BLESSING_NAMES[Math.floor(Math.random() * BLESSING_NAMES.length)]
        set({ pendingBlessing: name })
        return name
      },

      acceptWandererOffer: () => {
        const s = get()
        if (s.player.gold < 100) {
          get().addLog('You cannot afford the wanderer\'s offer.', 'log-danger')
          set({ pendingWandererOffer: false })
          return
        }
        const newPlayer = { ...s.player, gold: s.player.gold - 100, inventory: [...s.player.inventory, 'Seer Stone'] }
        set({ player: newPlayer, pendingWandererOffer: false })
        get().addLog('💎 You purchase the Seer Stone! Tile types are now revealed.', 'log-gold')
        get().showNotification('Seer Stone acquired!')
      },

      declineWandererOffer: () => {
        set({ pendingWandererOffer: false })
        get().addLog('You decline the wanderer\'s offer and continue on your way.', '')
      },

      payCultistBribe: () => {
        const s = get()
        if (s.player.gold < 500) return
        set({ player: { ...s.player, gold: s.player.gold - 500 }, pendingCultistChurch: false, townVisited: { ...s.townVisited, church: true } })
        get().addLog('💸 You pay 500 Gold to the cultists. They let you leave unharmed.', 'log-gold')
        set({ townScreen: null })
      },

      acceptCultistCurse: () => {
        const { player: cp, curse } = handleCurse(get().player)
        set(s => ({ player: cp, pendingCultistChurch: false, townVisited: { ...s.townVisited, church: true }, stats: { ...s.stats, trapsTriggered: s.stats.trapsTriggered + 1 } }))
        get().addLog(`🕯 The cultists perform their ritual. Afflicted: ${curse} (${getItemEffect(curse)})`, 'log-danger')
        set({ townScreen: null })
      },

      startNecromancerAttack: () => {
        set({ pendingNecromancerAttack: false, townVisited: { ...get().townVisited, church: true } })
        get().addLog('💀 A Necromancer rises from the shadows of the church!', 'log-danger')
        const s = get()
        const diffMult = DIFFICULTY[s.difficulty]?.enemyMult ?? 1
        const baseAtk = Math.floor(14 * diffMult), baseDef = Math.floor(8 * diffMult), baseHp = Math.floor(60 * diffMult)
        const enc = { name: 'Necromancer', atk: baseAtk, def: baseDef, hp: baseHp, count: 1, canSummon: true }
        const e = { name: 'Necromancer', attack: baseAtk, defense: baseDef, max_hp: baseHp, hp: baseHp, canSummon: true, minions: [] }
        let buffs = { atk: 0, def: 0, ironWillStacks: 0, berserkUses: 0 }
        let newPlayer = s.player
        if (s.player.pendingStrengthPotion) {
          buffs = { ...buffs, atk: 2 }
          newPlayer = { ...newPlayer, pendingStrengthPotion: false }
          get().addLog('🧪 Strength Potion activates!', 'log-gold')
        }
        set({
          player: newPlayer,
          enemies: [e],
          selectedTarget: 0,
          battleBuffs: buffs,
          playerBlocking: false, playerParrying: false,
          blockBonus: 0,
          apRemaining: Math.floor(newPlayer.action_points),
          enemyTurnPending: false,
          encounterData: { type: 'fight', tier: 4, exp: 200, gold: 150, enemyData: enc },
          screen: 'combat',
        })
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

      returnToDifficulty: () => set({ screen: 'difficulty' }),
    }),
    {
      name: 'dragon-slayer-save',
      partialize: (s) => ({
        player: s.player, position: s.position, visited: s.visited,
        turn: s.turn, grid: s.grid, dragon: s.dragon,
        activeQuest: s.activeQuest, gameLog: s.gameLog.slice(-20),
        screen: s.screen === 'combat' ? 'exploring' : s.screen,
        dragonRevealedTiles: s.dragonRevealedTiles,
        difficulty: s.difficulty,
        stats: s.stats,
      }),
    }
  )
)

export default useGameStore
