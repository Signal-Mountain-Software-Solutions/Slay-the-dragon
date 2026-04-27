import GridCell from './GridCell';
import GameLog from '../hud/GameLog';
import useGameStore from '../../store/gameStore';
import { TERRAIN_ICONS, GRID_SIZE } from '../../constants/enemies';
import { getValidMoves } from '../../logic/game';
import { getRevealedTiles } from '../../constants/items';

// If you created a dedicated SCSS file for the board, import it here:
// import './GameBoard.scss';

export default function GameBoard() {
  const position = useGameStore((s) => s.position);
  const visited = useGameStore((s) => s.visited);
  const grid = useGameStore((s) => s.grid);
  const player = useGameStore((s) => s.player);
  const moveTo = useGameStore((s) => s.moveTo);
  const dragonRevealedTiles = useGameStore((s) => s.dragonRevealedTiles);

  const visitedSet = new Set(visited);
  const validMoves = getValidMoves(position, visitedSet);

  const revealedTiles = getRevealedTiles(
    player.inventory,
    position,
    validMoves,
    visitedSet,
    grid,
    GRID_SIZE,
    dragonRevealedTiles
  );

  // Build rows top-to-bottom (y = GRID_SIZE - 1 at top)
  const rows = [];
  for (let row = GRID_SIZE - 1; row >= 0; row--) {
    const cells = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      cells.push(
        <GridCell
          key={`${col},${row}`}
          x={col}
          y={row}
          validMoves={validMoves}
          revealedTiles={revealedTiles}
        />
      );
    }

    // Row wrapper is fine — SCSS uses `display: contents` on boardGrid children
    // so the cells become the actual CSS Grid items.
    rows.push(
      <div key={row} className="row">
        {cells}
      </div>
    );
  }

  return (
    <div className="gameboard">
      {/* ======================
          Grid (responsive square)
         ====================== */}
      <div className="boardFrame">
        <div className="boardGrid" style={{ ['--grid-size']: GRID_SIZE }}>
          {rows}
        </div>
      </div>

      {/* ======================
          Panels (Log + Moves)
          Keeps board from shrinking on mobile
         ====================== */}
      <div className="boardPanels">
        {/* Log Panel */}
        <div className="logPanel">
          <GameLog />
        </div>

        {/* Moves Panel */}
        <div className="movesPanel">
          <div className="movesTitle">MOVE →</div>

          <div className="movesList">
            {validMoves.length === 0 ? (
              <div className="noMoves">No valid moves!</div>
            ) : (
              validMoves.map((m, i) => {
                const key = `${m.x},${m.y}`;
                const icon = revealedTiles.has(key)
                  ? (TERRAIN_ICONS[grid[key]] ?? '?')
                  : '?';

                return (
                  <button
                    key={i}
                    className="moveBtn"
                    onClick={() => moveTo(m)}
                    type="button"
                  >
                    ({m.x},{m.y}) {icon}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}