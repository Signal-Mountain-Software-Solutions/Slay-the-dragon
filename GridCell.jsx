import { TERRAIN_ICONS } from '../../constants/enemies'
import useGameStore from '../../store/gameStore'

const GRID_SIZE = 10

export default function GridCell({ x, y, validMoves, revealedTiles }) {
  const position    = useGameStore(s => s.position)
  const visited     = useGameStore(s => s.visited)
  const grid        = useGameStore(s => s.grid)
  const activeQuest = useGameStore(s => s.activeQuest)
  const moveTo      = useGameStore(s => s.moveTo)

  const key        = `${x},${y}`
  const isCurrent  = x === position.x && y === position.y
  const isVisited  = visited.includes(key)
  const isDragon   = x === GRID_SIZE - 1 && y === GRID_SIZE - 1
  const isQuest    = activeQuest && activeQuest.tile.x === x && activeQuest.tile.y === y
  const isMoveable = validMoves.some(m => m.x === x && m.y === y)
  const isRevealed = revealedTiles.has(key)

  // What icon to show for an unvisited moveable tile
  const terrainIcon = isRevealed
    ? (TERRAIN_ICONS[grid[key]] || '?')
    : '?'

  let cls = 'cell '
  let content = ''
  let onClick = undefined
  let title = undefined

  if (isCurrent) {
    cls += 'cell-current'
    content = '♞'
  } else if (isDragon) {
    cls += 'cell-dragon'
    content = '🐉'
  } else if (isQuest && isMoveable) {
    cls += 'cell-quest'
    content = '!'
    title = `Quest: ${activeQuest.reward.desc} — Move to (${x},${y})`
    onClick = () => moveTo({ x, y })
  } else if (isQuest && !isVisited) {
    cls += 'cell-quest'
    content = '!'
    title = `Quest marker: ${activeQuest.reward.desc}`
  } else if (isMoveable) {
    cls += 'cell-moveable'
    content = terrainIcon
    title = isRevealed
      ? `Move to (${x}, ${y}) — ${grid[key]}`
      : `Move to (${x}, ${y}) — unknown`
    onClick = () => moveTo({ x, y })
  } else if (isVisited) {
    cls += 'cell-visited'
    content = '✓'
  } else {
    // Unreachable unvisited tile — show terrain if revealed (e.g. town always visible)
    if (isRevealed) {
      cls += 'cell-unknown'
      content = TERRAIN_ICONS[grid[key]] || '?'
      title = grid[key]
    } else {
      cls += 'cell-unknown'
    }
  }

  return (
    <div className={cls} onClick={onClick} title={title}>
      {content}
    </div>
  )
}
