import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidElement, type ReactNode, type ReactElement } from 'react'
import { DamoMaze } from '../app/components/DamoMaze'

function childArrays(node: ReactNode): ReactElement[][] {
  if (Array.isArray(node)) {
    const arrays = node.every(isValidElement) ? [node as ReactElement[]] : []
    return [...arrays, ...node.flatMap(childArrays)]
  }
  if (isValidElement<{ children?: ReactNode }>(node)) return childArrays(node.props.children)
  return []
}

test('maze room, note and empty slots have twelve stable unique sibling keys', () => {
  const grid = childArrays(DamoMaze()).find(children => children.length === 12)
  assert.ok(grid, 'maze has twelve grid slots')
  const keys = grid.map(child => child.key)
  assert.equal(new Set(keys).size, 12, 'note slot must not collide with room 7')
  assert.deepEqual(keys, Array.from({ length: 12 }, (_, idx) => `maze-slot-${Math.floor(idx / 4)}-${idx % 4}`))
  const rooms = grid.filter(child => child.props && typeof child.props === 'object' && 'cell' in child.props)
  assert.equal(rooms.length, 10)
  assert.deepEqual(rooms.map(child => (child.props as { cell: { id: number } }).cell.id), [1, 4, 7, 10, 2, 5, 8, 3, 6, 9])
})
