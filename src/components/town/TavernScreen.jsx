import { useEffect } from 'react'
import useGameStore from '../../store/gameStore'
import { pickQuestTemplate } from '../../logic/game'
import { QUEST_TEMPLATES } from '../../constants/enemies'

export default function TavernScreen() {
  const activeQuest          = useGameStore(s => s.activeQuest)
  const pendingQuestReward   = useGameStore(s => s.pendingQuestReward)
  const setPendingQuestReward = useGameStore(s => s.setPendingQuestReward)
  const acceptQuest          = useGameStore(s => s.acceptQuest)
  const setTownScreen        = useGameStore(s => s.setTownScreen)

  // Pick a random quest template when this screen first mounts (if no active quest)
  useEffect(() => {
    if (!activeQuest && !pendingQuestReward) {
      setPendingQuestReward(QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)])
    }
  }, [])

  if (activeQuest) {
    return (
      <div>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--mist)', fontSize: '0.8rem', marginBottom: 12 }}>
          "You've already got a job to do," the barkeep mutters.
        </p>
        <div style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 4, padding: 12, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: 2, marginBottom: 6 }}>ACTIVE QUEST</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--parchment)', fontStyle: 'italic', marginBottom: 4 }}>"{activeQuest.reward.desc}"</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--mist)' }}>
            Target: ({activeQuest.tile.x}, {activeQuest.tile.y}) · Reward: {activeQuest.reward.gold} Gold & {activeQuest.reward.exp} EXP
          </div>
        </div>
        <button className="btn-back" onClick={() => setTownScreen(null)}>← Back</button>
      </div>
    )
  }

  if (!pendingQuestReward) return null

  return (
    <div>
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--mist)', fontSize: '0.8rem', marginBottom: 14 }}>
        "I've got work for a warrior like you," says the barkeep.
      </p>
      <div style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 4, padding: 14, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: 2, marginBottom: 8 }}>BOUNTY NOTICE</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--parchment)', fontStyle: 'italic', marginBottom: 10 }}>"{pendingQuestReward.desc}"</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.7rem', color: 'var(--mist)' }}>
          Reward upon arrival: <span style={{ color: 'var(--gold)' }}>{pendingQuestReward.gold} Gold · {pendingQuestReward.exp} EXP</span>
        </div>
      </div>
      <button className="btn-town" onClick={acceptQuest}>Accept Quest</button>
      <button className="btn-back" onClick={() => setTownScreen(null)}>← Back</button>
    </div>
  )
}
