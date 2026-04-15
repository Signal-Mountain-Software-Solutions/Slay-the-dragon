import { useEffect } from 'react'
import useGameStore from '../../store/gameStore'
import { getItemEffect } from '../../constants/items'

export default function ChurchScreen() {
  const pendingBlessing    = useGameStore(s => s.pendingBlessing)
  const setPendingBlessing = useGameStore(s => s.setPendingBlessing)
  const acceptBlessing     = useGameStore(s => s.acceptBlessing)
  const setTownScreen      = useGameStore(s => s.setTownScreen)

  useEffect(() => {
    if (!pendingBlessing) setPendingBlessing()
  }, [])

  if (!pendingBlessing) return null

  return (
    <div>
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--mist)', fontSize: '0.8rem', marginBottom: 16 }}>
        The gods smile upon you.
      </p>
      <p style={{ textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: '0.9rem', color: '#80A0FF', marginBottom: 4 }}>
        ✦ {pendingBlessing} ✦
      </p>
      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#8088CC', fontStyle: 'italic', marginBottom: 20 }}>
        {getItemEffect(pendingBlessing)}
      </p>
      <button className="btn-town" onClick={acceptBlessing}>Accept Blessing</button>
      <button className="btn-back" onClick={() => setTownScreen(null)}>← Back</button>
    </div>
  )
}
