import useGameStore from '../../store/gameStore';

export default function Header() {
  const turn = useGameStore(s => s.turn);
  const activeQuest = useGameStore(s => s.activeQuest);
  const dragon = useGameStore(s => s.dragon);

  const initGame = useGameStore(s => s.initGame);
  const returnToDifficulty = useGameStore(s => s.returnToDifficulty);
  const difficulty = useGameStore(s => s.difficulty);
  const addLog = useGameStore(s => s.addLog);
  const showNotification = useGameStore(s => s.showNotification);

  const handleHardReset = async () => {
    const ok = window.confirm('Hard reset the game? This will erase your current run.');
    if (!ok) return;

    // 1) Clear persisted save (so refresh doesn't restore old run)
    // zustand persist adds `.persist` helpers on the store
    await useGameStore.persist.clearStorage();

    // 2) Return to difficulty screen (clean start point)
    returnToDifficulty();

    // 3) Optional UX feedback (safe to keep)
    addLog('🔄 Game reset. Choose a difficulty to start a new run.', 'log-gold');
    showNotification('Game Reset');
  };

  return (
    <header className="header-bar">
      <div className="header-left">
        <h2 className="header-title">## ⚔ How to Slay a Dragon ⚔</h2>

        {activeQuest && (
          <div className="header-quest">
            <div>📜 QUEST · ({activeQuest.tile.x},{activeQuest.tile.y})</div>
            <div>{activeQuest.reward.desc}</div>
          </div>
        )}

        {dragon.power_level > 0 && (
          <div className="header-dragon">🐉 THE DRAGON GROWS STRONGER</div>
        )}

        <div className="header-turn">TURN {turn}</div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="action-btn btn-end"
          onClick={handleHardReset}
          title="Hard reset the game (clears save and current run)"
        >
          Reset Game
        </button>
      </div>
    </header>
  );
}
``