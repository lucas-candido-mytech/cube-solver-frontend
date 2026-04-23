import { useState, useCallback } from 'react'
import { STEPS, createEmptyFaces } from './constants'
import Stepper from './components/Stepper'
import CubeViewer3D from './components/CubeViewer3D'
import CameraCapture from './components/CameraCapture'
import FaceEditor from './components/FaceEditor'
import CubeNet from './components/CubeNet'
import SolutionPlayer from './components/SolutionPlayer'

export default function App() {
  const [faces, setFaces] = useState(createEmptyFaces)
  const [stepIdx, setStepIdx] = useState(0)
  const [mode, setMode] = useState('camera')
  const [solution, setSolution] = useState(null)
  const [error, setError] = useState('')
  const [solving, setSolving] = useState(false)

  const updateFace = useCallback((face, colors) => {
    setFaces(prev => ({ ...prev, [face]: colors }))
  }, [])

  const goToFace = (f) => { const i = STEPS.findIndex(s => s.face === f); if (i >= 0) setStepIdx(i) }
  const allDone = STEPS.every(s => !faces[s.face].includes('empty'))
  const step = STEPS[stepIdx]
  const faceDone = !faces[step.face].includes('empty')

  const solve = async () => {
    setError(''); setSolution(null); setSolving(true)
    try {
      const res = await fetch('/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ faces }) })
      const data = await res.json()
      if (data.error) setError(data.error); else setSolution(data.solution)
    } catch (e) { setError('Erro de conexão: ' + e.message) }
    finally { setSolving(false) }
  }

  const reset = () => { setFaces(createEmptyFaces()); setStepIdx(0); setSolution(null); setError('') }

  const progress = STEPS.filter(s => !faces[s.face].includes('empty')).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col items-center px-4 py-6 font-sans">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
          🧊 Cube Solver
        </h1>
        <p className="text-sm text-white/40 mt-1">Escaneie ou pinte as faces do cubo para resolver</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-4">
        {[['camera', '📷 Câmera'], ['manual', '✏️ Manual']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === m ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/25' : 'text-white/50 hover:text-white/70 hover:bg-white/5'}
            `}>{label}</button>
        ))}
      </div>

      <Stepper stepIdx={stepIdx} faces={faces} onGoStep={setStepIdx} />

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${(progress / 6) * 100}%` }} />
        </div>
        <p className="text-[10px] text-white/30 text-center mt-1">{progress}/6 faces preenchidas</p>
      </div>

      {/* Instruction card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl px-6 py-4 mb-5 max-w-lg text-center">
        <div className="text-lg font-semibold">
          <span className="text-white/50 mr-1">{stepIdx + 1}/6</span> {step.emoji} {step.title} <span className="text-white/40">({step.color})</span>
        </div>
        <p className="text-sm text-white/50 mt-1">{step.hint}</p>
        {faceDone
          ? <p className="text-emerald-400 text-sm font-semibold mt-2">✅ Face preenchida!</p>
          : <p className="text-amber-400/70 text-xs mt-2">Capture ou pinte manualmente</p>}
      </div>

      {/* Main panels */}
      <div className="flex gap-5 flex-wrap justify-center items-start">
        <div className="bg-white/[.03] backdrop-blur border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-3">
          <CubeViewer3D stepIdx={stepIdx} faces={faces} />
        </div>

        {mode === 'camera' && (
          <div className="bg-white/[.03] backdrop-blur border border-white/5 rounded-2xl p-5">
            <CameraCapture stepIdx={stepIdx} faces={faces} onUpdateFace={updateFace} />
          </div>
        )}

        <div className="bg-white/[.03] backdrop-blur border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-3">
          <FaceEditor stepIdx={stepIdx} faces={faces} onUpdateFace={updateFace} />
          <div className="flex gap-2 mt-2">
            <button disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/60 border border-white/8 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ← Anterior
            </button>
            <button disabled={stepIdx === STEPS.length - 1} onClick={() => setStepIdx(i => i + 1)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Próxima →
            </button>
          </div>
          <CubeNet stepIdx={stepIdx} faces={faces} onGoToFace={goToFace} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 mt-6">
        {allDone && (
          <button onClick={solve} disabled={solving}
            className="px-10 py-3.5 rounded-2xl text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30 disabled:opacity-50 transition-all">
            {solving ? '⏳ Resolvendo...' : '🧩 Resolver!'}
          </button>
        )}
        <button onClick={reset} className="px-5 py-2 rounded-xl text-xs font-medium text-red-400/70 border border-red-400/20 hover:bg-red-400/10 transition-all">
          🔄 Recomeçar
        </button>
      </div>

      {solution && <SolutionPlayer initialFaces={faces} solution={solution} />}
      {error && (
        <div className="mt-4 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  )
}
