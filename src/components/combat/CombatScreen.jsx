import { useEffect, useRef } from 'react'
import useGameStore from '../../store/gameStore'
import EnemyCard from './EnemyCard'
import ActionButtons from './ActionButtons'

export default function CombatScreen() {
  const player       = useGameStore(s => s.player)
  const enemies      = useGameStore(s => s.enemies)
  const battleBuffs  = useGameStore(s => s.battleBuffs)
  const blockBonus   = useGameStore(s => s.blockBonus)
  const apRemaining  = useGameStore(s => s.apRemaining)
  const gameLog      = useGameStore(s => s.gameLog)
  const logRef       = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [gameLog])

  const cAtk = player.attack + battleBuffs.atk
  const cDef = player.defense + battleBuffs.def
  const alive = enemies.filter(e => e.hp > 0)

  return (
    <div className="overlay">
      <div className="overlay-box">
        <h2 style={{ fontFamily: "'Cinzel Decorative',serif", textAlign: 'center', marginBottom: 20, fontSize: '1.4rem', color: 'var(--ember)', textShadow: '0 0 20px rgba(200,65,27,0.5)', letterSpacing: 2 }}>
          ⚔ COMBAT ⚔
        </h2>

        {/* Player bar */}
        <div style={{ background: 'rgba(15,10,5,0.8)', border: '1px solid rgba(212,160,23,0.15)', borderRadius: 4, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Cinzel',serif", fontSize: '0.7rem', color: 'var(--mist)', letterSpacing: 1, marginBottom: 6 }}>
            <span>HP: {player.hp}/{player.max_hp}</span>
            <span>
              ATK: {cAtk} · DEF: {cDef}{blockBonus > 0 ? ` 🛡${blockBonus}` : ''} · AP: {apRemaining}/{Math.floor(player.action_points)}
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill bar-hp" style={{ width: `${(player.hp / player.max_hp) * 100}%` }} />
          </div>
        </div>

        {/* Enemies */}
        <div>
          {alive.map((enemy, i) => <EnemyCard key={i} enemy={enemy} index={i} />)}
        </div>

        <div className="divider">— — —</div>

        <ActionButtons />

        {/* Combat log */}
        <div ref={logRef} style={{
          marginTop: 10, background: 'rgba(5,3,1,0.6)',
          border: '1px solid rgba(212,160,23,0.08)', borderRadius: 3,
          padding: 8, height: 80, overflowY: 'auto',
        }}>
          {gameLog.slice(-8).map((entry, i) => (
            <div key={i} style={{ fontSize: '0.65rem', padding: '1px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--mist)' }}
              className={entry.cls || ''}>
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
