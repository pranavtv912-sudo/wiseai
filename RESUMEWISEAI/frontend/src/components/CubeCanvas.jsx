import { useEffect, useRef } from 'react'

export default function CubeCanvas({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w = canvas.width = canvas.clientWidth
    let h = canvas.height = canvas.clientHeight

    const onResize = () => {
      w = canvas.width = canvas.clientWidth
      h = canvas.height = canvas.clientHeight
    }
    window.addEventListener('resize', onResize)

    const vertices = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ]
    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ]

    let rotX = 0, rotY = 0, rotZ = 0

    const rxFn = ([x,y,z], a) => [x, y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)]
    const ryFn = ([x,y,z], a) => [x*Math.cos(a)+z*Math.sin(a), y, -x*Math.sin(a)+z*Math.cos(a)]
    const rzFn = ([x,y,z], a) => [x*Math.cos(a)-y*Math.sin(a), x*Math.sin(a)+y*Math.cos(a), z]

    let rafId
    function draw() {
      ctx.clearRect(0, 0, w, h)
      rotX += 0.003; rotY += 0.005; rotZ += 0.002

      const size = Math.min(w, h) * 0.28
      const dist = 4
      const projected = vertices.map(v => {
        let p = rxFn(v, rotX); p = ryFn(p, rotY); p = rzFn(p, rotZ)
        const z = p[2] + dist
        return [(p[0]*size)/(z*0.25)+w/2, (p[1]*size)/(z*0.25)+h/2]
      })

      ctx.shadowBlur = 15; ctx.shadowColor = '#4edea3'
      ctx.strokeStyle = 'rgba(78,222,163,0.35)'; ctx.lineWidth = 1.5
      edges.forEach(([a,b]) => {
        ctx.beginPath()
        ctx.moveTo(projected[a][0], projected[a][1])
        ctx.lineTo(projected[b][0], projected[b][1])
        ctx.stroke()
      })

      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 5
      projected.forEach(([px,py]) => {
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill()
      })
      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0 ${className}`}
    />
  )
}
