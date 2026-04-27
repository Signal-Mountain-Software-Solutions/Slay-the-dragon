import GridCell from './GridCell'
import GameLog from '../hud/GameLog'
import useGameStore from '../../store/gameStore'
import { TERRAIN_ICONS } from '../../constants/enemies'
import { GRID_SIZE } from '../../constants/enemies'

export default function GameBoard() {
  const position = useGameStore(s => s.position)
  const visited  = useGameStore(s => s.visited)
  const grid     = useGameStore(s => s.grid)
  const moveTo   = useGameStore(s => s.moveTo)

  // Compute valid moves here once for the move buttons bar
  const validMoves = (() => {
    const { x, y } = position
    const neighbors = [
      { x: x-1, y: y+1 }, { x, y: y+1 }, { x: x+1, y: y+1 },
      { x: x-1, y },                       { x: x+1, y },
      { x: x-1, y: y-1 }, { x, y: y-1 }, { x: x+1, y: y-1 },
    ]
    return neighbors.filter(p =>
      p.x >= 0 && p.x < GRID_SIZE &&
      p.y >= 0 && p.y < GRID_SIZE &&
      !visited.includes(`${p.x},${p.y}`)
    )
  })()

  // Build rows top-to-bottom (y = GRID_SIZE-1 at top)
  const rows = []
  for (let row = GRID_SIZE - 1; row >= 0; row--) {
    const cells = []
    for (let col = 0; col < GRID_SIZE; col++) {
      cells.push(<GridCell key={`${col},${row}`} x={col} y={row} />)
    }
    rows.push(<div key={row} style={{ display: 'contents' }}>{cells}</div>)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, gap: 8, overflow: 'hidden', zIndex: 1 }}>
      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridAutoRows: 'minmax(52px, 1fr)',
          gap: 4, width: '100%',
        }}>
          {rows}
        </div>
      </div>

      {/* Log */}
      <GameLog />

      {/* Move buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0, zIndex: 1 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.6rem', color: 'rgba(212,160,23,0.6)', letterSpacing: 2 }}>MOVE →</span>
        {validMoves.length === 0
          ? <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.65rem', color: 'var(--blood)', letterSpacing: 2 }}>No valid moves!</span>
          : validMoves.map((m, i) => (
              <button key={i} className="move-btn" onClick={() => moveTo(m)}>
                ({m.x},{m.y}) {TERRAIN_ICONS[grid[`${m.x},${m.y}`]] || '?'}
              </button>
            ))
        }
      </div>
    </div>
  )
}
