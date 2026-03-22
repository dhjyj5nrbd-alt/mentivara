import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Pen, Highlighter, Minus, MoveRight, Square, Circle, Type,
  Eraser, Undo2, Redo2, Trash2, Grid3X3, Download, Maximize2, X,
  Plus, ChevronLeft, ChevronRight, StickyNote,
  ZoomIn, ZoomOut,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WhiteboardProps {
  onExpand?: () => void
  isExpanded?: boolean
  onCollapse?: () => void
}

type Tool = 'pen' | 'highlighter' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'laser'

interface Point { x: number; y: number }

const COLORS = [
  '#000000', '#7C3AED', '#E11D48', '#2563EB', '#059669', '#D97706', '#FFFFFF', '#6B7280',
]

const WIDTHS = [
  { label: 'Thin', value: 1, size: 4 },
  { label: 'Medium', value: 3, size: 8 },
  { label: 'Thick', value: 5, size: 12 },
]

const NOTE_COLORS = [
  { label: 'Yellow', bg: '#FEF9C3', header: '#FACC15' },
  { label: 'Pink', bg: '#FCE7F3', header: '#F472B6' },
  { label: 'Green', bg: '#DCFCE7', header: '#4ADE80' },
  { label: 'Blue', bg: '#DBEAFE', header: '#60A5FA' },
]

const MAX_HISTORY = 50
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2]

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

  // Cursor overlay
  const [mousePos, setMousePos] = useState<Point | null>(null)

  // Laser pointer fade
  const laserTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [laserVisible, setLaserVisible] = useState(true)
  const lastLaserPos = useRef<Point | null>(null)

  // Sticky note state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0])
  const [notePosition, setNotePosition] = useState<Point>({ x: 100, y: 100 })
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // Page navigation
  const [pages, setPages] = useState<(ImageData | null)[]>([null]) // null = current canvas state
  const [currentPage, setCurrentPage] = useState(0)

  // Zoom
  const [zoom, setZoom] = useState(1)

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

  /* ---- page management ------------------------------------------- */

  const saveCurrentPageState = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setPages(prev => {
      const updated = [...prev]
      updated[currentPage] = imgData
      return updated
    })
  }, [getCtx, currentPage])

  const loadPage = useCallback((pageIndex: number) => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const pageData = pages[pageIndex]
    if (pageData) {
      ctx.putImageData(pageData, 0, 0)
    } else {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (showGrid) drawGrid(ctx, canvas.width, canvas.height)
    }
  }, [getCtx, pages, showGrid, drawGrid])

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= pages.length || pageIndex === currentPage) return
    saveCurrentPageState()
    setCurrentPage(pageIndex)
    // Load after state update
    setTimeout(() => {
      loadPage(pageIndex)
    }, 0)
  }, [currentPage, pages.length, saveCurrentPageState, loadPage])

  const addPage = useCallback(() => {
    saveCurrentPageState()
    const newIndex = pages.length
    setPages(prev => [...prev, null])
    setCurrentPage(newIndex)
    // Clear history for fresh page
    historyStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
    setTimeout(() => {
      clearCanvas()
    }, 0)
  }, [pages.length, saveCurrentPageState, clearCanvas])

  /* ---- zoom ------------------------------------------------------ */

  const zoomIn = useCallback(() => {
    setZoom(prev => {
      const idx = ZOOM_LEVELS.indexOf(prev)
      if (idx >= 0 && idx < ZOOM_LEVELS.length - 1) return ZOOM_LEVELS[idx + 1]
      const next = ZOOM_LEVELS.find(z => z > prev)
      return next ?? prev
    })
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const idx = ZOOM_LEVELS.indexOf(prev)
      if (idx > 0) return ZOOM_LEVELS[idx - 1]
      const candidates = ZOOM_LEVELS.filter(z => z < prev)
      return candidates.length ? candidates[candidates.length - 1] : prev
    })
  }, [])

  const resetZoom = useCallback(() => setZoom(1), [])

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

  /* ---- note modal focus ------------------------------------------ */

  useEffect(() => {
    if (showNoteModal && noteInputRef.current) noteInputRef.current.focus()
  }, [showNoteModal])

  /* ---- keyboard: Escape for fullscreen & text -------------------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNoteModal) {
          setShowNoteModal(false)
          setNoteText('')
        } else if (textInput) {
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
  }, [isExpanded, onCollapse, textInput, showNoteModal])

  /* ---- ctrl+wheel zoom ------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) zoomIn()
        else zoomOut()
      }
    }
    container.addEventListener('wheel', handler, { passive: false })
    return () => container.removeEventListener('wheel', handler)
  }, [zoomIn, zoomOut])

  /* ---- coordinate helper ----------------------------------------- */

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0] || (e as React.TouchEvent).changedTouches[0]
      return {
        x: (touch.clientX - rect.left) / zoom,
        y: (touch.clientY - rect.top) / zoom,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) / zoom,
      y: ((e as React.MouseEvent).clientY - rect.top) / zoom,
    }
  }

  /* ---- cursor tracking ------------------------------------------- */

  const handleCursorMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setMousePos(pos)

    // Laser pointer fade logic
    if (tool === 'laser') {
      setLaserVisible(true)
      if (laserTimeout.current) clearTimeout(laserTimeout.current)
      const prevPos = lastLaserPos.current
      const moved = !prevPos || Math.abs(pos.x - prevPos.x) > 2 || Math.abs(pos.y - prevPos.y) > 2
      lastLaserPos.current = pos
      if (!moved) {
        laserTimeout.current = setTimeout(() => setLaserVisible(false), 2000)
      } else {
        laserTimeout.current = setTimeout(() => setLaserVisible(false), 2000)
      }
    }
  }

  const handleCursorLeave = () => {
    setMousePos(null)
    if (isDrawing.current) handleUp({} as React.MouseEvent)
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
    // Laser pointer does not draw
    if (tool === 'laser') return

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

    // Record click position for sticky notes
    setNotePosition(pos)

    // Save snapshot for shape preview & undo
    snapshotBeforeDraw.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    if (tool === 'laser') return

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
    const pos = 'clientX' in e || 'touches' in e ? getPos(e) : start

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

  /* ---- sticky note ----------------------------------------------- */

  const placeNote = () => {
    if (!noteText.trim()) { setShowNoteModal(false); setNoteText(''); return }
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    saveSnapshot()

    const noteW = 160
    const headerH = 24
    const padding = 8
    const fontSize = 13
    const maxLineWidth = noteW - padding * 2
    const x = notePosition.x
    const y = notePosition.y

    // Word wrap
    ctx.save()
    ctx.font = `${fontSize}px sans-serif`
    const words = noteText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(testLine).width > maxLineWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const textH = lines.length * (fontSize + 4)
    const noteH = headerH + textH + padding * 2

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // Body
    const radius = 6
    ctx.fillStyle = noteColor.bg
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + noteW - radius, y)
    ctx.quadraticCurveTo(x + noteW, y, x + noteW, y + radius)
    ctx.lineTo(x + noteW, y + noteH - radius)
    ctx.quadraticCurveTo(x + noteW, y + noteH, x + noteW - radius, y + noteH)
    ctx.lineTo(x + radius, y + noteH)
    ctx.quadraticCurveTo(x, y + noteH, x, y + noteH - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()

    // Reset shadow for header
    ctx.shadowColor = 'transparent'

    // Header bar
    ctx.fillStyle = noteColor.header
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + noteW - radius, y)
    ctx.quadraticCurveTo(x + noteW, y, x + noteW, y + radius)
    ctx.lineTo(x + noteW, y + headerH)
    ctx.lineTo(x, y + headerH)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()

    // Text
    ctx.fillStyle = '#1E293B'
    ctx.textBaseline = 'top'
    lines.forEach((line, i) => {
      ctx.fillText(line, x + padding, y + headerH + padding + i * (fontSize + 4))
    })

    ctx.restore()
    setShowNoteModal(false)
    setNoteText('')
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
    link.download = `whiteboard-page${currentPage + 1}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  /* ---- cursor overlay rendering ---------------------------------- */

  const renderCursorOverlay = () => {
    if (!mousePos) return null

    const size = (() => {
      switch (tool) {
        case 'pen':
        case 'line':
        case 'arrow':
        case 'rectangle':
        case 'circle':
          return Math.max(4, lineWidth * 2)
        case 'highlighter':
          return lineWidth * 6
        case 'eraser':
          return 20
        case 'laser':
          return 15
        case 'text':
          return 0 // Use CSS cursor
        default:
          return 4
      }
    })()

    if (tool === 'text') return null

    if (tool === 'laser') {
      return (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: mousePos.x - size / 2,
            top: mousePos.y - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            boxShadow: '0 0 12px 4px rgba(239, 68, 68, 0.5), 0 0 24px 8px rgba(239, 68, 68, 0.25)',
            opacity: laserVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
          }}
        />
      )
    }

    if (tool === 'eraser') {
      return (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: mousePos.x - size / 2,
            top: mousePos.y - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid #94A3B8',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />
      )
    }

    if (tool === 'highlighter') {
      return (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: mousePos.x - size / 2,
            top: mousePos.y - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.2,
          }}
        />
      )
    }

    // Pen and shape tools: filled circle with crosshair
    return (
      <svg
        className="pointer-events-none absolute z-10"
        style={{
          left: mousePos.x - Math.max(size, 12),
          top: mousePos.y - Math.max(size, 12),
          width: Math.max(size, 12) * 2,
          height: Math.max(size, 12) * 2,
        }}
      >
        {/* Crosshair */}
        <line x1="0" y1={Math.max(size, 12)} x2={Math.max(size, 12) * 2} y2={Math.max(size, 12)} stroke="#999" strokeWidth="0.5" />
        <line x1={Math.max(size, 12)} y1="0" x2={Math.max(size, 12)} y2={Math.max(size, 12) * 2} stroke="#999" strokeWidth="0.5" />
        {/* Brush dot */}
        <circle cx={Math.max(size, 12)} cy={Math.max(size, 12)} r={size / 2} fill={color} opacity="0.8" />
      </svg>
    )
  }

  /* ---- tool button helper ---------------------------------------- */

  const ToolBtn = ({ t, icon, label }: { t: Tool; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => { setTool(t); setShowClearConfirm(false) }}
      className={`p-1 rounded transition-colors ${tool === t ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
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
      className={`p-1 rounded transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={label}
    >
      {icon}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-0.5 shrink-0" />

  /* ---- render ---------------------------------------------------- */

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 bg-white dark:bg-[#1a1d2e] border-b border-slate-200 dark:border-slate-700 flex-wrap">
        {/* Draw tools */}
        <ToolBtn t="pen" icon={<Pen className="w-3.5 h-3.5" />} label="Pen" />
        <ToolBtn t="highlighter" icon={<Highlighter className="w-3.5 h-3.5" />} label="Highlighter" />
        <ToolBtn t="line" icon={<Minus className="w-3.5 h-3.5" />} label="Straight Line" />
        <ToolBtn t="arrow" icon={<MoveRight className="w-3.5 h-3.5" />} label="Arrow" />
        <ToolBtn t="rectangle" icon={<Square className="w-3.5 h-3.5" />} label="Rectangle" />
        <ToolBtn t="circle" icon={<Circle className="w-3.5 h-3.5" />} label="Circle / Ellipse" />
        <ToolBtn t="text" icon={<Type className="w-3.5 h-3.5" />} label="Text" />
        <ToolBtn t="laser" icon={
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        } label="Laser Pointer" />

        <Divider />

        {/* Colours */}
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); if (tool === 'eraser' || tool === 'laser') setTool('pen') }}
            className={`w-4 h-4 rounded-full border-2 transition-all shrink-0 ${color === c ? 'ring-2 ring-[#7C3AED] ring-offset-1 border-[#7C3AED]' : 'border-slate-300 dark:border-slate-500 hover:scale-110'}`}
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
            className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${lineWidth === w.value ? 'bg-[#EDE9FE]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            title={w.label}
          >
            <span
              className="rounded-full bg-current"
              style={{ width: w.size, height: w.size, color: lineWidth === w.value ? '#7C3AED' : '#6B7280' }}
            />
          </button>
        ))}

        <Divider />

        {/* Eraser, Undo, Redo */}
        <ToolBtn t="eraser" icon={<Eraser className="w-3.5 h-3.5" />} label="Eraser" />
        <ActionBtn onClick={undo} icon={<Undo2 className="w-3.5 h-3.5" />} label="Undo (Ctrl+Z)" disabled={!canUndo} />
        <ActionBtn onClick={redo} icon={<Redo2 className="w-3.5 h-3.5" />} label="Redo (Ctrl+Y)" disabled={!canRedo} />

        {showClearConfirm ? (
          <button
            onClick={handleClear}
            className="text-xs px-1.5 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
        ) : (
          <ActionBtn onClick={handleClear} icon={<Trash2 className="w-3.5 h-3.5" />} label="Clear all" danger />
        )}

        <Divider />

        {/* Grid & Notes */}
        <ActionBtn
          onClick={() => {
            const canvas = canvasRef.current
            const ctx = getCtx()
            if (!canvas || !ctx) return
            saveSnapshot()
            setShowGrid(!showGrid)
          }}
          icon={<Grid3X3 className={`w-3.5 h-3.5 ${showGrid ? 'text-[#7C3AED]' : ''}`} />}
          label="Toggle grid"
        />
        <ActionBtn
          onClick={() => setShowNoteModal(true)}
          icon={<StickyNote className="w-3.5 h-3.5" />}
          label="Add sticky note"
        />

        <Divider />

        {/* Zoom */}
        <ActionBtn onClick={zoomOut} icon={<ZoomOut className="w-3.5 h-3.5" />} label="Zoom out" disabled={zoom <= ZOOM_LEVELS[0]} />
        <button
          onClick={resetZoom}
          className="text-xs px-1 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded min-w-[36px] text-center"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <ActionBtn onClick={zoomIn} icon={<ZoomIn className="w-3.5 h-3.5" />} label="Zoom in" disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} />

        <Divider />

        {/* Pages */}
        <ActionBtn
          onClick={() => goToPage(currentPage - 1)}
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
          label="Previous page"
          disabled={currentPage === 0}
        />
        <span className="text-xs text-slate-600 dark:text-slate-300 px-0.5 whitespace-nowrap">
          {currentPage + 1}/{pages.length}
        </span>
        <ActionBtn
          onClick={() => goToPage(currentPage + 1)}
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          label="Next page"
          disabled={currentPage === pages.length - 1}
        />
        <ActionBtn
          onClick={addPage}
          icon={<Plus className="w-3.5 h-3.5" />}
          label="Add new page"
        />

        <Divider />

        {/* Download & Expand */}
        <ActionBtn onClick={downloadPng} icon={<Download className="w-3.5 h-3.5" />} label="Download as PNG" />

        <div className="flex-1" />

        {/* Expand / Collapse */}
        {isExpanded ? (
          <ActionBtn onClick={() => onCollapse?.()} icon={<X className="w-3.5 h-3.5" />} label="Exit fullscreen (Esc)" />
        ) : (
          <ActionBtn onClick={() => onExpand?.()} icon={<Maximize2 className="w-3.5 h-3.5" />} label="Fullscreen" />
        )}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-white overflow-hidden"
        style={{ cursor: tool === 'text' ? 'text' : 'none' }}
        onMouseMove={handleCursorMove}
        onMouseLeave={handleCursorLeave}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleDown}
            onMouseMove={(e) => { handleMove(e) }}
            onMouseUp={handleUp}
            onTouchStart={(e) => { e.preventDefault(); handleDown(e) }}
            onTouchMove={(e) => { e.preventDefault(); handleMove(e) }}
            onTouchEnd={(e) => { e.preventDefault(); handleUp(e) }}
            className="absolute inset-0"
          />
        </div>

        {/* Cursor overlay */}
        {renderCursorOverlay()}

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
              left: textInput.x * zoom,
              top: textInput.y * zoom,
              fontSize: `${Math.max(16, lineWidth * 6)}px`,
              color,
              minWidth: 60,
            }}
          />
        )}
      </div>

      {/* Sticky note modal */}
      {showNoteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-lg shadow-xl p-4 w-72 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Add Sticky Note</h3>
              <button
                onClick={() => { setShowNoteModal(false); setNoteText('') }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note colour picker */}
            <div className="flex gap-2 mb-3">
              {NOTE_COLORS.map((nc) => (
                <button
                  key={nc.label}
                  onClick={() => setNoteColor(nc)}
                  className={`w-8 h-8 rounded border-2 transition-all ${noteColor.label === nc.label ? 'ring-2 ring-[#7C3AED] ring-offset-1 border-[#7C3AED]' : 'border-slate-300 hover:scale-110'}`}
                  style={{ backgroundColor: nc.bg }}
                  title={nc.label}
                />
              ))}
            </div>

            <textarea
              ref={noteInputRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) placeNote() }}
              placeholder="Type your note..."
              className="w-full h-20 text-sm border border-slate-200 dark:border-slate-600 rounded p-2 resize-none outline-none focus:ring-2 focus:ring-[#7C3AED] dark:bg-slate-800 dark:text-slate-200"
            />

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-400">Ctrl+Enter to place</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNoteModal(false); setNoteText('') }}
                  className="text-xs px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={placeNote}
                  disabled={!noteText.trim()}
                  className="text-xs px-3 py-1.5 bg-[#7C3AED] text-white rounded hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Place Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
