import { useMemo, useState } from 'react';
import useGameStore from '../../store/gameStore';

export default function StatsPanel() {
  const player = useGameStore(s => s.player);
  const position = useGameStore(s => s.position);

  const [collapsed, setCollapsed] = useState(false);

  const quickStats = useMemo(() => ([
    { icon: '⚔', label: 'ATK', val: player.attack },
    { icon: '🛡', label: 'DEF', val: player.defense },
    { icon: '💰', label: 'GOLD', val: player.gold },
    { icon: '⚡', label: 'AP', val: Math.floor(player.action_points) },
  ]), [player]);

  return (
    <section className={`statsPanel ${collapsed ? 'collapsed' : ''}`}>
      <div className="statsHeader">
        <div className="statsTitle">
          <div className="statsName">Warrior</div>
          <div className="statsLevel">Lv. {player.level}</div>
        </div>

        <button
          type="button"
          className="statsToggle action-btn btn-end"
          onClick={() => setCollapsed(v => !v)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand stats panel' : 'Collapse stats panel'}
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {/* Always-visible summary row (even when collapsed) */}
      <div className="statsSummary">
        <div>❤ HP {player.hp}/{player.max_hp}</div>
        <div>✦ EXP {player.exp}/{player.exp_to_level}</div>
        <div>Pos ({position.x},{position.y})</div>
      </div>

      {/* Collapsible body */}
      <div className="statsBody">
        <div className="statsGrid">
          {quickStats.map(({ icon, label, val }) => (
            <div key={label} className="statCard">
              <div className="statCardLabel">{icon} {label}</div>
              <div className="statCardValue">{val}</div>
            </div>
          ))}
        </div>

        <div className="skillsBlock">
          <div className="footerTitle">Skills</div>
          <div className="skillsList">
            {(player.skills ?? []).map(skill => (
              <div key={skill}>• {skill}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}