import { TERRAIN_ICONS } from '../../constants/enemies'
import useGameStore from '../../store/gameStore'

export default function GridCell({ x, y }) {
  const position  = useGameStore(s => s.position)
  const visited   = useGameStore(s => s.visited)
  const grid      = useGameStore(s => s.grid)
  const activeQuest = useGameStore(s => s.activeQuest)
  const moveTo    = useGameStore(s => s.moveTo)
  const GRID_SIZE = 10

  const key = `${x},${y}`
  const isCurrent  = x === position.x && y === position.y
  const isVisited  = visited.includes(key)
  const isDragon   = x === GRID_SIZE - 1 && y === GRID_SIZE - 1
  const isQuest    = activeQuest && activeQuest.tile.x === x && activeQuest.tile.y === y

  const validMoves = (() => {
    const { x: px, y: py } = position
    const neighbors = [
      { x: px-1, y: py+1 }, { x: px, y: py+1 }, { x: px+1, y: py+1 },
      { x: px-1, y: py },                         { x: px+1, y: py },
      { x: px-1, y: py-1 }, { x: px, y: py-1 }, { x: px+1, y: py-1 },
    ]
    return neighbors.filter(p =>
      p.x >= 0 && p.x < GRID_SIZE &&
      p.y >= 0 && p.y < GRID_SIZE &&
      !visited.includes(`${p.x},${p.y}`)
    )
  })()

  const isMoveable = validMoves.some(m => m.x === x && m.y === y)

  let cls = 'cell '
  let content = ''
  let onClick = undefined
  let title = undefined

  if (isCurrent) {
    cls += 'cell-current'; content = '♞'
  } else if (isDragon) {
    cls += 'cell-dragon'; content = '🐉'
  } else if (isQuest && isMoveable) {
    cls += 'cell-quest'; content = '!'
    title = `Quest: ${activeQuest.reward.desc} — Move to (${x},${y})`
    onClick = () => moveTo({ x, y })
  } else if (isQuest && !isVisited) {
    cls += 'cell-quest'; content = '!'
    title = `Quest marker: ${activeQuest.reward.desc}`
  } else if (isMoveable) {
    cls += 'cell-moveable'
    content = TERRAIN_ICONS[grid[key]] || '?'
    title = `Move to (${x}, ${y})`
    onClick = () => moveTo({ x, y })
  } else if (isVisited) {
    cls += 'cell-visited'; content = '✓'
  } else {
    cls += 'cell-unknown'
  }

  return (
    <div className={cls} onClick={onClick} title={title}>
      {content}
    </div>
  )
}
