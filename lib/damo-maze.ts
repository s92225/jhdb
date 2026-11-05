export type MazeDirection = 'T' | 'R' | 'B' | 'L'
export type MazeCellSpec = {
  id: number
  T?: string
  R?: string
  B?: string
  L?: string
  label?: string
  exitDir?: MazeDirection
}

// These are teleport destinations, not the cells' spatial neighbours.
export const DAMO_CELLS: MazeCellSpec[] = [
  { id: 1, T: '2', R: '出口', B: '7', L: '8', exitDir: 'R' },
  { id: 4, T: '3', R: '5', B: '7', L: '7' },
  { id: 7, T: '4', R: '1', B: '3', L: '6' },
  { id: 10, T: '9', R: '3', B: '—', L: '9' },
  { id: 2, T: '10', R: '3', B: '1', L: '9' },
  { id: 5, T: '1', R: '6', B: '7', L: '4', label: '強者' },
  { id: 8, T: '9', R: '1', B: '1', L: '8' },
  { id: 3, T: '10', R: '2', B: '4', L: '9' },
  { id: 6, T: '7', R: '1', B: '6', L: '6' },
  { id: 9, T: '10', R: '2', B: '8', L: '10' },
]

export const DAMO_LAYOUT: Record<number, [number, number]> = {
  1: [0, 0], 4: [0, 1], 7: [0, 2], 10: [0, 3],
  2: [1, 0], 5: [1, 1], 8: [1, 2],
  3: [2, 0], 6: [2, 1], 9: [2, 2],
}

export const DAMO_ROUTE: Array<{ dir: string; direction: MazeDirection; from: number; to: number }> = [
  { dir: '上', direction: 'T', from: 1, to: 2 },
  { dir: '右', direction: 'R', from: 2, to: 3 },
  { dir: '下', direction: 'B', from: 3, to: 4 },
  { dir: '右', direction: 'R', from: 4, to: 5 },
]

const PATH_CELLS = new Set(DAMO_ROUTE.flatMap(({ from, to }) => [from, to]))

export type MazeTone = 'start' | 'route' | 'target' | 'exit'
export function damoCellTone(id: number): Exclude<MazeTone, 'exit'> | undefined {
  if (id === 1) return 'start'
  if (id === 5) return 'target'
  if (PATH_CELLS.has(id)) return 'route'
  return undefined
}
