'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ============================================================
// WORLD MAP DATA (from world-map.json)
// ============================================================

interface WalkPoint {
  label: string
  x: number
  y: number
}

interface Room {
  id: string
  area: string
  npcs: string[]
  walkPoints: WalkPoint[]
  // Layout position for the visual map (assigned below)
  mapX: number
  mapY: number
}

interface Connection {
  from: string
  to: string
  type: 'gate' | 'cart_man' | 'quest_teleport'
  gateClick?: { x: number; y: number }
  returnGateClick?: { x: number; y: number }
  dialogue?: string
  bidirectional: boolean
}

interface Area {
  id: string
  name: string
  color: string
}

const AREAS: Area[] = [
  { id: 'lanzhou', name: '蘭州', color: '#3b82f6' },
  { id: 'yumen', name: '玉門', color: '#f97316' },
  { id: 'jingzhou', name: '荊州', color: '#22c55e' },
  { id: 'huashan', name: '華山', color: '#a855f7' },
  { id: 'mingjiaoArea', name: '明教', color: '#ef4444' },
  { id: 'luoyang', name: '洛陽', color: '#eab308' },
]

function areaColor(areaId: string): string {
  return AREAS.find((a) => a.id === areaId)?.color ?? '#6b7280'
}

// Room definitions with visual map layout positions
const ROOMS: Room[] = [
  // === 蘭州 area ===
  { id: '一品堂(任務室)', area: 'lanzhou', npcs: ['yi(義)', 'lin(林)'], mapX: 50, mapY: 200,
    walkPoints: [{ label: '中間', x: 624, y: 238 }, { label: '往出口', x: 865, y: 434 }] },
  { id: '濱河大街西', area: 'lanzhou', npcs: [], mapX: 170, mapY: 200,
    walkPoints: [{ label: '去(往濱河)', x: 1017, y: 347 }, { label: '去(中繼)', x: 817, y: 328 }, { label: '回(往任務室)', x: 459, y: 321 }, { label: '回(中繼)', x: 678, y: 357 }] },
  { id: '濱河大街', area: 'lanzhou', npcs: [], mapX: 290, mapY: 200,
    walkPoints: [{ label: '去(往城)', x: 1017, y: 304 }, { label: '去(中繼)', x: 935, y: 375 }, { label: '回(往濱河西)', x: 482, y: 263 }, { label: '回(中繼)', x: 537, y: 399 }] },
  { id: '城堭廟廣場', area: 'lanzhou', npcs: [], mapX: 410, mapY: 200,
    walkPoints: [{ label: '去(往林蔭道)1', x: 882, y: 438 }, { label: '去(往林蔭道)2', x: 1006, y: 519 }, { label: '去(門口)', x: 711, y: 390 }, { label: '回(往濱河)1', x: 624, y: 219 }, { label: '回(往濱河)2', x: 536, y: 180 }] },
  { id: '蘭州林蔭道', area: 'lanzhou', npcs: [], mapX: 530, mapY: 200,
    walkPoints: [{ label: '去(往南門)1', x: 992, y: 513 }, { label: '去(往南門)2', x: 947, y: 518 }, { label: '去(門口)', x: 732, y: 389 }, { label: '回(往城)1', x: 592, y: 183 }, { label: '回(往城)2', x: 527, y: 178 }] },
  { id: '蘭州南門', area: 'lanzhou', npcs: [], mapX: 650, mapY: 200,
    walkPoints: [{ label: '去(往官道)1', x: 1015, y: 519 }, { label: '去(往官道)2', x: 993, y: 519 }, { label: '去(門口)', x: 755, y: 415 }, { label: '回(往林蔭道)1', x: 517, y: 179 }, { label: '回(往林蔭道)2', x: 550, y: 175 }] },
  { id: '蘭州官道', area: 'lanzhou', npcs: [], mapX: 770, mapY: 200,
    walkPoints: [{ label: '去(往敦煌)', x: 851, y: 516 }, { label: '去(中繼)', x: 656, y: 519 }, { label: '回(往南門)1', x: 769, y: 184 }, { label: '回(往南門)2', x: 702, y: 177 }] },
  { id: '蘭州驛站', area: 'lanzhou', npcs: ['cart man'], mapX: 770, mapY: 280,
    walkPoints: [] },

  // === 玉門 area ===
  { id: '敦煌大街', area: 'yumen', npcs: ['cart man'], mapX: 770, mapY: 360,
    walkPoints: [{ label: '去(往玉門)1', x: 842, y: 183 }, { label: '去(往玉門)2', x: 997, y: 193 }, { label: 'cart man區域', x: 569, y: 480 }, { label: '回程cart man', x: 506, y: 482 }] },
  { id: '玉門鎮', area: 'yumen', npcs: [], mapX: 890, mapY: 360,
    walkPoints: [{ label: '去(往北大街)1', x: 866, y: 179 }, { label: '去(往北大街)2', x: 704, y: 178 }, { label: '去(門口)', x: 692, y: 328 }, { label: '回(往敦煌)1', x: 784, y: 514 }, { label: '回(往敦煌)2', x: 675, y: 521 }] },
  { id: '北大街', area: 'yumen', npcs: [], mapX: 1010, mapY: 360,
    walkPoints: [{ label: '去(往巫山)1', x: 535, y: 194 }, { label: '去(往巫山)2', x: 605, y: 189 }, { label: '回(往玉門)1', x: 970, y: 514 }, { label: '回(往玉門)2', x: 905, y: 502 }] },
  { id: '巫山小道', area: 'yumen', npcs: ['kill target (bai)'], mapX: 1130, mapY: 360,
    walkPoints: [{ label: '中間', x: 569, y: 182 }, { label: '往出口', x: 924, y: 498 }] },

  // === 荊州 area ===
  { id: '荊州城中心', area: 'jingzhou', npcs: ['cart man'], mapX: 770, mapY: 440,
    walkPoints: [{ label: '往南大街1', x: 998, y: 516 }, { label: '往南大街2', x: 976, y: 519 }, { label: '往南大街3', x: 824, y: 479 }, { label: '回程cart man', x: 564, y: 183 }] },
  { id: '荊州南大街', area: 'jingzhou', npcs: [], mapX: 890, mapY: 440,
    walkPoints: [{ label: '去(往南門)1', x: 1000, y: 517 }, { label: '去(往南門)2', x: 899, y: 505 }, { label: '回(往城中心)1', x: 564, y: 183 }, { label: '回(往城中心)2', x: 563, y: 191 }] },
  { id: '荊州南門', area: 'jingzhou', npcs: [], mapX: 1010, mapY: 440,
    walkPoints: [{ label: '去(往大道)1', x: 1003, y: 518 }, { label: '去(往大道)2', x: 998, y: 522 }, { label: '去(門口)', x: 752, y: 419 }, { label: '回(往南大街)1', x: 551, y: 182 }, { label: '回(往南大街)2', x: 551, y: 176 }, { label: '回(門口)', x: 679, y: 277 }] },
  { id: '大道', area: 'jingzhou', npcs: [], mapX: 1130, mapY: 440,
    walkPoints: [{ label: '去(往殺NPC)1', x: 979, y: 521 }, { label: '去(往殺NPC)2', x: 909, y: 503 }, { label: '回(往南門)1', x: 503, y: 179 }, { label: '回(往南門)2', x: 639, y: 194 }] },
  { id: '殺NPC地圖(荊州)', area: 'jingzhou', npcs: ['kill target'], mapX: 1250, mapY: 440,
    walkPoints: [{ label: '中間', x: 947, y: 515 }, { label: '往出口', x: 577, y: 197 }] },

  // === 華山 area ===
  { id: '華山腳', area: 'huashan', npcs: ['cart man'], mapX: 170, mapY: 50,
    walkPoints: [{ label: '中間', x: 543, y: 264 }, { label: '往門口', x: 825, y: 191 }] },
  { id: '莎蘿平', area: 'huashan', npcs: ['江湖百曉生'], mapX: 290, mapY: 50,
    walkPoints: [{ label: '百曉生區域', x: 983, y: 295 }, { label: '回華山腳', x: 515, y: 385 }] },

  // === 明教 area ===
  { id: '光明頂出口', area: 'mingjiaoArea', npcs: ['quest NPC'], mapX: 410, mapY: 50,
    walkPoints: [{ label: '往西驛道', x: 460, y: 316 }, { label: '門口', x: 614, y: 373 }, { label: '中間', x: 942, y: 517 }, { label: '往出口', x: 583, y: 193 }] },
  { id: '西驛道(一)', area: 'mingjiaoArea', npcs: ['kill target'], mapX: 530, mapY: 50,
    walkPoints: [{ label: '中間', x: 517, y: 504 }, { label: '往room2', x: 922, y: 208 }] },
  { id: '西驛道(二)', area: 'mingjiaoArea', npcs: ['kill target'], mapX: 650, mapY: 50,
    walkPoints: [{ label: '中間', x: 946, y: 192 }, { label: '往回走', x: 526, y: 489 }] },
  { id: '東村口', area: 'mingjiaoArea', npcs: [], mapX: 410, mapY: 120,
    walkPoints: [] },
  { id: '明教', area: 'mingjiaoArea', npcs: [], mapX: 530, mapY: 120,
    walkPoints: [{ label: '往拜火道', x: 530, y: 184 }, { label: '門口', x: 591, y: 208 }] },
  { id: '拜火道', area: 'mingjiaoArea', npcs: ['謝遜', 'cart man'], mapX: 650, mapY: 120,
    walkPoints: [{ label: '中間', x: 535, y: 192 }, { label: '往拜火丘', x: 959, y: 488 }, { label: '往回走', x: 1005, y: 515 }, { label: 'cart man區域', x: 879, y: 201 }] },
  { id: '拜火丘', area: 'mingjiaoArea', npcs: ['bandit'], mapX: 770, mapY: 120,
    walkPoints: [] },

  // === 洛陽 ===
  { id: '洛陽', area: 'luoyang', npcs: ['cart man'], mapX: 170, mapY: 120,
    walkPoints: [{ label: '往cart man1', x: 964, y: 182 }, { label: '往cart man2', x: 885, y: 203 }, { label: 'cart man區域', x: 910, y: 191 }] },
]

const CONNECTIONS: Connection[] = [
  // 華山
  { from: '華山腳', to: '莎蘿平', type: 'gate', gateClick: { x: 764, y: 338 }, returnGateClick: { x: 715, y: 351 }, bidirectional: true },
  { from: '莎蘿平', to: '光明頂出口', type: 'quest_teleport', bidirectional: false },
  { from: '光明頂出口', to: '西驛道(一)', type: 'gate', gateClick: { x: 723, y: 360 }, bidirectional: false },
  { from: '西驛道(一)', to: '西驛道(二)', type: 'gate', gateClick: { x: 760, y: 332 }, bidirectional: false },
  { from: '西驛道(二)', to: '光明頂出口', type: 'gate', gateClick: { x: 722, y: 363 }, bidirectional: false },
  { from: '光明頂出口', to: '東村口', type: 'gate', gateClick: { x: 735, y: 334 }, bidirectional: false },
  { from: '東村口', to: '華山腳', type: 'gate', gateClick: { x: 744, y: 315 }, bidirectional: false },
  // Cart man routes
  { from: '華山腳', to: '洛陽', type: 'cart_man', dialogue: 'Ask 洛陽', bidirectional: false },
  { from: '洛陽', to: '華山腳', type: 'cart_man', dialogue: 'Ask 華山', bidirectional: false },
  { from: '洛陽', to: '明教', type: 'cart_man', dialogue: 'Ask 明教', bidirectional: false },
  { from: '明教', to: '拜火道', type: 'gate', gateClick: { x: 730, y: 322 }, bidirectional: false },
  { from: '拜火道', to: '拜火丘', type: 'gate', gateClick: { x: 758, y: 364 }, returnGateClick: { x: 757, y: 370 }, bidirectional: true },
  { from: '拜火道', to: '洛陽', type: 'cart_man', dialogue: 'Ask 洛陽', bidirectional: false },
  // 蘭州
  { from: '一品堂(任務室)', to: '濱河大街西', type: 'gate', gateClick: { x: 745, y: 362 }, returnGateClick: { x: 721, y: 357 }, bidirectional: true },
  { from: '濱河大街西', to: '濱河大街', type: 'gate', gateClick: { x: 773, y: 344 }, returnGateClick: { x: 721, y: 363 }, bidirectional: true },
  { from: '濱河大街', to: '城堭廟廣場', type: 'gate', gateClick: { x: 762, y: 359 }, returnGateClick: { x: 735, y: 319 }, bidirectional: true },
  { from: '城堭廟廣場', to: '蘭州林蔭道', type: 'gate', gateClick: { x: 740, y: 365 }, returnGateClick: { x: 729, y: 308 }, bidirectional: true },
  { from: '蘭州林蔭道', to: '蘭州南門', type: 'gate', gateClick: { x: 730, y: 364 }, returnGateClick: { x: 693, y: 276 }, bidirectional: true },
  { from: '蘭州南門', to: '蘭州官道', type: 'gate', gateClick: { x: 738, y: 369 }, returnGateClick: { x: 736, y: 302 }, bidirectional: true },
  { from: '蘭州官道', to: '敦煌大街', type: 'gate', gateClick: { x: 735, y: 410 }, bidirectional: false },
  { from: '蘭州驛站', to: '蘭州官道', type: 'gate', gateClick: { x: 744, y: 321 }, bidirectional: false },
  // Cart man: 蘭州 ↔ 敦煌/荊州
  { from: '蘭州官道', to: '荊州城中心', type: 'cart_man', dialogue: 'Ask 荊州', bidirectional: false },
  { from: '敦煌大街', to: '蘭州驛站', type: 'cart_man', dialogue: 'Ask 蘭州', bidirectional: false },
  { from: '荊州城中心', to: '蘭州驛站', type: 'cart_man', dialogue: 'Ask 蘭州', bidirectional: false },
  // 玉門
  { from: '敦煌大街', to: '玉門鎮', type: 'gate', gateClick: { x: 764, y: 340 }, returnGateClick: { x: 742, y: 399 }, bidirectional: true },
  { from: '玉門鎮', to: '北大街', type: 'gate', gateClick: { x: 720, y: 330 }, returnGateClick: { x: 754, y: 370 }, bidirectional: true },
  { from: '北大街', to: '巫山小道', type: 'gate', gateClick: { x: 728, y: 326 }, returnGateClick: { x: 755, y: 368 }, bidirectional: true },
  // 荊州
  { from: '荊州城中心', to: '荊州南大街', type: 'gate', gateClick: { x: 750, y: 370 }, returnGateClick: { x: 720, y: 339 }, bidirectional: true },
  { from: '荊州南大街', to: '荊州南門', type: 'gate', gateClick: { x: 748, y: 366 }, returnGateClick: { x: 718, y: 341 }, bidirectional: true },
  { from: '荊州南門', to: '大道', type: 'gate', gateClick: { x: 744, y: 377 }, returnGateClick: { x: 720, y: 338 }, bidirectional: true },
  { from: '大道', to: '殺NPC地圖(荊州)', type: 'gate', gateClick: { x: 752, y: 361 }, returnGateClick: { x: 727, y: 334 }, bidirectional: true },
]

// ============================================================
// ROUTE STOP ACTIONS
// ============================================================

type StopActionType =
  | 'none'           // just pass through
  | 'take_quest'     // Ask NPC for quest
  | 'complete_quest' // Turn in quest
  | 'kill_npc'       // Find and kill NPC
  | 'cart_man'       // Use cart man to travel
  | 'eat_drink'      // Consume items
  | 'practice'       // Practice skill
  | 'clear_and_exit' // Kill blocking NPC (with map refresh if absent)
  | 'custom'         // Custom SayString commands

const STOP_ACTION_LABELS: Record<StopActionType, string> = {
  none: '經過(不停留)',
  take_quest: '接任務',
  complete_quest: '交任務',
  kill_npc: '殺NPC',
  cart_man: '搭車(Cart Man)',
  eat_drink: '吃喝補給',
  practice: '練功',
  clear_and_exit: '清怪離開(擋路NPC)',
  custom: '自訂指令',
}

interface StopAction {
  type: StopActionType
  npcName?: string        // for take_quest, complete_quest, kill_npc
  questDialogue?: string  // e.g. "Ask 一品堂任務[1000萬]"
  killDialogue?: string   // e.g. "kill"
  cartDestination?: string // e.g. "Ask 玉門"
  items?: string[]        // for eat_drink, e.g. ["Use 關東煮 10", "Use 藥酒 3"]
  practiceCmd?: string    // e.g. "Practice 道德經 1600"
  customCmds?: string[]   // arbitrary SayString commands
  findPicPath?: string    // for FindPic NPC detection
  findColorRegion?: { x1: number; y1: number; x2: number; y2: number; color: string }
  refreshRoomId?: string  // for clear_and_exit: adjacent room to walk in/out for NPC respawn
}

interface RouteStop {
  id: string
  roomId: string
  actions: StopAction[]
}

// ============================================================
// PATHFINDING (BFS on the connection graph)
// ============================================================

function findPath(fromRoom: string, toRoom: string): string[] | null {
  if (fromRoom === toRoom) return [fromRoom]

  const visited = new Set<string>()
  const queue: { room: string; path: string[] }[] = [{ room: fromRoom, path: [fromRoom] }]
  visited.add(fromRoom)

  while (queue.length > 0) {
    const current = queue.shift()!
    const neighbors = getNeighbors(current.room)

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue
      const newPath = [...current.path, neighbor]
      if (neighbor === toRoom) return newPath
      visited.add(neighbor)
      queue.push({ room: neighbor, path: newPath })
    }
  }
  return null
}

function getNeighbors(roomId: string): string[] {
  const neighbors: string[] = []
  for (const conn of CONNECTIONS) {
    if (conn.from === roomId) neighbors.push(conn.to)
    if (conn.bidirectional && conn.to === roomId) neighbors.push(conn.from)
  }
  return [...new Set(neighbors)]
}

function findConnection(from: string, to: string): Connection | null {
  // Direct connection
  let conn = CONNECTIONS.find((c) => c.from === from && c.to === to)
  if (conn) return conn
  // Reverse bidirectional
  conn = CONNECTIONS.find((c) => c.to === from && c.from === to && c.bidirectional)
  if (conn) return { ...conn, from, to, gateClick: conn.returnGateClick, returnGateClick: conn.gateClick }
  return null
}

function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id)
}

// ============================================================
// SCRIPT GENERATOR (from route)
// ============================================================

function generateRouteScript(
  route: RouteStop[],
  walkDelay: number,
  mapDelay: number,
  gateDelay: number,
  loopEnabled: boolean,
): string {
  const lines: string[] = []

  lines.push('LockMouse')
  lines.push('')
  lines.push('Dim walkDelay, mapDelay, gateDelay')
  lines.push(`walkDelay = ${walkDelay}`)
  lines.push(`mapDelay = ${mapDelay}`)
  lines.push(`gateDelay = ${gateDelay}`)
  lines.push('')
  lines.push('Dim intX, intY, intX1, intY1')
  lines.push('Dim npcTime')
  lines.push('')

  if (loopEnabled) {
    lines.push('Dim runCount')
    lines.push('runCount = 0')
    lines.push('')
    lines.push('Rem RUN_START')
    lines.push('runCount = runCount + 1')
    lines.push('TracePrint "=== RUN " & runCount & " ==="')
    lines.push('')
  }

  for (let i = 0; i < route.length; i++) {
    const stop = route[i]
    const room = getRoom(stop.roomId)
    if (!room) continue

    lines.push(`// ============================`)
    lines.push(`// ${room.id}`)
    lines.push(`// ============================`)

    // Generate actions at this stop
    for (const action of stop.actions) {
      generateActionScript(lines, action, room)
    }

    // Generate navigation to next room
    if (i < route.length - 1) {
      const nextStop = route[i + 1]
      const conn = findConnection(stop.roomId, nextStop.roomId)

      if (conn) {
        generateTransitionScript(lines, conn, room, getRoom(nextStop.roomId)!)
      } else {
        // Try pathfinding for non-adjacent rooms
        const path = findPath(stop.roomId, nextStop.roomId)
        if (path && path.length > 2) {
          // Generate intermediate transitions
          for (let j = 0; j < path.length - 1; j++) {
            const intermediateConn = findConnection(path[j], path[j + 1])
            if (intermediateConn) {
              const fromRoom = getRoom(path[j])!
              const toRoom = getRoom(path[j + 1])!
              if (j > 0) {
                lines.push(`// --- 經過 ${fromRoom.id} ---`)
              }
              // Add walk points for intermediate rooms (pick "去" direction points)
              if (j > 0) {
                generateWalkThrough(lines, fromRoom, path[j + 1])
              }
              generateTransitionScript(lines, intermediateConn, fromRoom, toRoom)
            }
          }
        } else {
          lines.push(`// WARNING: No path found from ${stop.roomId} to ${nextStop.roomId}`)
        }
      }
      lines.push('')
    }
  }

  if (loopEnabled) {
    lines.push('')
    lines.push('TracePrint "=== RUN " & runCount & " COMPLETE ==="')
    lines.push('Goto RUN_START')
  }

  return lines.join('\n')
}

function generateActionScript(lines: string[], action: StopAction, room: Room) {
  switch (action.type) {
    case 'none':
      break

    case 'eat_drink':
      if (action.items) {
        for (const item of action.items) {
          lines.push(`SayString "${item}"`)
          lines.push('Delay walkDelay')
          lines.push('KeyPress "Enter", 1')
          lines.push('Delay walkDelay')
        }
      }
      if (action.practiceCmd) {
        lines.push(`SayString "${action.practiceCmd}"`)
        lines.push('KeyPress "Enter", 1')
        lines.push('Delay walkDelay')
      }
      lines.push('')
      break

    case 'practice':
      if (action.practiceCmd) {
        lines.push(`SayString "${action.practiceCmd}"`)
        lines.push('KeyPress "Enter", 1')
        lines.push('Delay walkDelay')
      }
      lines.push('')
      break

    case 'take_quest':
    case 'complete_quest': {
      const labelPrefix = action.type === 'take_quest' ? 'TAKE_QUEST' : 'COMPLETE_QUEST'
      const npcLabel = action.npcName || 'NPC'
      lines.push(`Rem FIND_${labelPrefix}`)
      lines.push(`TracePrint "Looking for ${npcLabel}..."`)
      lines.push('npcTime = 0')
      lines.push('')
      lines.push(`Rem FIND_${labelPrefix}_LOOP`)

      if (action.findPicPath) {
        lines.push(`FindPic 451, 208, 1034, 555, "${action.findPicPath}", 1, intX, intY`)
      } else if (action.findColorRegion) {
        const r = action.findColorRegion
        lines.push(`FindColor ${r.x1}, ${r.y1}, ${r.x2}, ${r.y2}, "${r.color}", intX, intY`)
      } else {
        lines.push(`FindPic 451, 208, 1034, 555, "NPC_IMAGE_PATH", 1, intX, intY`)
      }

      lines.push('If intX > 0 And intY > 0 Then')
      lines.push(`    TracePrint "${npcLabel} found at (" & intX & ", " & intY & ")"`)
      lines.push('    MoveTo intX, intY + 10')
      lines.push('    RightClick 1')
      lines.push('    Delay walkDelay')
      lines.push('    IfColor 557, 506, "0000FF", 0 Then')

      if (action.type === 'take_quest') {
        lines.push(`        SayString "${action.questDialogue || 'Ask 任務名稱'}"`)
        lines.push('        Delay walkDelay')
        lines.push('        KeyPress "Enter", 1')
        lines.push('        Delay walkDelay')
      } else {
        // complete_quest: IfColor check is inverted (0000FF = wrong NPC for complete)
        lines.push(`        TracePrint "Wrong NPC selected, deselecting..."`)
        lines.push('        MoveTo 736, 352')
        lines.push('        LeftClick 1')
        lines.push('        Delay 3000')
        lines.push(`        Goto FIND_${labelPrefix}_LOOP`)
      }

      lines.push('    Else')

      if (action.type === 'take_quest') {
        lines.push(`        TracePrint "Wrong NPC selected, deselecting..."`)
        lines.push('        MoveTo 736, 352')
        lines.push('        LeftClick 1')
        lines.push('        Delay 3000')
        lines.push(`        Goto FIND_${labelPrefix}_LOOP`)
      } else {
        lines.push(`        SayString "${action.questDialogue || 'Ask 交任務物品'}"`)
        lines.push('        Delay walkDelay')
        lines.push('        KeyPress "Enter", 1')
        lines.push('        Delay walkDelay')
      }

      lines.push('    End If')
      lines.push('Else')
      lines.push('    npcTime = npcTime + 1')
      lines.push('    If npcTime >= 15 Then')
      lines.push(`        TracePrint "${npcLabel} not found after 15 retries, continuing..."`)
      lines.push('    Else')
      lines.push('        Delay walkDelay')
      lines.push(`        Goto FIND_${labelPrefix}_LOOP`)
      lines.push('    End If')
      lines.push('End If')
      lines.push('')
      break
    }

    case 'kill_npc': {
      // Walk to middle if available
      const midPoint = room.walkPoints.find((wp) => wp.label === '中間')
      if (midPoint) {
        lines.push('KeyDown "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push(`MoveTo ${midPoint.x}, ${midPoint.y}`)
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        lines.push('KeyUp "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push('')
      }

      lines.push('Rem FIND_NPC_KILL')
      lines.push(`TracePrint "Looking for NPC to kill..."`)

      if (action.findPicPath) {
        lines.push(`FindPic 451, 208, 1034, 555, "${action.findPicPath}", 1, intX, intY`)
      } else if (action.findColorRegion) {
        const r = action.findColorRegion
        lines.push(`FindColor ${r.x1}, ${r.y1}, ${r.x2}, ${r.y2}, "${r.color}", intX, intY`)
      } else {
        lines.push('FindColor 452, 175, 1027, 523, "FFFF00", intX, intY')
      }

      lines.push('If intX > 0 And intY > 0 Then')
      lines.push('    TracePrint "NPC found at (" & intX & ", " & intY & ")"')
      lines.push('    MoveTo intX + 20, intY + 15')
      lines.push('    RightClick 1')
      lines.push('    Delay walkDelay')
      lines.push('')
      lines.push(`    SayString "${action.killDialogue || 'kill'}"`)
      lines.push('    Delay walkDelay')
      lines.push('    KeyPress "Enter", 1')
      lines.push('    Delay walkDelay')
      lines.push('')
      lines.push('    Rem COMBAT_LOOP')
      lines.push('    IfColor 279, 329, "000000", 0 Then')
      lines.push('        IfColor 283, 333, "63EF63", 0 Then')
      lines.push('            Delay walkDelay')
      lines.push('            SayString "Use 藥酒 7"')
      lines.push('            Delay walkDelay')
      lines.push('            KeyPress "Enter", 1')
      lines.push('            Delay walkDelay')
      lines.push('        Else')
      lines.push('        End If')
      lines.push('    Else')
      lines.push('    End If')
      lines.push('')
      lines.push('    FindColor 752, 282, 792, 297, "FFFF00", intX, intY')
      lines.push('    If intX > 0 And intY > 0 Then')
      lines.push('        TracePrint "Kill complete"')
      lines.push('        Goto KILL_DONE')
      lines.push('    Else')
      lines.push('        Goto COMBAT_LOOP')
      lines.push('    End If')
      lines.push('Else')
      lines.push('    TracePrint "NPC not found, retrying..."')
      lines.push('    Delay walkDelay')
      lines.push('    Goto FIND_NPC_KILL')
      lines.push('End If')
      lines.push('')
      lines.push('Rem KILL_DONE')
      lines.push('Delay mapDelay')
      lines.push('')
      break
    }

    case 'cart_man': {
      // Walk to cart man area
      const cartPoint = room.walkPoints.find((wp) => wp.label.includes('cart man'))
      if (cartPoint) {
        lines.push('KeyDown "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push(`MoveTo ${cartPoint.x}, ${cartPoint.y}`)
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        lines.push('KeyUp "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push('')
      }

      lines.push('Rem FIND_CART')
      lines.push(`TracePrint "Looking for cart man (${action.cartDestination || '目的地'})..."`)
      lines.push('npcTime = 0')
      lines.push('')
      lines.push('Rem FIND_CART_LOOP')
      lines.push(`FindPic 451, 208, 1034, 555, "${action.findPicPath || 'C:\\Program Files\\按鍵精靈2014\\screen\\cart man.bmp'}", 1, intX, intY`)
      lines.push('If intX > 0 And intY > 0 Then')
      lines.push('    TracePrint "Cart man found at (" & intX & ", " & intY & ")"')
      lines.push('    MoveTo intX, intY + 10')
      lines.push('    RightClick 1')
      lines.push('    Delay walkDelay')
      lines.push('    IfColor 545, 506, "0000FF", 0 Then')
      lines.push(`        SayString "${action.cartDestination || 'Ask 目的地'}"`)
      lines.push('        Delay walkDelay')
      lines.push('        KeyPress "Enter", 1')
      lines.push('        Delay walkDelay')
      lines.push('    Else')
      lines.push('        Delay walkDelay')
      lines.push('        Goto FIND_CART_LOOP')
      lines.push('    End If')
      lines.push('Else')
      lines.push('    npcTime = npcTime + 1')
      lines.push('    If npcTime >= 15 Then')
      lines.push('        TracePrint "Cart man not found after 15 retries"')
      lines.push('    Else')
      lines.push('        Delay mapDelay')
      lines.push('        Goto FIND_CART_LOOP')
      lines.push('    End If')
      lines.push('End If')
      lines.push('Delay mapDelay')
      lines.push('')
      break
    }

    case 'clear_and_exit': {
      // NPC blocking exit pattern:
      // 1. Check if NPC present
      //    YES → kill → combat loop → walk out
      //    NO  → walk out to adjacent room → walk back in (refresh) → check again
      const ceRoom = room
      const refreshRoom = action.refreshRoomId ? getRoom(action.refreshRoomId) : null
      const ceMidPoint = ceRoom.walkPoints.find((wp) => wp.label === '中間')
      const ceExitPoint = ceRoom.walkPoints.find((wp) => wp.label.includes('往出口') || wp.label.startsWith('回'))

      // Walk to middle first
      if (ceMidPoint) {
        lines.push('KeyDown "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push(`MoveTo ${ceMidPoint.x}, ${ceMidPoint.y}`)
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        lines.push('KeyUp "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push('')
      }

      lines.push('Dim ceRetry')
      lines.push('ceRetry = 0')
      lines.push('')
      lines.push('Rem CE_CHECK_NPC')
      lines.push(`TracePrint "Checking for blocking NPC in ${ceRoom.id}..."`)      

      // FindPic or FindColor to detect NPC
      if (action.findPicPath) {
        lines.push(`FindPic 451, 208, 1034, 555, "${action.findPicPath}", 1, intX, intY`)
      } else if (action.findColorRegion) {
        const r = action.findColorRegion
        lines.push(`FindColor ${r.x1}, ${r.y1}, ${r.x2}, ${r.y2}, "${r.color}", intX, intY`)
      } else {
        lines.push('FindColor 452, 175, 1027, 523, "FFFF00", intX, intY')
      }

      lines.push('If intX > 0 And intY > 0 Then')
      lines.push('    // === NPC PRESENT → KILL ===')
      lines.push('    TracePrint "Blocking NPC found at (" & intX & ", " & intY & ")"')
      lines.push('    MoveTo intX + 20, intY + 15')
      lines.push('    RightClick 1')
      lines.push('    Delay walkDelay')
      lines.push('')
      lines.push(`    SayString "${action.killDialogue || 'kill'}"`)
      lines.push('    Delay walkDelay')
      lines.push('    KeyPress "Enter", 1')
      lines.push('    Delay walkDelay')
      lines.push('')
      lines.push('    Rem CE_COMBAT_LOOP')
      lines.push('    IfColor 279, 329, "000000", 0 Then')
      lines.push('        IfColor 283, 333, "63EF63", 0 Then')
      lines.push('            Delay walkDelay')
      lines.push('            SayString "Use 藥酒 7"')
      lines.push('            Delay walkDelay')
      lines.push('            KeyPress "Enter", 1')
      lines.push('            Delay walkDelay')
      lines.push('        Else')
      lines.push('        End If')
      lines.push('    Else')
      lines.push('    End If')
      lines.push('')
      lines.push('    FindColor 752, 282, 792, 297, "FFFF00", intX, intY')
      lines.push('    If intX > 0 And intY > 0 Then')
      lines.push('        TracePrint "Blocking NPC killed"')
      lines.push('        Goto CE_NPC_CLEARED')
      lines.push('    Else')
      lines.push('        Goto CE_COMBAT_LOOP')
      lines.push('    End If')
      lines.push('')
      lines.push('Else')
      lines.push('    // === NPC NOT PRESENT → REFRESH MAP ===')
      lines.push(`    TracePrint "No NPC found in ${ceRoom.id}, refreshing map..."`)      

      // Refresh: walk out to adjacent room, then walk back in
      if (refreshRoom) {
        const connOut = findConnection(ceRoom.id, refreshRoom.id)
        const connBack = findConnection(refreshRoom.id, ceRoom.id)

        if (connOut && connOut.gateClick) {
          // Walk to exit
          if (ceExitPoint) {
            lines.push('    KeyDown "Ctrl", 1')
            lines.push('    Delay walkDelay')
            lines.push(`    MoveTo ${ceExitPoint.x}, ${ceExitPoint.y}`)
            lines.push('    Delay walkDelay')
            lines.push('    LeftClick 1')
            lines.push('    Delay walkDelay')
            lines.push('    KeyUp "Ctrl", 1')
            lines.push('    Delay walkDelay')
          }
          // Click gate to exit
          lines.push(`    // 出門 → ${refreshRoom.id}`)
          lines.push(`    MoveTo ${connOut.gateClick.x}, ${connOut.gateClick.y}`)
          lines.push('    Delay walkDelay')
          lines.push('    LeftClick 1')
          lines.push('    Delay mapDelay')
          lines.push('')
        }

        if (connBack && connBack.gateClick) {
          // Walk back in
          const refreshGoPoints = refreshRoom.walkPoints.filter((wp) => wp.label.startsWith('去'))
          if (refreshGoPoints.length > 0) {
            lines.push('    KeyDown "Ctrl", 1')
            lines.push('    Delay walkDelay')
            lines.push(`    MoveTo ${refreshGoPoints[0].x}, ${refreshGoPoints[0].y}`)
            lines.push('    Delay walkDelay')
            lines.push('    LeftClick 1')
            lines.push('    Delay walkDelay')
            lines.push('    KeyUp "Ctrl", 1')
            lines.push('    Delay walkDelay')
          }
          lines.push(`    // 回門 → ${ceRoom.id}`)
          lines.push(`    MoveTo ${connBack.gateClick.x}, ${connBack.gateClick.y}`)
          lines.push('    Delay walkDelay')
          lines.push('    LeftClick 1')
          lines.push('    Delay mapDelay')
          lines.push('')
        }
      } else {
        lines.push('    // WARNING: No refresh room configured, cannot respawn NPC')
        lines.push('    // Set the "重生房間" field in the action editor')
      }

      // Walk back to middle after refresh
      if (ceMidPoint) {
        lines.push('    KeyDown "Ctrl", 1')
        lines.push('    Delay walkDelay')
        lines.push(`    MoveTo ${ceMidPoint.x}, ${ceMidPoint.y}`)
        lines.push('    Delay walkDelay')
        lines.push('    LeftClick 1')
        lines.push('    Delay walkDelay')
        lines.push('    KeyUp "Ctrl", 1')
        lines.push('    Delay walkDelay')
      }

      lines.push('    ceRetry = ceRetry + 1')
      lines.push('    If ceRetry >= 10 Then')
      lines.push(`        TracePrint "NPC not spawning after 10 refreshes in ${ceRoom.id}, giving up"`)      
      lines.push('    Else')
      lines.push('        Delay walkDelay')
      lines.push('        Goto CE_CHECK_NPC')
      lines.push('    End If')
      lines.push('End If')
      lines.push('')
      lines.push('Rem CE_NPC_CLEARED')
      lines.push(`TracePrint "${ceRoom.id} cleared, proceeding..."`)
      lines.push('Delay mapDelay')
      lines.push('')
      break
    }

    case 'custom':
      if (action.customCmds) {
        for (const cmd of action.customCmds) {
          lines.push(`SayString "${cmd}"`)
          lines.push('Delay walkDelay')
          lines.push('KeyPress "Enter", 1')
          lines.push('Delay walkDelay')
        }
      }
      lines.push('')
      break
  }
}

function generateWalkThrough(lines: string[], room: Room, nextRoomId: string) {
  // Pick walk points that move toward the exit (prefer "去" labeled points)
  const goPoints = room.walkPoints.filter((wp) => wp.label.startsWith('去'))
  const points = goPoints.length > 0 ? goPoints : room.walkPoints.slice(0, 2)

  for (const wp of points) {
    lines.push('KeyDown "Ctrl", 1')
    lines.push('Delay walkDelay')
    lines.push(`MoveTo ${wp.x}, ${wp.y}`)
    lines.push('Delay walkDelay')
    lines.push('LeftClick 1')
    lines.push('Delay walkDelay')
    lines.push('KeyUp "Ctrl", 1')
    lines.push('Delay walkDelay')
    lines.push('')
  }
}

function generateTransitionScript(lines: string[], conn: Connection, fromRoom: Room, toRoom: Room) {
  if (conn.type === 'gate' && conn.gateClick) {
    // Walk toward gate first
    generateWalkThrough(lines, fromRoom, toRoom.id)

    lines.push(`// 進門 → ${toRoom.id}`)
    lines.push(`MoveTo ${conn.gateClick.x}, ${conn.gateClick.y}`)
    lines.push('Delay walkDelay')
    lines.push('LeftClick 1')
    lines.push('Delay mapDelay')
    lines.push('')
  } else if (conn.type === 'cart_man') {
    // Cart man is handled by the cart_man action
    lines.push(`// Cart man → ${toRoom.id} (${conn.dialogue})`)
    lines.push('Delay mapDelay')
    lines.push('')
  }
}

// ============================================================
// VISUAL MAP CONSTANTS
// ============================================================

const MAP_W = 1350
const MAP_H = 520
const NODE_W = 110
const NODE_H = 36

// ============================================================
// MAIN COMPONENT
// ============================================================

let _idCounter = 0
function newId(): string {
  return `stop_${Date.now()}_${++_idCounter}`
}

export default function MissionBuilderPage() {
  const [route, setRoute] = useState<RouteStop[]>([])
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(-1)
  const [walkDelay, setWalkDelay] = useState(300)
  const [mapDelay, setMapDelay] = useState(1500)
  const [gateDelay, setGateDelay] = useState(1000)
  const [loopEnabled, setLoopEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'route' | 'script'>('map')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ---- Add room to route ----
  function addRoomToRoute(roomId: string) {
    const stop: RouteStop = {
      id: newId(),
      roomId,
      actions: [{ type: 'none' }],
    }
    setRoute((prev) => [...prev, stop])
    setSelectedStopIdx(route.length)
  }

  function removeStop(idx: number) {
    setRoute((prev) => prev.filter((_, i) => i !== idx))
    if (selectedStopIdx === idx) setSelectedStopIdx(-1)
    else if (selectedStopIdx > idx) setSelectedStopIdx(selectedStopIdx - 1)
  }

  function updateStopAction(stopIdx: number, actionIdx: number, patch: Partial<StopAction>) {
    setRoute((prev) =>
      prev.map((stop, i) => {
        if (i !== stopIdx) return stop
        const newActions = stop.actions.map((a, j) => (j === actionIdx ? { ...a, ...patch } : a))
        return { ...stop, actions: newActions }
      }),
    )
  }

  function addActionToStop(stopIdx: number) {
    setRoute((prev) =>
      prev.map((stop, i) => {
        if (i !== stopIdx) return stop
        return { ...stop, actions: [...stop.actions, { type: 'none' as StopActionType }] }
      }),
    )
  }

  function removeActionFromStop(stopIdx: number, actionIdx: number) {
    setRoute((prev) =>
      prev.map((stop, i) => {
        if (i !== stopIdx) return stop
        return { ...stop, actions: stop.actions.filter((_, j) => j !== actionIdx) }
      }),
    )
  }

  // ---- Canvas drawing ----
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const scaleX = w / MAP_W
    const scaleY = h / MAP_H

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Draw area backgrounds
    for (const area of AREAS) {
      const areaRooms = ROOMS.filter((r) => r.area === area.id)
      if (areaRooms.length === 0) continue

      const minX = Math.min(...areaRooms.map((r) => r.mapX)) - 15
      const minY = Math.min(...areaRooms.map((r) => r.mapY)) - 15
      const maxX = Math.max(...areaRooms.map((r) => r.mapX + NODE_W)) + 15
      const maxY = Math.max(...areaRooms.map((r) => r.mapY + NODE_H)) + 15

      ctx.fillStyle = area.color + '10'
      ctx.strokeStyle = area.color + '30'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(minX * scaleX, minY * scaleY, (maxX - minX) * scaleX, (maxY - minY) * scaleY, 8)
      ctx.fill()
      ctx.stroke()

      // Area label
      ctx.fillStyle = area.color + '80'
      ctx.font = `bold 11px sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(area.name, (minX + 4) * scaleX, (minY + 12) * scaleY)
    }

    // Draw connections
    for (const conn of CONNECTIONS) {
      const fromRoom = getRoom(conn.from)
      const toRoom = getRoom(conn.to)
      if (!fromRoom || !toRoom) continue

      const fx = (fromRoom.mapX + NODE_W / 2) * scaleX
      const fy = (fromRoom.mapY + NODE_H / 2) * scaleY
      const tx = (toRoom.mapX + NODE_W / 2) * scaleX
      const ty = (toRoom.mapY + NODE_H / 2) * scaleY

      if (conn.type === 'gate') {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.setLineDash([])
      } else if (conn.type === 'cart_man') {
        ctx.strokeStyle = 'rgba(234,179,8,0.4)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
      } else {
        ctx.strokeStyle = 'rgba(168,85,247,0.4)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([2, 4])
      }

      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ctx.setLineDash([])

      // Arrow
      const angle = Math.atan2(ty - fy, tx - fx)
      const midX = (fx + tx) / 2
      const midY = (fy + ty) / 2
      ctx.fillStyle = conn.type === 'cart_man' ? 'rgba(234,179,8,0.6)' : 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.moveTo(midX + 6 * Math.cos(angle), midY + 6 * Math.sin(angle))
      ctx.lineTo(midX + 6 * Math.cos(angle + 2.5), midY + 6 * Math.sin(angle + 2.5))
      ctx.lineTo(midX + 6 * Math.cos(angle - 2.5), midY + 6 * Math.sin(angle - 2.5))
      ctx.closePath()
      ctx.fill()
    }

    // Draw route path overlay
    if (route.length > 1) {
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 3
      ctx.setLineDash([])
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      for (let i = 0; i < route.length; i++) {
        const room = getRoom(route[i].roomId)
        if (!room) continue
        const rx = (room.mapX + NODE_W / 2) * scaleX
        const ry = (room.mapY + NODE_H / 2) * scaleY
        if (i === 0) ctx.moveTo(rx, ry)
        else ctx.lineTo(rx, ry)
      }
      ctx.stroke()
      ctx.globalAlpha = 1

      // Route step numbers
      for (let i = 0; i < route.length; i++) {
        const room = getRoom(route[i].roomId)
        if (!room) continue
        const rx = (room.mapX + NODE_W - 5) * scaleX
        const ry = (room.mapY + 2) * scaleY
        ctx.fillStyle = '#22d3ee'
        ctx.beginPath()
        ctx.arc(rx, ry, 9, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(i + 1), rx, ry)
      }
    }

    // Draw room nodes
    for (const room of ROOMS) {
      const rx = room.mapX * scaleX
      const ry = room.mapY * scaleY
      const rw = NODE_W * scaleX
      const rh = NODE_H * scaleY

      const isInRoute = route.some((s) => s.roomId === room.id)
      const isHovered = hoveredRoom === room.id
      const isSelected = selectedStopIdx >= 0 && route[selectedStopIdx]?.roomId === room.id
      const color = areaColor(room.area)

      // Node background
      ctx.fillStyle = isSelected ? color : isInRoute ? color + 'cc' : isHovered ? color + '90' : color + '40'
      ctx.strokeStyle = isSelected ? '#fff' : isInRoute ? color : isHovered ? color : color + '60'
      ctx.lineWidth = isSelected ? 2.5 : isInRoute ? 2 : 1
      ctx.beginPath()
      ctx.roundRect(rx, ry, rw, rh, 6)
      ctx.fill()
      ctx.stroke()

      // Room name
      ctx.fillStyle = isInRoute || isSelected ? '#fff' : 'rgba(255,255,255,0.8)'
      ctx.font = `${isSelected ? 'bold ' : ''}${Math.min(11, 11 * scaleX)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Truncate long names
      let displayName = room.id
      if (displayName.length > 8) displayName = displayName.slice(0, 7) + '…'
      ctx.fillText(displayName, rx + rw / 2, ry + rh / 2)

      // NPC indicator
      if (room.npcs.length > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '8px sans-serif'
        ctx.fillText(room.npcs[0], rx + rw / 2, ry + rh + 8 * scaleY)
      }
    }

    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  }, [route, selectedStopIdx, hoveredRoom])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  useEffect(() => {
    const handleResize = () => drawMap()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawMap])

  // ---- Canvas click ----
  function handleMapClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * MAP_W
    const my = ((e.clientY - rect.top) / rect.height) * MAP_H

    for (const room of ROOMS) {
      if (mx >= room.mapX && mx <= room.mapX + NODE_W && my >= room.mapY && my <= room.mapY + NODE_H) {
        addRoomToRoute(room.id)
        return
      }
    }
  }

  function handleMapMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * MAP_W
    const my = ((e.clientY - rect.top) / rect.height) * MAP_H

    let found: string | null = null
    for (const room of ROOMS) {
      if (mx >= room.mapX && mx <= room.mapX + NODE_W && my >= room.mapY && my <= room.mapY + NODE_H) {
        found = room.id
        break
      }
    }
    if (found !== hoveredRoom) setHoveredRoom(found)
  }

  // ---- Script ----
  const script = generateRouteScript(route, walkDelay, mapDelay, gateDelay, loopEnabled)

  function handleCopy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ---- Selected stop ----
  const selectedStop = selectedStopIdx >= 0 && selectedStopIdx < route.length ? route[selectedStopIdx] : null
  const selectedRoom = selectedStop ? getRoom(selectedStop.roomId) : null

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">任務路線產生器</h1>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)} className="rounded" />
            <span className="text-zinc-600">迴圈</span>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-zinc-600">walkDelay</span>
            <input type="number" className="w-16 rounded border px-2 py-1 text-center" value={walkDelay} onChange={(e) => setWalkDelay(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-zinc-600">mapDelay</span>
            <input type="number" className="w-16 rounded border px-2 py-1 text-center" value={mapDelay} onChange={(e) => setMapDelay(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-zinc-600">gateDelay</span>
            <input type="number" className="w-16 rounded border px-2 py-1 text-center" value={gateDelay} onChange={(e) => setGateDelay(Number(e.target.value))} />
          </label>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {(['map', 'route', 'script'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab === 'map' ? '🗺️ 世界地圖' : tab === 'route' ? '📋 路線流程' : '📄 腳本輸出'}
            {tab === 'route' && route.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-100 text-blue-600 px-1.5 py-0.5 text-[10px]">{route.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 240px)' }}>
        {/* Main panel */}
        <div className="flex-1 min-w-0">
          {activeTab === 'map' && (
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <h2 className="font-semibold text-sm">
                  世界地圖 <span className="font-normal text-zinc-400">— 點擊房間加入路線</span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-white/40"></span> 門(Gate)</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-yellow-400/60" style={{ borderTop: '1px dashed' }}></span> 車伕(Cart)</span>
                </div>
              </div>
              <div className="bg-slate-900 p-2">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-pointer rounded"
                  style={{ aspectRatio: `${MAP_W}/${MAP_H}` }}
                  onClick={handleMapClick}
                  onMouseMove={handleMapMouseMove}
                  onMouseLeave={() => setHoveredRoom(null)}
                />
              </div>
            </div>
          )}

          {activeTab === 'route' && (
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-sm">路線流程</h2>
                <button
                  onClick={() => { setRoute([]); setSelectedStopIdx(-1) }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  清除全部
                </button>
              </div>
              <div className="p-3 space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto">
                {route.length === 0 && (
                  <div className="text-center text-sm text-zinc-400 py-12">
                    切換到「世界地圖」標籤，點擊房間來建立路線
                  </div>
                )}
                {route.map((stop, i) => {
                  const room = getRoom(stop.roomId)
                  if (!room) return null
                  const color = areaColor(room.area)
                  const isSelected = i === selectedStopIdx

                  // Find connection to next stop
                  let connInfo = ''
                  if (i < route.length - 1) {
                    const conn = findConnection(stop.roomId, route[i + 1].roomId)
                    if (conn) {
                      connInfo = conn.type === 'gate' ? '→ 門' : conn.type === 'cart_man' ? '→ 車伕' : '→ 傳送'
                    } else {
                      const path = findPath(stop.roomId, route[i + 1].roomId)
                      connInfo = path ? `→ 經過${path.length - 2}個房間` : '⚠️ 無路徑'
                    }
                  }

                  return (
                    <div key={stop.id}>
                      <div
                        onClick={() => setSelectedStopIdx(i)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-zinc-50'
                        }`}
                      >
                        {/* Step number */}
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {i + 1}
                        </span>

                        {/* Room info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{room.id}</div>
                          <div className="text-[11px] text-zinc-400">
                            {stop.actions.map((a) => STOP_ACTION_LABELS[a.type]).join(', ')}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeStop(i) }}
                          className="text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Connection arrow */}
                      {connInfo && (
                        <div className="flex items-center gap-2 pl-6 py-0.5">
                          <span className="text-zinc-300">↓</span>
                          <span className="text-[10px] text-zinc-400">{connInfo}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
              <div className="flex items-center justify-between border-b px-4 py-2">
                <h2 className="font-semibold text-sm">腳本輸出</h2>
                <button
                  onClick={handleCopy}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-zinc-900 text-white hover:bg-zinc-700'
                  }`}
                >
                  {copied ? '已複製!' : '複製腳本'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <pre className="whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed text-zinc-700 bg-zinc-50 rounded-lg p-3 min-h-full select-all">
                  {script || '// 在世界地圖上點擊房間建立路線後，腳本會自動產生'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Stop action editor */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ width: 340, flexShrink: 0 }}>
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">
              {selectedStop ? `停靠點 #${selectedStopIdx + 1}: ${selectedRoom?.id}` : '選擇停靠點'}
            </h2>
          </div>

          {!selectedStop && (
            <div className="p-4 text-sm text-zinc-400 text-center">
              在路線流程中點擊一個停靠點來編輯動作
            </div>
          )}

          {selectedStop && selectedRoom && (
            <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-340px)]">
              {/* Room info */}
              <div className="rounded-lg bg-zinc-50 p-2 text-xs">
                <div className="font-medium">{selectedRoom.id}</div>
                {selectedRoom.npcs.length > 0 && (
                  <div className="text-zinc-500 mt-0.5">NPC: {selectedRoom.npcs.join(', ')}</div>
                )}
                {selectedRoom.walkPoints.length > 0 && (
                  <div className="text-zinc-400 mt-0.5">{selectedRoom.walkPoints.length} 個走路點</div>
                )}
              </div>

              {/* Actions */}
              {selectedStop.actions.map((action, ai) => (
                <div key={ai} className="rounded-lg border p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500">動作 {ai + 1}</span>
                    {selectedStop.actions.length > 1 && (
                      <button
                        onClick={() => removeActionFromStop(selectedStopIdx, ai)}
                        className="text-[10px] text-red-400 hover:text-red-600"
                      >
                        移除
                      </button>
                    )}
                  </div>

                  {/* Action type */}
                  <select
                    className="w-full rounded border px-2 py-1 text-xs"
                    value={action.type}
                    onChange={(e) => updateStopAction(selectedStopIdx, ai, { type: e.target.value as StopActionType })}
                  >
                    {(Object.keys(STOP_ACTION_LABELS) as StopActionType[]).map((t) => (
                      <option key={t} value={t}>{STOP_ACTION_LABELS[t]}</option>
                    ))}
                  </select>

                  {/* Action-specific fields */}
                  {(action.type === 'take_quest' || action.type === 'complete_quest') && (
                    <>
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="NPC名稱 (如 lin)"
                        value={action.npcName || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { npcName: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="對話指令 (如 Ask 一品堂任務[1000萬])"
                        value={action.questDialogue || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { questDialogue: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="FindPic路徑 (如 C:\...\lin.bmp)"
                        value={action.findPicPath || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { findPicPath: e.target.value })}
                      />
                    </>
                  )}

                  {action.type === 'kill_npc' && (
                    <>
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="kill指令 (預設: kill)"
                        value={action.killDialogue || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { killDialogue: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="FindPic路徑 (如 C:\...\bai.bmp)"
                        value={action.findPicPath || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { findPicPath: e.target.value })}
                      />
                    </>
                  )}

                  {action.type === 'clear_and_exit' && (
                    <>
                      <div className="rounded bg-amber-50 border border-amber-200 p-1.5 text-[10px] text-amber-700">
                        NPC在 → 殺掉 → 離開<br/>
                        NPC不在 → 走出到相鄰房間 → 走回來(重生) → 殺掉 → 離開
                      </div>
                      <label className="block">
                        <span className="text-[11px] text-zinc-500">重生房間 (走出去再走回來)</span>
                        <select
                          className="mt-0.5 w-full rounded border px-2 py-1 text-xs"
                          value={action.refreshRoomId || ''}
                          onChange={(e) => updateStopAction(selectedStopIdx, ai, { refreshRoomId: e.target.value })}
                        >
                          <option value="">-- 選擇相鄰房間 --</option>
                          {getNeighbors(selectedRoom?.id || '').map((nId) => (
                            <option key={nId} value={nId}>{nId}</option>
                          ))}
                        </select>
                      </label>
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="kill指令 (預設: kill)"
                        value={action.killDialogue || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { killDialogue: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="FindPic路徑 (如 C:\...\bai.bmp)"
                        value={action.findPicPath || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { findPicPath: e.target.value })}
                      />
                    </>
                  )}

                  {action.type === 'cart_man' && (
                    <>
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="目的地指令 (如 Ask 玉門)"
                        value={action.cartDestination || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { cartDestination: e.target.value })}
                      />
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-xs"
                        placeholder="FindPic路徑 (預設: cart man.bmp)"
                        value={action.findPicPath || ''}
                        onChange={(e) => updateStopAction(selectedStopIdx, ai, { findPicPath: e.target.value })}
                      />
                    </>
                  )}

                  {action.type === 'eat_drink' && (
                    <textarea
                      className="w-full rounded border px-2 py-1 text-xs font-mono"
                      rows={4}
                      placeholder={"Use 關東煮 10\nUse 藥酒 3\nUse 青草 4"}
                      value={(action.items || []).join('\n')}
                      onChange={(e) => updateStopAction(selectedStopIdx, ai, { items: e.target.value.split('\n').filter(Boolean) })}
                    />
                  )}

                  {action.type === 'practice' && (
                    <input
                      type="text"
                      className="w-full rounded border px-2 py-1 text-xs"
                      placeholder="Practice 道德經 1600"
                      value={action.practiceCmd || ''}
                      onChange={(e) => updateStopAction(selectedStopIdx, ai, { practiceCmd: e.target.value })}
                    />
                  )}

                  {action.type === 'custom' && (
                    <textarea
                      className="w-full rounded border px-2 py-1 text-xs font-mono"
                      rows={4}
                      placeholder={"指令1\n指令2\n..."}
                      value={(action.customCmds || []).join('\n')}
                      onChange={(e) => updateStopAction(selectedStopIdx, ai, { customCmds: e.target.value.split('\n').filter(Boolean) })}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={() => addActionToStop(selectedStopIdx)}
                className="w-full rounded-lg border border-dashed border-zinc-300 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                + 新增動作
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
