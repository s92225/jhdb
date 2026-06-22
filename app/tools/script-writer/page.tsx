'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ============================================================
// TYPES
// ============================================================

type StepType =
  | 'walk'        // 走路 Ctrl+Click
  | 'click'       // 點擊
  | 'rightclick'  // 右鍵
  | 'say'         // 說話 SayString
  | 'keypress'    // 按鍵
  | 'delay'       // 延遲
  | 'findcolor'   // 找色
  | 'ifcolor'     // 顏色判斷
  | 'sub'         // 子程序呼叫
  | 'label'       // 標記 Rem
  | 'goto'        // Goto
  | 'clearinput'  // 清除輸入
  | 'nineclick'   // NineClick
  | 'loop_start'  // Do / Do While
  | 'loop_end'    // Loop

interface Step {
  id: string
  type: StepType
  x: number
  y: number
  // Extra params
  text: string        // SayString text, Sub name, label name, key name, loop condition
  delayMs: number     // for delay type
  color: string       // hex color for FindColor/IfColor
  x2: number          // FindColor region end
  y2: number
  comment: string
  keyCount: number    // KeyPress repeat count
}

const STEP_TYPE_LABELS: Record<StepType, string> = {
  walk: '走路(Ctrl+Click)',
  click: '點擊(Click)',
  rightclick: '右鍵(RightClick)',
  say: '說話(SayString)',
  keypress: '按鍵(KeyPress)',
  delay: '延遲(Delay)',
  findcolor: '找色(FindColor)',
  ifcolor: '顏色判斷(IfColor)',
  sub: '子程序(Call)',
  label: '標記(Rem)',
  goto: '跳轉(Goto)',
  clearinput: '清除輸入',
  nineclick: 'NineClick',
  loop_start: '迴圈開始(Do)',
  loop_end: '迴圈結束(Loop)',
}

const STEP_TYPE_COLORS: Record<StepType, string> = {
  walk: '#3b82f6',
  click: '#22c55e',
  rightclick: '#f97316',
  say: '#eab308',
  keypress: '#8b5cf6',
  delay: '#6b7280',
  findcolor: '#ec4899',
  ifcolor: '#14b8a6',
  sub: '#06b6d4',
  label: '#a855f7',
  goto: '#a855f7',
  clearinput: '#64748b',
  nineclick: '#64748b',
  loop_start: '#0ea5e9',
  loop_end: '#0ea5e9',
}

const HAS_COORDS: StepType[] = ['walk', 'click', 'rightclick', 'findcolor', 'ifcolor']

// ============================================================
// HELPERS
// ============================================================

// 按鍵精靈 uses BGR color format, not RGB
// e.g. 0000FF = red (FF0000 in RGB), FFFF00 = cyan (00FFFF in RGB)
function bgrToRgb(bgr: string): string {
  const hex = bgr.padStart(6, '0')
  return hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2)
}

let _idCounter = 0
function newId(): string {
  return `step_${Date.now()}_${++_idCounter}`
}

function createStep(type: StepType, overrides?: Partial<Step>): Step {
  return {
    id: newId(),
    type,
    x: 0,
    y: 0,
    text: '',
    delayMs: 300,
    color: 'FFFF00',
    x2: 0,
    y2: 0,
    comment: '',
    keyCount: 1,
    ...overrides,
  }
}

// ============================================================
// TEMPLATES
// ============================================================

interface Template {
  name: string
  description: string
  walkDelay: number
  mapDelay: number
  gateDelay: number
  steps: Step[]
}

const TEMPLATES: Template[] = [
  {
    name: '空白',
    description: '空白腳本',
    walkDelay: 300,
    mapDelay: 1000,
    gateDelay: 1000,
    steps: [],
  },
  {
    name: '基本練功',
    description: '清除輸入 → 喝藥 → 走到中間 → 找NPC → 殺 → 存檔',
    walkDelay: 200,
    mapDelay: 1000,
    gateDelay: 1000,
    steps: [
      createStep('clearinput', { comment: '清除輸入框' }),
      createStep('say', { text: 'Use 藥酒 10', comment: '喝藥酒' }),
      createStep('say', { text: 'Use 青草 5', comment: '喝青草' }),
      createStep('walk', { x: 543, y: 264, comment: '走到地圖中間' }),
      createStep('label', { text: 'FIND_NPC', comment: '找NPC標記' }),
      createStep('findcolor', { x: 452, y: 175, x2: 1027, y2: 523, color: 'FFFF00', comment: '找NPC名字(BGR:FFFF00=青色)' }),
      createStep('say', { text: 'kill', comment: '開始戰鬥' }),
      createStep('say', { text: 'save', comment: '存檔' }),
    ],
  },
  {
    name: '任務流程',
    description: '走路 → 過門 → 找NPC對話 → 走路回來',
    walkDelay: 300,
    mapDelay: 1000,
    gateDelay: 1000,
    steps: [
      createStep('nineclick', { comment: '點擊聊天框取得焦點' }),
      createStep('walk', { x: 825, y: 191, comment: '走向門口' }),
      createStep('click', { x: 764, y: 338, comment: '進門(地圖轉換)' }),
      createStep('delay', { delayMs: 1000, comment: '等待地圖載入' }),
      createStep('walk', { x: 983, y: 295, comment: '走到NPC區域' }),
      createStep('findcolor', { x: 448, y: 205, x2: 1025, y2: 556, color: 'FFFF00', comment: '找NPC(BGR:FFFF00=青色)' }),
      createStep('say', { text: 'Ask 任務名稱', comment: '跟NPC對話' }),
    ],
  },
  {
    name: '戰鬥迴圈',
    description: 'FindColor找NPC → 右鍵選取 → IfColor確認 → kill → HP檢查迴圈',
    walkDelay: 300,
    mapDelay: 1000,
    gateDelay: 1000,
    steps: [
      createStep('label', { text: 'FK_FIND', comment: '找敵人標記' }),
      createStep('findcolor', { x: 448, y: 205, x2: 1025, y2: 556, color: 'FFFF00', comment: '找NPC名字(BGR:FFFF00=青色)' }),
      createStep('ifcolor', { x: 545, y: 506, color: '0000FF', comment: '確認NPC已選取(BGR:0000FF=紅色)' }),
      createStep('clearinput'),
      createStep('say', { text: 'kill', comment: '開始戰鬥' }),
      createStep('label', { text: 'COMBAT_LOOP', comment: '戰鬥迴圈標記' }),
      createStep('ifcolor', { x: 274, y: 298, color: '000000', comment: 'HP檢查' }),
      createStep('say', { text: 'Use 藥酒 7', comment: '補血' }),
    ],
  },
  {
    name: '重啟遊戲',
    description: 'RestartGame子程序模板',
    walkDelay: 200,
    mapDelay: 1000,
    gateDelay: 1000,
    steps: [
      createStep('keypress', { text: 'F7', keyCount: 1, comment: '停止按鍵精靈' }),
      createStep('click', { x: 1028, y: 153, comment: '關閉遊戲視窗' }),
      createStep('findcolor', { x: 476, y: 266, x2: 747, y2: 359, color: 'A56D39', comment: '等待重新開啟' }),
      createStep('click', { x: 595, y: 404, comment: '點擊開始' }),
      createStep('delay', { delayMs: 1000, comment: '等待載入' }),
    ],
  },
]

// ============================================================
// CODE GENERATOR
// ============================================================

function generateScript(
  steps: Step[],
  walkDelay: number,
  mapDelay: number,
  gateDelay: number,
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
  lines.push('')

  for (const step of steps) {
    if (step.comment) {
      lines.push(`// ${step.comment}`)
    }

    switch (step.type) {
      case 'walk':
        lines.push('KeyDown "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push(`MoveTo ${step.x}, ${step.y}`)
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        lines.push('KeyUp "Ctrl", 1')
        lines.push('Delay walkDelay')
        break

      case 'click':
        lines.push(`MoveTo ${step.x}, ${step.y}`)
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        break

      case 'rightclick':
        lines.push(`MoveTo ${step.x}, ${step.y}`)
        lines.push('Delay walkDelay')
        lines.push('RightClick 1')
        lines.push('Delay walkDelay')
        break

      case 'say':
        lines.push(`SayString "${step.text}"`)
        lines.push('Delay walkDelay')
        lines.push('KeyPress "Enter", 1')
        lines.push('Delay walkDelay')
        break

      case 'keypress':
        lines.push(`KeyPress "${step.text}", ${step.keyCount}`)
        lines.push('Delay walkDelay')
        break

      case 'delay':
        lines.push(`Delay ${step.delayMs}`)
        break

      case 'findcolor':
        lines.push(`FindColor ${step.x}, ${step.y}, ${step.x2}, ${step.y2}, "${step.color}", intX, intY`)
        lines.push('If intX > 0 And intY > 0 Then')
        lines.push(`    TracePrint "Found color at (" & intX & ", " & intY & ")"`)
        lines.push('    MoveTo intX + 5, intY + 10')
        lines.push('    RightClick 1')
        lines.push('    Delay walkDelay')
        lines.push('Else')
        lines.push('    TracePrint "Color not found"')
        lines.push('End If')
        break

      case 'ifcolor':
        lines.push(`IfColor ${step.x}, ${step.y}, "${step.color}", 0 Then`)
        lines.push(`    TracePrint "Color matched at (${step.x}, ${step.y})"`)
        lines.push('Else')
        lines.push('End If')
        break

      case 'sub':
        lines.push(`Call ${step.text}()`)
        lines.push('Delay walkDelay')
        break

      case 'label':
        lines.push(`Rem ${step.text}`)
        break

      case 'goto':
        lines.push(`Goto ${step.text}`)
        break

      case 'clearinput':
        lines.push('KeyDown "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push('KeyPress "A", 1')
        lines.push('Delay walkDelay')
        lines.push('KeyUp "Ctrl", 1')
        lines.push('Delay walkDelay')
        lines.push('KeyPress "Delete", 1')
        lines.push('Delay walkDelay')
        break

      case 'nineclick':
        lines.push('MoveTo 930, 638')
        lines.push('Delay walkDelay')
        lines.push('LeftClick 1')
        lines.push('Delay walkDelay')
        break

      case 'loop_start':
        if (step.text) {
          lines.push(`Do While ${step.text}`)
        } else {
          lines.push('Do')
        }
        break

      case 'loop_end':
        lines.push('Loop')
        break
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ============================================================
// CANVAS CONSTANTS
// ============================================================

const CANVAS_W = 1280
const CANVAS_H = 960
const NODE_RADIUS = 14

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ScriptWriterPage() {
  const [steps, setSteps] = useState<Step[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number>(-1)
  const [walkDelay, setWalkDelay] = useState(300)
  const [mapDelay, setMapDelay] = useState(1000)
  const [gateDelay, setGateDelay] = useState(1000)
  const [showGrid, setShowGrid] = useState(true)
  const [copied, setCopied] = useState(false)
  const [dragIdx, setDragIdx] = useState<number>(-1)
  const [canvasDragIdx, setCanvasDragIdx] = useState<number>(-1)
  const [dragOverIdx, setDragOverIdx] = useState<number>(-1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ---- Canvas drawing ----
  const drawCanvas = useCallback(() => {
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
    const scaleX = w / CANVAS_W
    const scaleY = h / CANVAS_H

    // Background
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, w, h)

    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      for (let gx = 0; gx < CANVAS_W; gx += 50) {
        const sx = gx * scaleX
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, h)
        ctx.stroke()
      }
      for (let gy = 0; gy < CANVAS_H; gy += 50) {
        const sy = gy * scaleY
        ctx.beginPath()
        ctx.moveTo(0, sy)
        ctx.lineTo(w, sy)
        ctx.stroke()
      }
    }

    // Viewport label
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '12px sans-serif'
    ctx.fillText(`Game Screen ${CANVAS_W}×${CANVAS_H}`, 8, 16)

    // Collect coord steps for path lines
    const coordSteps = steps
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => HAS_COORDS.includes(s.type) && (s.x > 0 || s.y > 0))

    // Draw connecting lines
    if (coordSteps.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      const first = coordSteps[0]
      ctx.moveTo(first.s.x * scaleX, first.s.y * scaleY)
      for (let i = 1; i < coordSteps.length; i++) {
        ctx.lineTo(coordSteps[i].s.x * scaleX, coordSteps[i].s.y * scaleY)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Arrowheads
      for (let i = 1; i < coordSteps.length; i++) {
        const fromX = coordSteps[i - 1].s.x * scaleX
        const fromY = coordSteps[i - 1].s.y * scaleY
        const toX = coordSteps[i].s.x * scaleX
        const toY = coordSteps[i].s.y * scaleY
        const angle = Math.atan2(toY - fromY, toX - fromX)
        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2
        const arrowLen = 8
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.beginPath()
        ctx.moveTo(midX + arrowLen * Math.cos(angle), midY + arrowLen * Math.sin(angle))
        ctx.lineTo(midX + arrowLen * Math.cos(angle + 2.5), midY + arrowLen * Math.sin(angle + 2.5))
        ctx.lineTo(midX + arrowLen * Math.cos(angle - 2.5), midY + arrowLen * Math.sin(angle - 2.5))
        ctx.closePath()
        ctx.fill()
      }
    }

    // FindColor regions
    steps.forEach((s) => {
      if (s.type === 'findcolor' && s.x2 > 0 && s.y2 > 0) {
        ctx.strokeStyle = `rgba(236, 72, 153, 0.3)`
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.strokeRect(
          s.x * scaleX,
          s.y * scaleY,
          (s.x2 - s.x) * scaleX,
          (s.y2 - s.y) * scaleY,
        )
        ctx.setLineDash([])
      }
    })

    // Draw nodes
    coordSteps.forEach(({ s, i }) => {
      const sx = s.x * scaleX
      const sy = s.y * scaleY
      const isSelected = i === selectedIdx
      const color = STEP_TYPE_COLORS[s.type]

      // Glow for selected
      if (isSelected) {
        ctx.shadowColor = color
        ctx.shadowBlur = 16
      }

      // Circle
      ctx.beginPath()
      ctx.arc(sx, sy, NODE_RADIUS * (isSelected ? 1.3 : 1), 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(0,0,0,0.4)'
      ctx.lineWidth = isSelected ? 3 : 1.5
      ctx.stroke()

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Step number
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${NODE_RADIUS - 2}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i + 1), sx, sy)

      // Coordinate label
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`(${s.x},${s.y})`, sx, sy + NODE_RADIUS + 4)
    })

    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  }, [steps, selectedIdx, showGrid])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  useEffect(() => {
    const handleResize = () => drawCanvas()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawCanvas])

  // ---- Canvas interaction ----
  function canvasToGame(clientX: number, clientY: number): { gx: number; gy: number } {
    const canvas = canvasRef.current
    if (!canvas) return { gx: 0, gy: 0 }
    const rect = canvas.getBoundingClientRect()
    const rx = clientX - rect.left
    const ry = clientY - rect.top
    const gx = Math.round((rx / rect.width) * CANVAS_W)
    const gy = Math.round((ry / rect.height) * CANVAS_H)
    return { gx, gy }
  }

  function findNodeAt(gx: number, gy: number): number {
    const canvas = canvasRef.current
    if (!canvas) return -1
    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / CANVAS_W
    const scaleY = rect.height / CANVAS_H
    const hitRadius = NODE_RADIUS / Math.min(scaleX, scaleY) + 8

    for (let i = steps.length - 1; i >= 0; i--) {
      const s = steps[i]
      if (!HAS_COORDS.includes(s.type)) continue
      const dx = s.x - gx
      const dy = s.y - gy
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) return i
    }
    return -1
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { gx, gy } = canvasToGame(e.clientX, e.clientY)
    const hitIdx = findNodeAt(gx, gy)
    if (hitIdx >= 0) {
      setCanvasDragIdx(hitIdx)
      setSelectedIdx(hitIdx)
    } else if (selectedIdx >= 0 && HAS_COORDS.includes(steps[selectedIdx].type)) {
      // Click to set coords for selected step
      updateStep(selectedIdx, { x: gx, y: gy })
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (canvasDragIdx < 0) return
    const { gx, gy } = canvasToGame(e.clientX, e.clientY)
    updateStep(canvasDragIdx, { x: Math.max(0, Math.min(CANVAS_W, gx)), y: Math.max(0, Math.min(CANVAS_H, gy)) })
  }

  function handleCanvasMouseUp() {
    setCanvasDragIdx(-1)
  }

  // ---- Step CRUD ----
  function addStep(type: StepType) {
    const s = createStep(type)
    setSteps((prev) => [...prev, s])
    setSelectedIdx(steps.length)
  }

  function updateStep(idx: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx))
    if (selectedIdx === idx) setSelectedIdx(-1)
    else if (selectedIdx > idx) setSelectedIdx(selectedIdx - 1)
  }

  function duplicateStep(idx: number) {
    const clone = { ...steps[idx], id: newId() }
    setSteps((prev) => [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)])
    setSelectedIdx(idx + 1)
  }

  function moveStep(from: number, to: number) {
    if (from === to) return
    setSteps((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
    setSelectedIdx(to)
  }

  // ---- Drag reorder in sidebar ----
  function handleDragStart(idx: number) {
    setDragIdx(idx)
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  function handleDrop(idx: number) {
    if (dragIdx >= 0) {
      moveStep(dragIdx, idx)
    }
    setDragIdx(-1)
    setDragOverIdx(-1)
  }

  function handleDragEnd() {
    setDragIdx(-1)
    setDragOverIdx(-1)
  }

  // ---- Template ----
  function loadTemplate(t: Template) {
    // Deep clone steps with new IDs
    const newSteps = t.steps.map((s) => ({ ...s, id: newId() }))
    setSteps(newSteps)
    setWalkDelay(t.walkDelay)
    setMapDelay(t.mapDelay)
    setGateDelay(t.gateDelay)
    setSelectedIdx(-1)
  }

  // ---- Copy ----
  const script = generateScript(steps, walkDelay, mapDelay, gateDelay)

  function handleCopy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ---- Selected step ----
  const sel = selectedIdx >= 0 && selectedIdx < steps.length ? steps[selectedIdx] : null

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">按鍵精靈腳本編輯器</h1>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <span className="text-muted">walkDelay</span>
            <input
              type="number"
              className="w-16 rounded border border-hairline bg-canvas px-2 py-1 text-center text-ink"
              value={walkDelay}
              onChange={(e) => setWalkDelay(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-muted">mapDelay</span>
            <input
              type="number"
              className="w-16 rounded border border-hairline bg-canvas px-2 py-1 text-center text-ink"
              value={mapDelay}
              onChange={(e) => setMapDelay(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-muted">gateDelay</span>
            <input
              type="number"
              className="w-16 rounded border border-hairline bg-canvas px-2 py-1 text-center text-ink"
              value={gateDelay}
              onChange={(e) => setGateDelay(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* ======== LEFT SIDEBAR: Step List ======== */}
        <div className="flex flex-col rounded-2xl border border-hairline bg-canvas" style={{ width: 320, flexShrink: 0 }}>
          <div className="border-b border-hairline px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-ink">步驟列表</h2>
              <span className="text-xs text-muted-soft">{steps.length} 步</span>
            </div>
            {/* Add step buttons */}
            <div className="mt-2 flex flex-wrap gap-1">
              {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => addStep(t)}
                  className="rounded px-1.5 py-0.5 text-[11px] border border-hairline hover:bg-surface-soft transition-colors text-ink"
                  style={{ borderColor: STEP_TYPE_COLORS[t], color: STEP_TYPE_COLORS[t] }}
                >
                  + {STEP_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Step list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {steps.length === 0 && (
              <div className="text-center text-sm text-muted-soft py-8">
                點擊上方按鈕新增步驟<br />或選擇右側模板
              </div>
            )}
            {steps.map((s, i) => (
              <div
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedIdx(i)}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors ${
                  i === selectedIdx
                    ? 'bg-rausch/5 ring-1 ring-rausch/30'
                    : dragOverIdx === i
                    ? 'bg-surface-soft'
                    : 'hover:bg-surface-soft'
                }`}
              >
                {/* Drag handle */}
                <span className="cursor-grab text-muted-soft hover:text-muted select-none" title="拖曳排序">⠿</span>
                {/* Color dot */}
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STEP_TYPE_COLORS[s.type] }}
                />
                {/* Step info */}
                <span className="flex-1 truncate">
                  <span className="font-medium text-ink">{i + 1}.</span>{' '}
                  <span className="text-muted">{STEP_TYPE_LABELS[s.type]}</span>
                  {HAS_COORDS.includes(s.type) && (s.x > 0 || s.y > 0) && (
                    <span className="text-muted-soft ml-1">({s.x},{s.y})</span>
                  )}
                  {s.type === 'say' && s.text && (
                    <span className="text-muted-soft ml-1">&quot;{s.text}&quot;</span>
                  )}
                  {s.type === 'label' && s.text && (
                    <span className="text-muted-soft ml-1">{s.text}</span>
                  )}
                  {s.type === 'goto' && s.text && (
                    <span className="text-muted-soft ml-1">→ {s.text}</span>
                  )}
                  {s.type === 'delay' && (
                    <span className="text-muted-soft ml-1">{s.delayMs}ms</span>
                  )}
                  {s.type === 'sub' && s.text && (
                    <span className="text-muted-soft ml-1">{s.text}()</span>
                  )}
                  {s.comment && (
                    <span className="text-muted-soft ml-1">{'// '}{s.comment}</span>
                  )}
                </span>
                {/* Actions */}
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateStep(i) }}
                  className="opacity-0 group-hover:opacity-100 text-muted-soft hover:text-rausch transition-opacity"
                  title="複製"
                >⧉</button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeStep(i) }}
                  className="opacity-0 group-hover:opacity-100 text-muted-soft hover:text-red-500 transition-opacity"
                  title="刪除"
                >✕</button>
              </div>
            ))}
          </div>

          {/* Selected step editor */}
          {sel && (
            <div className="border-t border-hairline p-3 space-y-2 bg-surface-soft">
              <div className="text-xs font-semibold text-muted">
                編輯步驟 #{selectedIdx + 1}: {STEP_TYPE_LABELS[sel.type]}
              </div>

              {/* Type selector */}
              <label className="block">
                <span className="text-[11px] text-muted">類型</span>
                <select
                  className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                  value={sel.type}
                  onChange={(e) => updateStep(selectedIdx, { type: e.target.value as StepType })}
                >
                  {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((t) => (
                    <option key={t} value={t}>{STEP_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </label>

              {/* Coordinates */}
              {HAS_COORDS.includes(sel.type) && (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span className="text-[11px] text-muted">X</span>
                    <input
                      type="number"
                      className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                      value={sel.x}
                      onChange={(e) => updateStep(selectedIdx, { x: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-[11px] text-muted">Y</span>
                    <input
                      type="number"
                      className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                      value={sel.y}
                      onChange={(e) => updateStep(selectedIdx, { y: Number(e.target.value) })}
                    />
                  </label>
                </div>
              )}

              {/* FindColor region */}
              {sel.type === 'findcolor' && (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span className="text-[11px] text-muted">X2</span>
                    <input
                      type="number"
                      className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                      value={sel.x2}
                      onChange={(e) => updateStep(selectedIdx, { x2: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-[11px] text-muted">Y2</span>
                    <input
                      type="number"
                      className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                      value={sel.y2}
                      onChange={(e) => updateStep(selectedIdx, { y2: Number(e.target.value) })}
                    />
                  </label>
                </div>
              )}

              {/* Color */}
              {(sel.type === 'findcolor' || sel.type === 'ifcolor') && (
                <label className="block">
                  <span className="text-[11px] text-muted">顏色 (BGR格式, 如 0000FF=紅, FFFF00=青)</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      className="block flex-1 rounded border border-hairline bg-canvas px-2 py-1 text-xs font-mono text-ink"
                      value={sel.color}
                      onChange={(e) => updateStep(selectedIdx, { color: e.target.value.replace('#', '') })}
                    />
                    <span
                      className="inline-block h-6 w-6 rounded border border-hairline"
                      style={{ backgroundColor: `#${bgrToRgb(sel.color)}` }}
                    />
                  </div>
                </label>
              )}

              {/* Text field */}
              {['say', 'sub', 'label', 'goto', 'keypress'].includes(sel.type) && (
                <label className="block">
                  <span className="text-[11px] text-muted">
                    {sel.type === 'say' ? '文字' : sel.type === 'sub' ? '子程序名稱' : sel.type === 'label' ? '標記名稱' : sel.type === 'goto' ? '跳轉目標' : '按鍵名稱'}
                  </span>
                  <input
                    type="text"
                    className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                    value={sel.text}
                    onChange={(e) => updateStep(selectedIdx, { text: e.target.value })}
                  />
                </label>
              )}

              {/* Loop condition */}
              {sel.type === 'loop_start' && (
                <label className="block">
                  <span className="text-[11px] text-muted">條件 (留空=Do...Loop)</span>
                  <input
                    type="text"
                    className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                    placeholder="e.g. killCount < 6"
                    value={sel.text}
                    onChange={(e) => updateStep(selectedIdx, { text: e.target.value })}
                  />
                </label>
              )}

              {/* KeyPress count */}
              {sel.type === 'keypress' && (
                <label className="block">
                  <span className="text-[11px] text-muted">次數</span>
                  <input
                    type="number"
                    className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                    value={sel.keyCount}
                    min={1}
                    onChange={(e) => updateStep(selectedIdx, { keyCount: Number(e.target.value) })}
                  />
                </label>
              )}

              {/* Delay */}
              {sel.type === 'delay' && (
                <label className="block">
                  <span className="text-[11px] text-muted">延遲 (ms)</span>
                  <input
                    type="number"
                    className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                    value={sel.delayMs}
                    onChange={(e) => updateStep(selectedIdx, { delayMs: Number(e.target.value) })}
                  />
                </label>
              )}

              {/* Comment */}
              <label className="block">
                <span className="text-[11px] text-muted">備註</span>
                <input
                  type="text"
                  className="mt-0.5 block w-full rounded border border-hairline bg-canvas px-2 py-1 text-xs text-ink"
                  value={sel.comment}
                  onChange={(e) => updateStep(selectedIdx, { comment: e.target.value })}
                  placeholder="選填"
                />
              </label>
            </div>
          )}
        </div>

        {/* ======== CENTER: Canvas (fixed size) ======== */}
        <div className="flex-shrink-0 flex flex-col rounded-2xl border border-hairline bg-canvas overflow-hidden" style={{ width: CANVAS_W * 0.5 + 16 }}>
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
            <h2 className="font-semibold text-sm text-ink">遊戲畫面預覽 <span className="font-normal text-muted-soft">({CANVAS_W}×{CANVAS_H})</span></h2>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted">格線</span>
              </label>
              <span className="text-muted-soft">點擊設座標 | 拖曳移動</span>
            </div>
          </div>
          <div ref={containerRef} className="relative bg-ink p-2">
            <canvas
              ref={canvasRef}
              className="cursor-crosshair rounded"
              style={{ width: CANVAS_W * 0.5, height: CANVAS_H * 0.5 }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
        </div>

        {/* ======== RIGHT SIDEBAR: Script Output & Templates ======== */}
        <div className="flex flex-col flex-1 min-w-0 rounded-2xl border border-hairline bg-canvas">
          {/* Templates */}
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="font-semibold text-sm text-ink mb-2">模板</h2>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => loadTemplate(t)}
                  className="rounded-lg border border-hairline bg-canvas px-2.5 py-1 text-xs text-bodytext hover:bg-surface-soft transition-colors"
                  title={t.description}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Script output */}
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
            <h2 className="font-semibold text-sm text-ink">腳本輸出</h2>
            <button
              onClick={handleCopy}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-ink text-canvas hover:bg-ink/80'
              }`}
            >
              {copied ? '已複製!' : '複製腳本'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <pre className="whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed text-bodytext bg-surface-soft rounded-lg p-3 min-h-full select-all">
              {script || '// 新增步驟後，腳本會自動產生在這裡'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
