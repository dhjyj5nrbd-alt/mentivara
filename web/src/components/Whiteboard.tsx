import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Pen, Highlighter, Minus, MoveRight, Square, Circle, Type,
  Eraser, Undo2, Redo2, Trash2, Grid3X3, Download, Maximize2, X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WhiteboardProps {
  onExpand?: () => void
  isExpanded?: boolean
  onCollapse?: () => void
}

type Tool = 'pen' | 'highlighter' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser'

interface Point { x: number; y: number }

const COLORS = [
  '#000000', '#7C3AED', '#E11D48', '#2563EB', '#059669', '#D97706', '#FFFFFF', '#6B7280',
]

const WIDTHS = [
  { label: 'Thin', value: 1, size: 4 },
  { label: 'Medium', value: 3, size: 8 },
  { label: 'Thick', value: 5, size: 12 },
]

const MAX_HISTORY = 50

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Whiteboard({ onExpand, isExpanded, onCollapse }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Tool state
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [showGrid, setShowGrid] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Drawing state
  const isDrawing = useRef(false)
  const startPoint = useRef<Point | null>(null)
  const currentPoints = useRef<Point[]>([])

  // Text state
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null)
  const textRef = useRef<HTMLInputElement>(null)

  // History (ImageData snapshots)
  const historyStack = useRef<ImageData[]>([])
  const redoStack = useRef<ImageData[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  /* ---- helpers --------------------------------------------------- */

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    return canvas ? canvas.getContext('2d') : null
  }, [])

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyStack.current.push(snap)
    if (historyStack.current.length > MAX_HISTORY) historyStack.current.shift()
    redoStack.current = []
    setCanUndo(historyStack.current.length > 0)
    setCanRedo(false)
  }, [getCtx])

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save()
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 0.5
    const step = 30
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    ctx.restore()
  }, [])

  const clearCanvas = useCallback((withGrid?: boolean) => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (withGrid ?? showGrid) drawGrid(ctx, canvas.width, canvas.height)
  }, [getCtx, showGrid, drawGrid])

  /* ---- resize ---------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let prevImage: ImageData | null = null

    const resize = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Save current content
      if (canvas.width > 0 && canvas.height > 0) {
        prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height)
      }
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      // Restore
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (showGrid) drawGrid(ctx, canvas.width, canvas.height)
      if (prevImage) ctx.putImageData(prevImage, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [showGrid, drawGrid, isExpanded])

  /* ---- grid toggle ----------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    // Save current drawing, re-render with/without grid
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (showGrid) drawGrid(ctx, canvas.width, canvas.height)
    ctx.putImageData(img, 0, 0)
  }, [showGrid, getCtx, drawGrid])

  /* ---- text input focus ------------------------------------------ */

  useEffect(() => {
    if (textInput && textRef.current) textRef.current.focus()
  }, [textInput])

  /* ---- keyboard: Escape for fullscreen & text -------------------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (textInput) {
          commitText()
        } else if (isExpanded && onCollapse) {
          onCollapse()
        }
      }
      // ctrl+z / ctrl+y
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, onCollapse, textInput])

  /* ---- coordinate helper ----------------------------------------- */

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0] || (e as React.TouchEvent).changedTouches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  /* ---- drawing helpers ------------------------------------------- */

  const drawArrowhead = (ctx: CanvasRenderingContext2D, from: Point, to: Point, size: number) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    ctx.beginPath()
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  const drawShapePreview = (ctx: CanvasRenderingContext2D, snapshot: ImageData, from: Point, to: Point) => {
    ctx.putImageData(snapshot, 0, 0)
    if (showGrid) drawGrid(ctx, canvasRef.current!.width, canvasRef.current!.height)

    ctx.save()
    ctx.strokeStyle = tool === 'highlighter' ? color : color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'highlighter') ctx.globalAlpha = 0.3

    if (tool === 'line' || tool === 'arrow') {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      if (tool === 'arrow') {
        ctx.fillStyle = color
        drawArrowhead(ctx, from, to, Math.max(10, lineWidth * 3))
      }
    } else if (tool === 'rectangle') {
      ctx.beginPath()
      ctx.strokeRect(
        Math.min(from.x, to.x), Math.min(from.y, to.y),
        Math.abs(to.x - from.x), Math.abs(to.y - from.y),
      )
    } else if (tool === 'circle') {
      const rx = Math.abs(to.x - from.x) / 2
      const ry = Math.abs(to.y - from.y) / 2
      const cx = Math.min(from.x, to.x) + rx
      const cy = Math.min(from.y, to.y) + ry
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  /* ---- mouse/touch handlers -------------------------------------- */

  const snapshotBeforeDraw = useRef<ImageData | null>(null)

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'text') {
      const pos = getPos(e)
      if (textInput) commitText()
      setTextInput({ x: pos.x, y: pos.y, value: '' })
      return
    }

    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    isDrawing.current = true
    const pos = getPos(e)
    startPoint.current = pos
    currentPoints.current = [pos]

    // Save snapshot for shape preview & undo
    snapshotBeforeDraw.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    const start = startPoint.current!

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      currentPoints.current.push(pos)
      const pts = currentPoints.current

      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (tool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 20
        ctx.globalCompositeOperation = 'source-over'
      } else if (tool === 'highlighter') {
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth * 6
        ctx.globalAlpha = 0.08
      } else {
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
      }

      // Quadratic curve smoothing
      if (pts.length >= 3) {
        const p0 = pts[pts.length - 3]
        const p1 = pts[pts.length - 2]
        const p2 = pts[pts.length - 1]
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
        ctx.stroke()
      } else if (pts.length === 2) {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        ctx.lineTo(pts[1].x, pts[1].y)
        ctx.stroke()
      }
      ctx.restore()
    } else if (snapshotBeforeDraw.current) {
      // Shape tools — redraw from snapshot each move
      drawShapePreview(ctx, snapshotBeforeDraw.current, start, pos)
    }
  }

  const handleUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    isDrawing.current = false

    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    const start = startPoint.current!
    const pos = getPos(e)

    // Push undo snapshot (taken before drawing started)
    if (snapshotBeforeDraw.current) {
      historyStack.current.push(snapshotBeforeDraw.current)
      if (historyStack.current.length > MAX_HISTORY) historyStack.current.shift()
      redoStack.current = []
      setCanUndo(true)
      setCanRedo(false)
    }

    // Finalize shape tools (the preview already drew it, but redo final render for clean result)
    if (tool === 'line' || tool === 'arrow' || tool === 'rectangle' || tool === 'circle') {
      if (snapshotBeforeDraw.current) {
        ctx.putImageData(snapshotBeforeDraw.current, 0, 0)
        if (showGrid) drawGrid(ctx, canvas.width, canvas.height)
      }
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.fillStyle = color

      if (tool === 'line' || tool === 'arrow') {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        if (tool === 'arrow') drawArrowhead(ctx, start, pos, Math.max(10, lineWidth * 3))
      } else if (tool === 'rectangle') {
        ctx.beginPath()
        ctx.strokeRect(
          Math.min(start.x, pos.x), Math.min(start.y, pos.y),
          Math.abs(pos.x - start.x), Math.abs(pos.y - start.y),
        )
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - start.x) / 2
        const ry = Math.abs(pos.y - start.y) / 2
        const cx = Math.min(start.x, pos.x) + rx
        const cy = Math.min(start.y, pos.y) + ry
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    snapshotBeforeDraw.current = null
    currentPoints.current = []
    startPoint.current = null
  }

  /* ---- text ------------------------------------------------------ */

  const commitText = () => {
    if (!textInput || !textInput.value.trim()) { setTextInput(null); return }
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    saveSnapshot()
    ctx.save()
    ctx.font = `${Math.max(16, lineWidth * 6)}px sans-serif`
    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.fillText(textInput.value, textInput.x, textInput.y)
    ctx.restore()
    setTextInput(null)
  }

  /* ---- undo / redo ----------------------------------------------- */

  const undo = () => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas || historyStack.current.length === 0) return

    // Save current state to redo
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))

    const prev = historyStack.current.pop()!
    ctx.putImageData(prev, 0, 0)
    setCanUndo(historyStack.current.length > 0)
    setCanRedo(true)
  }

  const redo = () => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas || redoStack.current.length === 0) return

    // Save current to undo
    historyStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))

    const next = redoStack.current.pop()!
    ctx.putImageData(next, 0, 0)
    setCanUndo(true)
    setCanRedo(redoStack.current.length > 0)
  }

  /* ---- clear ----------------------------------------------------- */

  const handleClear = () => {
    if (!showClearConfirm) { setShowClearConfirm(true); return }
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (ctx && canvas) saveSnapshot()
    clearCanvas()
    setShowClearConfirm(false)
  }

  /* ---- download -------------------------------------------------- */

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  /* ---- cursor ---------------------------------------------------- */

  const cursorClass: Record<Tool, string> = {
    pen: 'cursor-crosshair',
    highlighter: 'cursor-crosshair',
    line: 'cursor-crosshair',
    arrow: 'cursor-crosshair',
    rectangle: 'cursor-crosshair',
    circle: 'cursor-crosshair',
    text: 'cursor-text',
    eraser: 'cursor-cell',
  }

  /* ---- tool button helper ---------------------------------------- */

  const ToolBtn = ({ t, icon, label }: { t: Tool; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => { setTool(t); setShowClearConfirm(false) }}
      className={`p-1.5 rounded transition-colors ${tool === t ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
      title={label}
    >
      {icon}
    </button>
  )

  const ActionBtn = ({ onClick, icon, label, disabled, danger }: {
    onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean; danger?: boolean
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={label}
    >
      {icon}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1 shrink-0" />

  /* ---- render ---------------------------------------------------- */

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-[#1a1d2e] border-b border-slate-200 dark:border-slate-700 flex-wrap">
        {/* Drawing tools */}
        <ToolBtn t="pen" icon={<Pen className="w-4 h-4" />} label="Pen" />
        <ToolBtn t="highlighter" icon={<Highlighter className="w-4 h-4" />} label="Highlighter" />
        <ToolBtn t="line" icon={<Minus className="w-4 h-4" />} label="Straight Line" />
        <ToolBtn t="arrow" icon={<MoveRight className="w-4 h-4" />} label="Arrow" />
        <ToolBtn t="rectangle" icon={<Square className="w-4 h-4" />} label="Rectangle" />
        <ToolBtn t="circle" icon={<Circle className="w-4 h-4" />} label="Circle / Ellipse" />
        <ToolBtn t="text" icon={<Type className="w-4 h-4" />} label="Text" />

        <Divider />

        {/* Colours */}
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen') }}
            className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${color === c ? 'ring-2 ring-[#7C3AED] ring-offset-1 border-[#7C3AED]' : 'border-slate-300 dark:border-slate-500 hover:scale-110'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}

        <Divider />

        {/* Width */}
        {WIDTHS.map((w) => (
          <button
            key={w.value}
            onClick={() => setLineWidth(w.value)}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${lineWidth === w.value ? 'bg-[#EDE9FE]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            title={w.label}
          >
            <span
              className="rounded-full bg-current"
              style={{ width: w.size, height: w.size, color: lineWidth === w.value ? '#7C3AED' : '#6B7280' }}
            />
          </button>
        ))}

        <Divider />

        {/* Actions */}
        <ToolBtn t="eraser" icon={<Eraser className="w-4 h-4" />} label="Eraser" />
        <ActionBtn onClick={undo} icon={<Undo2 className="w-4 h-4" />} label="Undo (Ctrl+Z)" disabled={!canUndo} />
        <ActionBtn onClick={redo} icon={<Redo2 className="w-4 h-4" />} label="Redo (Ctrl+Y)" disabled={!canRedo} />

        {showClearConfirm ? (
          <button
            onClick={handleClear}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Confirm clear
          </button>
        ) : (
          <ActionBtn onClick={handleClear} icon={<Trash2 className="w-4 h-4" />} label="Clear all" danger />
        )}

        <ActionBtn
          onClick={() => {
            const canvas = canvasRef.current
            const ctx = getCtx()
            if (!canvas || !ctx) return
            saveSnapshot()
            setShowGrid(!showGrid)
          }}
          icon={<Grid3X3 className={`w-4 h-4 ${showGrid ? 'text-[#7C3AED]' : ''}`} />}
          label="Toggle grid"
        />
        <ActionBtn onClick={downloadPng} icon={<Download className="w-4 h-4" />} label="Download as PNG" />

        <div className="flex-1" />

        {/* Expand / Collapse */}
        {isExpanded ? (
          <ActionBtn onClick={() => onCollapse?.()} icon={<X className="w-4 h-4" />} label="Exit fullscreen (Esc)" />
        ) : (
          <ActionBtn onClick={() => onExpand?.()} icon={<Maximize2 className="w-4 h-4" />} label="Fullscreen" />
        )}
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className={`flex-1 relative bg-white ${cursorClass[tool]}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={() => { if (isDrawing.current) handleUp({} as React.MouseEvent) }}
          onTouchStart={(e) => { e.preventDefault(); handleDown(e) }}
          onTouchMove={(e) => { e.preventDefault(); handleMove(e) }}
          onTouchEnd={(e) => { e.preventDefault(); handleUp(e) }}
          className="absolute inset-0"
        />

        {/* Text input overlay */}
        {textInput && (
          <input
            ref={textRef}
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') commitText() }}
            onBlur={commitText}
            className="absolute bg-transparent border-b-2 border-[#7C3AED] outline-none text-black"
            style={{
              left: textInput.x,
              top: textInput.y,
              fontSize: `${Math.max(16, lineWidth * 6)}px`,
              color,
              minWidth: 60,
            }}
          />
        )}
      </div>
    </div>
  )
}
