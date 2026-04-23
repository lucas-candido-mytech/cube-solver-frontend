import { STEPS } from '../constants'
import './CubeNet.css'

export default function CubeNet({ stepIdx, faces, onGoToFace }) {
  const curFace = STEPS[stepIdx].face
  return (
    <div className="cube-net">
      {['U', 'L', 'F', 'R', 'B', 'D'].map(f => (
        <div key={f} className={`face-mini net-${f}${f === curFace ? ' net-active' : ''}`} onClick={() => onGoToFace(f)}>
          {faces[f].map((c, i) => <div key={i} className={`sq color-${c}`} />)}
        </div>
      ))}
    </div>
  )
}
