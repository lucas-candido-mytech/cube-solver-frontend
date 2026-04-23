import { useState, useCallback } from 'react'
import { STEPS, createEmptyFaces } from './constants'
import Stepper from './components/Stepper'
import CubeViewer3D from './components/CubeViewer3D'
import CameraCapture from './components/CameraCapture'
import FaceEditor from './components/FaceEditor'
import CubeNet from './components/CubeNet'
import './App.css'

export default function App() {
  const [faces, setFaces] = useState(createEmptyFaces)
  const [stepIdx, setStepIdx] = useState(0)
  const [mode, setMode] = useState('camera')
  const [solution, setSolution] = useState(null)
  const [error, setError] = useState('')

  const updateFace = useCallback((face, colors) => {
    setFaces(prev => ({ ...prev, [face]: colors }))
  }, [])

  const goToFace = (f) => {
    const i = STEPS.findIndex(s => s.face === f)
    if (i >= 0) setStepIdx(i)
  }

  const allDone = STEPS.every(s => !faces[s.face].includes('empty'))
  const step = STEPS[stepIdx]
  const faceDone = !faces[step.face].includes('empty')

  const solve = async () => {
    setError(''); setSolution(null)
    try {
      const res = await fetch('/solve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faces })
      })
      const data = await res.json()
      if (data.error) setError('Erro: ' + data.error)
      else setSolution(data.solution)
    } catch (e) { setError('Erro: ' + e.message) }
  }

  const reset = () => {
    setFaces(createEmptyFaces()); setStepIdx(0)
    setSolution(null); setError('')
  }

  return (
    <>
      <h1>🧊 Cube Solver</h1>
      <div className="mode-toggle">
        <button className={mode === 'camera' ? 'active' : ''} onClick={() => setMode('camera')}>📷 Câmera</button>
        <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>✏️ Manual</button>
      </div>

      <Stepper stepIdx={stepIdx} faces={faces} onGoStep={setStepIdx} />

      <div className="instruction">
        <div className="face-title">Passo {stepIdx + 1}/6: {step.title} ({step.color})</div>
        <div className="face-hint">{step.hint}</div>
        {faceDone
          ? <div style={{ color: '#00ff88', marginTop: 4, fontWeight: 'bold' }}>✅ Face preenchida!</div>
          : <div style={{ color: '#ffdd00', marginTop: 4 }}>Capture ou pinte manualmente.</div>}
      </div>

      <div className="main">
        <CubeViewer3D stepIdx={stepIdx} faces={faces} />
        {mode === 'camera' && <CameraCapture stepIdx={stepIdx} faces={faces} onUpdateFace={updateFace} />}
        <div>
          <FaceEditor stepIdx={stepIdx} faces={faces} onUpdateFace={updateFace} />
          <div className="nav-row">
            <button className="btn btn-prev" disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}>← Anterior</button>
            <button className="btn btn-next" disabled={stepIdx === STEPS.length - 1} onClick={() => setStepIdx(i => i + 1)}>Próxima →</button>
          </div>
          <CubeNet stepIdx={stepIdx} faces={faces} onGoToFace={goToFace} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {allDone && <button className="btn btn-solve" onClick={solve}>🧩 Resolver!</button>}
      </div>
      <button className="btn btn-reset" onClick={reset} style={{ marginTop: 10 }}>🔄 Recomeçar</button>

      {solution && (
        <div id="solution">
          <div className="move-count">{solution.split(' ').length} movimentos</div>
          <div className="moves">{solution}</div>
        </div>
      )}
      {error && <div id="error">{error}</div>}
    </>
  )
}
