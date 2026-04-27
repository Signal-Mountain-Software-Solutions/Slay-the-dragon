import useGameStore from '../../store/gameStore';

export default function Notification() {
  const notification = useGameStore(s => s.notification);

  // Don't render anything when there's no message
  if (!notification) return null;

  return (
    <div className={`notification ${notification ? 'show' : ''}`}>
      {notification}
    </div>
  );
}
