import { STEPS, FACE_COLORS_3D, FACE_3D_MAP, COLOR_HEX } from '../constants'

const faceTransforms = {
  front: 'translateZ(90px)', back: 'rotateY(180deg) translateZ(90px)',
  right: 'rotateY(90deg) translateZ(90px)', left: 'rotateY(-90deg) translateZ(90px)',
  top: 'rotateX(90deg) translateZ(90px)', bottom: 'rotateX(-90deg) translateZ(90px)',
}

export default function CubeViewer3D({ stepIdx, faces }) {
  const step = STEPS[stepIdx]
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: 180, height: 180, perspective: 500 }}>
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(.4,0,.2,1)', transform: step.rotation }}>
          {['U', 'D', 'F', 'B', 'R', 'L'].map(f => {
            const side = FACE_3D_MAP[f]
            const isActive = f === step.face
            return (
              <div key={f} style={{ position: 'absolute', width: 180, height: 180, transform: faceTransforms[side], backfaceVisibility: 'visible', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, padding: 3, border: isActive ? '2px solid #22d3ee' : '2px solid rgba(0,0,0,.25)', borderRadius: 8, boxShadow: isActive ? '0 0 20px rgba(34,211,238,.4)' : 'none' }}>
                {faces[f].map((c, i) => (
                  <div key={i} style={{ background: c === 'empty' ? FACE_COLORS_3D[f] : COLOR_HEX[c], opacity: c === 'empty' ? 0.3 : 1, borderRadius: 5, border: '1px solid rgba(0,0,0,.15)' }} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
      <span className="text-xs text-cyan-400/70 font-medium">{step.arrow}</span>
    </div>
  )
}
