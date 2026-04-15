import useGameStore from '../../store/gameStore'

export default function Notification() {
  const notification = useGameStore(s => s.notification)

  return (
    <div className={`notification ${notification ? 'show' : ''}`}>
      {notification}
    </div>
  )
}
