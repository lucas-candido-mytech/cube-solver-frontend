import { useRef, useEffect } from 'react'
import { STEPS, classifyColor } from '../constants'

export default function CameraCapture({ stepIdx, faces, onUpdateFace }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(s => { if (videoRef.current) videoRef.current.srcObject = s })
      .catch(() => {})
  }, [])

  const capture = () => {
    const video = videoRef.current, canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, 320, 240)
    const gw = 130, gh = 130, ox = (320 - gw) / 2, oy = (240 - gh) / 2, cw = gw / 3, ch = gh / 3
    const face = STEPS[stepIdx].face
    const newColors = [...faces[face]]
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c
      if (idx === 4) continue
      const cx = ox + c * cw + cw / 2, cy = oy + r * ch + ch / 2, s = 8
      const img = ctx.getImageData(cx - s, cy - s, s * 2, s * 2)
      let rr = 0, gg = 0, bb = 0
      for (let i = 0; i < img.data.length; i += 4) { rr += img.data[i]; gg += img.data[i + 1]; bb += img.data[i + 2] }
      const n = img.data.length / 4
      newColors[idx] = classifyColor(rr / n, gg / n, bb / n)
    }
    onUpdateFace(face, newColors)
  }

  const gw = 130, gh = 130, ox = (320 - gw) / 2, oy = (240 - gh) / 2, cw = gw / 3, ch = gh / 3
  const gridEls = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const ct = r === 1 && c === 1
    gridEls.push(<rect key={`r${r}${c}`} x={ox + c * cw} y={oy + r * ch} width={cw} height={ch} fill={ct ? 'rgba(34,211,238,.15)' : 'none'} stroke="rgba(255,255,255,0.7)" strokeWidth="2" rx="4" />)
    gridEls.push(<circle key={`c${r}${c}`} cx={ox + c * cw + cw / 2} cy={oy + r * ch + ch / 2} r="3" fill="rgba(255,255,255,.4)" />)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/30">
        <video ref={videoRef} autoPlay playsInline width={320} height={240} className="block" />
        <canvas ref={canvasRef} width={320} height={240} className="hidden" />
        <svg className="absolute inset-0 pointer-events-none" width={320} height={240}>{gridEls}</svg>
      </div>
      <button onClick={capture} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/25 active:translate-y-0 transition-all">
        📷 Capturar face
      </button>
    </div>
  )
}
