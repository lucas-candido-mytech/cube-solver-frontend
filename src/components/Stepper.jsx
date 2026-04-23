import { STEPS } from '../constants'
import './Stepper.css'

export default function Stepper({ stepIdx, faces, onGoStep }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        const done = !faces[s.face].includes('empty')
        const cls = i === stepIdx ? 'active' : done ? 'done' : ''
        return (
          <span key={i}>
            {i > 0 && <div className="step-line" />}
            <div className={`step-dot ${cls}`} onClick={() => onGoStep(i)}>{i + 1}</div>
          </span>
        )
      })}
    </div>
  )
}
