import useGameStore from '../../store/gameStore';

export default function StatsPanel() {
  const player = useGameStore(s => s.player);
  const position = useGameStore(s => s.position);

  return (
    <section className="statsPanel">
      <div className="statsHeader">
        <div className="statsName">Warrior</div>
        <div className="statsLevel">Lv. {player.level}</div>
      </div>

      <div className="statsBars">
        <div className="statLine">❤ HP {player.hp}/{player.max_hp}</div>
        <div className="statLine">✦ EXP {player.exp}/{player.exp_to_level}</div>
      </div>

      <div className="statsGrid">
        {[
          { icon: '⚔', label: 'ATK', val: player.attack },
          { icon: '🛡', label: 'DEF', val: player.defense },
          { icon: '💰', label: 'GOLD', val: player.gold },
          { icon: '⚡', label: 'AP', val: Math.floor(player.action_points) },
        ].map(({ icon, label, val }) => (
          <div key={label} className="statCard">
            <div className="statCardLabel">{icon} {label}</div>
            <div className="statCardValue">{val}</div>
          </div>
        ))}
      </div>

      <div className="statsFooter">
        <div className="positionBlock">
          <div className="footerTitle">Position</div>
          <div className="footerValue">({position.x}, {position.y})</div>
        </div>

        <div className="skillsBlock">
          <div className="footerTitle">Skills</div>
          <div className="skillsList">
            {player.skills.map(s => (
              <div key={s}>• {s}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}