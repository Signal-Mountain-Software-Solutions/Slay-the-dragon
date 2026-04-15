import { useEffect, useRef } from 'react'
import useGameStore from '../../store/gameStore'

export default function GameLog() {
  const gameLog = useGameStore(s => s.gameLog)
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [gameLog])

  return (
    <div ref={ref} style={{
      height: 90, flexShrink: 0,
      background: 'rgba(10,8,4,0.8)',
      border: '1px solid rgba(212,160,23,0.1)',
      borderRadius: 4, padding: '8px 12px',
      overflowY: 'auto', zIndex: 1,
    }}>
      {gameLog.slice(-15).map((entry, i) => (
        <div key={i} className={`log-entry ${entry.cls || ''}`}>
          {typeof entry === 'string' ? entry : entry.msg}
        </div>
      ))}
    </div>
  )
}
