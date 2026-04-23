import { STEPS, FACE_COLORS_3D, FACE_3D_MAP, COLOR_HEX } from '../constants'
import './CubeViewer3D.css'

export default function CubeViewer3D({ stepIdx, faces }) {
  const step = STEPS[stepIdx]
  return (
    <div className="cube3d-section">
      <div className="cube3d-wrap">
        <div className="cube3d" style={{ transform: step.rotation }}>
          {['U', 'D', 'F', 'B', 'R', 'L'].map(f => (
            <div key={f} className={`face3d f-${FACE_3D_MAP[f]}${f === step.face ? ' highlight' : ''}`}>
              {faces[f].map((c, i) => (
                <div key={i} className="c3d" style={{
                  background: c === 'empty' ? FACE_COLORS_3D[f] : COLOR_HEX[c],
                  opacity: c === 'empty' ? 0.35 : 1
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="arrow-hint">{step.arrow}</div>
    </div>
  )
}
