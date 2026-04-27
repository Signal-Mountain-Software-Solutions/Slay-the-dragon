import { useEffect, useRef } from 'react';
import useGameStore from '../../store/gameStore';

export default function GameLog() {
  const gameLog = useGameStore(s => s.gameLog);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [gameLog]);

  return (
    <div className="gameLog" ref={ref}>
      {gameLog.slice(-15).map((entry, i) => {
        const msg = typeof entry === 'string' ? entry : entry.msg;
        const cls = typeof entry === 'string' ? '' : (entry.cls ?? '');

        return (
          <div key={i} className={`log-entry ${cls}`}>
            {msg}
          </div>
        );
      })}
    </div>
  );
}
