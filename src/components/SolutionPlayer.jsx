import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { generateStates } from '../cubeLogic'
import { COLOR_HEX } from '../constants'

const MOVE_NAMES = { U: 'Cima', D: 'Baixo', F: 'Frente', B: 'Trás', R: 'Direita', L: 'Esquerda' }
function describeMove(m) {
  const face = MOVE_NAMES[m[0]] || m[0]
  if (m.endsWith("'")) return `${face} 90° ↺`
  if (m.endsWith('2')) return `${face} 180°`
  return `${face} 90° ↻`
}

const SZ = 48, GAP = 3, FACE = SZ * 3 + GAP * 2, H = FACE / 2 + 1

function stickerTransform(face, r, c) {
  const x = -FACE / 2 + c * (SZ + GAP), y = -FACE / 2 + r * (SZ + GAP)
  const t = {
    F: `translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
    B: `rotateY(180deg) translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
    R: `rotateY(90deg) translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
    L: `rotateY(-90deg) translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
    U: `rotateX(-90deg) translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
    D: `rotateX(90deg) translateZ(${H}px) translate3d(${x}px,${y}px,0)`,
  }
  return t[face]
}

// Quais stickers pertencem à camada de um movimento
const AFFECTED = {
  U: { face: 'U', adj: [['F',[0,1,2]],['R',[0,1,2]],['B',[0,1,2]],['L',[0,1,2]]] },
  D: { face: 'D', adj: [['F',[6,7,8]],['R',[6,7,8]],['B',[6,7,8]],['L',[6,7,8]]] },
  F: { face: 'F', adj: [['U',[6,7,8]],['R',[0,3,6]],['D',[2,1,0]],['L',[8,5,2]]] },
  B: { face: 'B', adj: [['U',[2,1,0]],['L',[0,3,6]],['D',[6,7,8]],['R',[8,5,2]]] },
  R: { face: 'R', adj: [['F',[2,5,8]],['U',[2,5,8]],['B',[6,3,0]],['D',[2,5,8]]] },
  L: { face: 'L', adj: [['F',[0,3,6]],['D',[0,3,6]],['B',[8,5,2]],['U',[0,3,6]]] },
}

function isAffected(face, idx, moveFace) {
  const info = AFFECTED[moveFace]
  if (face === info.face) return true
  for (const [f, idxs] of info.adj) if (f === face && idxs.includes(idx)) return true
  return false
}

// Eixo CSS de rotação da camada
const LAYER_AXIS = {
  U: 'rotateY', D: 'rotateY', R: 'rotateX', L: 'rotateX', F: 'rotateZ', B: 'rotateZ',
}
const LAYER_DIR = { U: -1, D: 1, R: 1, L: -1, F: 1, B: -1 }

function getMoveAngle(notation) {
  const dir = LAYER_DIR[notation[0]]
  if (notation.endsWith("'")) return -90 * dir
  if (notation.endsWith('2')) return 180 * dir
  return 90 * dir
}

// Câmera fixa boa para ver todos os movimentos
const DEFAULT_CAM = 'rotateX(-25deg) rotateY(-30deg)'

function Sticker({ face, idx, color, glow }) {
  const r = Math.floor(idx / 3), c = idx % 3
  return (
    <div style={{
      position: 'absolute', width: SZ, height: SZ,
      transform: stickerTransform(face, r, c),
      backfaceVisibility: 'hidden',
    }}>
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: COLOR_HEX[color] || '#1e293b',
        borderRadius: 5, border: '1px solid rgba(0,0,0,0.25)',
        boxShadow: glow ? '0 0 8px rgba(34,211,238,0.5)' : 'inset 0 1px 2px rgba(255,255,255,0.1)',
      }} />
    </div>
  )
}

export default function SolutionPlayer({ initialFaces, solution }) {
  const moves = solution.split(' ')
  const states = useMemo(() => generateStates(initialFaces, solution), [initialFaces, solution])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [animAngle, setAnimAngle] = useState(0)
  const [animBase, setAnimBase] = useState(null)
  const animating = animBase !== null
  const rafRef = useRef(null)
  const playRef = useRef(false)

  const animateStep = useCallback((toStep) => {
    if (toStep < 1 || toStep > moves.length) { setStep(toStep); return }
    const notation = moves[toStep - 1]
    const target = getMoveAngle(notation)
    setAnimBase(notation[0])
    setAnimAngle(0)
    setStep(toStep - 1) // mostra estado ANTES do movimento

    let start = null
    const dur = 350
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimAngle(target * eased)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setAnimBase(null)
        setAnimAngle(0)
        setStep(toStep)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [moves])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])
  useEffect(() => { playRef.current = playing }, [playing])

  useEffect(() => {
    if (!playing || animating) return
    if (step >= moves.length) { setPlaying(false); return }
    const t = setTimeout(() => { if (playRef.current) animateStep(step + 1) }, 150)
    return () => clearTimeout(t)
  }, [playing, step, animating, animateStep, moves.length])

  const goTo = (s) => { setPlaying(false); cancelAnimationFrame(rafRef.current); setAnimBase(null); setAnimAngle(0); setStep(s) }

  const displayFaces = states[step]
  const layerCSS = animBase ? `${LAYER_AXIS[animBase]}(${animAngle}deg)` : ''

  // Separa stickers em estáticos e animados
  const statics = [], animated = []
  for (const face of ['U','D','F','B','R','L']) {
    for (let idx = 0; idx < 9; idx++) {
      const s = <Sticker key={`${face}${idx}`} face={face} idx={idx} color={displayFaces[face][idx]} glow={animBase && isAffected(face, idx, animBase)} />
      if (animBase && isAffected(face, idx, animBase)) animated.push(s)
      else statics.push(s)
    }
  }

  return (
    <div className="mt-6 w-full max-w-lg">
      <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5">
        <div className="text-center mb-3">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Solução</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{moves.length} movimentos</p>
        </div>

        {/* Cubo 3D */}
        <div className="flex justify-center mb-4">
          <div style={{ width: 240, height: 240, perspective: 700 }}>
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              transformStyle: 'preserve-3d',
              transform: DEFAULT_CAM,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Stickers estáticos */}
              <div style={{ position: 'absolute', transformStyle: 'preserve-3d' }}>
                {statics}
              </div>
              {/* Camada animada - gira como grupo */}
              <div style={{
                position: 'absolute', transformStyle: 'preserve-3d',
                transform: layerCSS,
                transition: 'none',
              }}>
                {animated}
              </div>
            </div>
          </div>
        </div>

        {/* Movimento atual */}
        <div className="text-center mb-3 h-12 flex flex-col items-center justify-center">
          {animating ? (
            <>
              <p className="text-3xl font-extrabold text-cyan-400">{moves[step]}</p>
              <p className="text-xs text-white/50">{describeMove(moves[step])}</p>
            </>
          ) : step === 0 ? (
            <p className="text-sm text-white/40">Pressione ▶ para iniciar</p>
          ) : (
            <>
              <p className="text-3xl font-extrabold text-emerald-400">{moves[step - 1]}</p>
              <p className="text-xs text-white/50">Passo {step}/{moves.length} — {describeMove(moves[step - 1])}</p>
            </>
          )}
        </div>

        {/* Progresso */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${(step / moves.length) * 100}%` }} />
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button onClick={() => goTo(0)} disabled={step === 0 || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">⏮</button>
          <button onClick={() => !animating && step > 0 && goTo(step - 1)} disabled={step === 0 || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">◀</button>
          <button onClick={() => { if (playing) setPlaying(false); else { if (step >= moves.length) goTo(0); setPlaying(true) } }}
            disabled={animating}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all">
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={() => !animating && step < moves.length && animateStep(step + 1)} disabled={step >= moves.length || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">▶</button>
          <button onClick={() => goTo(moves.length)} disabled={step >= moves.length || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">⏭</button>
        </div>

        {/* Lista de movimentos */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-3 border-t border-white/8">
          {moves.map((m, i) => (
            <button key={i} onClick={() => !animating && goTo(i + 1)} disabled={animating}
              className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200
                ${i + 1 === step && !animating ? 'bg-cyan-500 text-black scale-110' : i + 1 < step ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}
              `}>{m}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
