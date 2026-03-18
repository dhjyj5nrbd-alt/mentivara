import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, Pen, Trash2 } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  tool: string
  color: string
  width: number
  points: Point[]
}

interface Props {
  strokes: Stroke[]
  onStroke: (stroke: Stroke) => void
  onClear?: () => void
  canClear: boolean
}

const COLORS = ['#000000', '#7C3AED', '#E11D48', '#059669', '#0EA5E9', '#D97706']

export default function Whiteboard({ strokes, onStroke, onClear, canClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return
    ctx.beginPath()
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color
    ctx.lineWidth = stroke.tool === 'eraser' ? 20 : stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    ctx.stroke()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    strokes.forEach((s) => drawStroke(ctx, s))
  }, [strokes, drawStroke])

  useEffect(() => {
    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
        redraw()
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [redraw])

  const getPos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    setCurrentStroke([getPos(e)])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    const newPoints = [...currentStroke, pos]
    setCurrentStroke(newPoints)

    // Draw live
    if (newPoints.length >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
      ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth
      ctx.lineCap = 'round'
      const prev = newPoints[newPoints.length - 2]
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false)
      setCurrentStroke([])
      return
    }
    setIsDrawing(false)
    const stroke: Stroke = { tool, color, width: lineWidth, points: currentStroke }
    onStroke(stroke)
    setCurrentStroke([])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200">
        <button
          onClick={() => setTool('pen')}
          className={`p-1.5 rounded ${tool === 'pen' ? 'bg-white shadow-sm' : ''}`}
          title="Pen"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-white shadow-sm' : ''}`}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool('pen') }}
            className={`w-5 h-5 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-slate-800' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="text-xs bg-white border border-slate-200 rounded px-1 py-0.5"
        >
          <option value={1}>Thin</option>
          <option value={2}>Medium</option>
          <option value={4}>Thick</option>
        </select>
        {canClear && (
          <>
            <div className="flex-1" />
            <button
              onClick={onClear}
              className="p-1.5 rounded text-red-500 hover:bg-red-50"
              title="Clear whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {/* Canvas */}
      <div className="flex-1 relative bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0"
        />
      </div>
    </div>
  )
}
