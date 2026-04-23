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

// Ângulos de câmera por face ativa para melhor visualização
const CAM_ANGLES = {
  U: [-30, -30], D: [30, -30], F: [10, 0], B: [10, 180],
  R: [10, -60], L: [10, 60], default: [-25, -30],
}

// Posições dos 9 stickers de cada face no cubo 3D
const S = 52 // tamanho do sticker
const G = 2  // gap
const O = -(S * 3 + G * 2) / 2 // offset para centralizar
const HALF = (S * 3 + G * 2) / 2 + 1

function stickerPos(face, idx) {
  const r = Math.floor(idx / 3), c = idx % 3
  const x = O + c * (S + G), y = O + r * (S + G)
  switch (face) {
    case 'F': return { transform: `translateZ(${HALF}px) translate(${x}px,${y}px)` }
    case 'B': return { transform: `rotateY(180deg) translateZ(${HALF}px) translate(${x}px,${y}px)` }
    case 'R': return { transform: `rotateY(90deg) translateZ(${HALF}px) translate(${x}px,${y}px)` }
    case 'L': return { transform: `rotateY(-90deg) translateZ(${HALF}px) translate(${x}px,${y}px)` }
    case 'U': return { transform: `rotateX(-90deg) translateZ(${HALF}px) translate(${x}px,${y}px)` }
    case 'D': return { transform: `rotateX(90deg) translateZ(${HALF}px) translate(${x}px,${y}px)` }
  }
}

// Quais stickers são afetados por um movimento (face + bordas adjacentes)
const MOVE_STICKERS = {
  U: { face: 'U', adj: [['F',[0,1,2]],['R',[0,1,2]],['B',[0,1,2]],['L',[0,1,2]]] },
  D: { face: 'D', adj: [['F',[6,7,8]],['R',[6,7,8]],['B',[6,7,8]],['L',[6,7,8]]] },
  F: { face: 'F', adj: [['U',[6,7,8]],['R',[0,3,6]],['D',[2,1,0]],['L',[8,5,2]]] },
  B: { face: 'B', adj: [['U',[2,1,0]],['L',[0,3,6]],['D',[6,7,8]],['R',[8,5,2]]] },
  R: { face: 'R', adj: [['F',[2,5,8]],['U',[2,5,8]],['B',[6,3,0]],['D',[2,5,8]]] },
  L: { face: 'L', adj: [['F',[0,3,6]],['D',[0,3,6]],['B',[8,5,2]],['U',[0,3,6]]] },
}

// Eixo e direção de rotação para cada face
const MOVE_AXIS = {
  U: { axis: 'Y', dir: -1 }, D: { axis: 'Y', dir: 1 },
  R: { axis: 'X', dir: 1 }, L: { axis: 'X', dir: -1 },
  F: { axis: 'Z', dir: 1 }, B: { axis: 'Z', dir: -1 },
}

function getRotationAngle(notation) {
  if (notation.endsWith("'")) return -90
  if (notation.endsWith('2')) return 180
  return 90
}

function isAffected(face, idx, moveFace) {
  const info = MOVE_STICKERS[moveFace]
  if (face === info.face) return true
  for (const [f, idxs] of info.adj) {
    if (f === face && idxs.includes(idx)) return true
  }
  return false
}

export default function SolutionPlayer({ initialFaces, solution }) {
  const moves = solution.split(' ')
  const states = useMemo(() => generateStates(initialFaces, solution), [initialFaces, solution])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [animAngle, setAnimAngle] = useState(0)
  const [animMove, setAnimMove] = useState(null)
  const animRef = useRef(null)
  const playRef = useRef(false)

  // Anima um passo: mostra estado anterior + rotação animada, depois muda pro próximo estado
  const animateStep = useCallback((toStep) => {
    if (toStep < 1 || toStep > moves.length) { setStep(toStep); return }
    const notation = moves[toStep - 1]
    const base = notation[0]
    const targetAngle = getRotationAngle(notation) * MOVE_AXIS[base].dir
    setAnimMove({ base, targetAngle })
    setAnimAngle(0)
    setAnimating(true)
    setStep(toStep - 1) // mostra estado anterior durante animação

    let start = null
    const duration = 400
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setAnimAngle(targetAngle * eased)
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setAnimating(false)
        setAnimMove(null)
        setAnimAngle(0)
        setStep(toStep)
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }, [moves])

  useEffect(() => { return () => cancelAnimationFrame(animRef.current) }, [])

  // Auto-play
  useEffect(() => {
    playRef.current = playing
  }, [playing])

  useEffect(() => {
    if (!playing || animating) return
    if (step >= moves.length) { setPlaying(false); return }
    const t = setTimeout(() => {
      if (playRef.current) animateStep(step + 1)
    }, 200)
    return () => clearTimeout(t)
  }, [playing, step, animating, animateStep, moves.length])

  const goTo = (s) => { setPlaying(false); cancelAnimationFrame(animRef.current); setAnimating(false); setAnimMove(null); setStep(s) }
  const stepForward = () => { if (!animating && step < moves.length) animateStep(step + 1) }
  const stepBack = () => { if (!animating && step > 0) goTo(step - 1) }

  const displayFaces = states[step]
  const currentMove = step > 0 && !animating ? moves[step - 1] : null

  // Câmera
  const camFace = animMove ? animMove.base : (currentMove ? currentMove[0] : 'default')
  const [camX, camY] = CAM_ANGLES[camFace] || CAM_ANGLES.default

  // Eixo de rotação da animação
  const axisCSS = animMove ? `rotate${MOVE_AXIS[animMove.base].axis}(${animAngle}deg)` : ''

  return (
    <div className="mt-6 w-full max-w-lg">
      <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5">
        <div className="text-center mb-3">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Solução</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{moves.length} movimentos</p>
        </div>

        {/* Cubo 3D */}
        <div className="flex justify-center mb-4">
          <div style={{ width: 220, height: 220, perspective: 600 }}>
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${camX}deg) rotateY(${camY}deg)`,
              transition: animating ? 'none' : 'transform 0.6s cubic-bezier(.4,0,.2,1)',
            }}>
              {['U','D','F','B','R','L'].map(face =>
                displayFaces[face].map((color, idx) => {
                  const affected = animMove && isAffected(face, idx, animMove.base)
                  return (
                    <div key={`${face}${idx}`} style={{
                      position: 'absolute', width: S, height: S,
                      ...stickerPos(face, idx),
                      transformStyle: 'preserve-3d',
                    }}>
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundColor: COLOR_HEX[color] || '#1e293b',
                        borderRadius: 6,
                        border: '1px solid rgba(0,0,0,0.3)',
                        boxShadow: affected ? '0 0 12px rgba(34,211,238,0.4)' : 'none',
                        transform: affected ? axisCSS : undefined,
                        transition: affected ? 'none' : 'box-shadow 0.3s',
                      }} />
                    </div>
                  )
                })
              )}
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
          <button onClick={stepBack} disabled={step === 0 || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">◀</button>
          <button onClick={() => { if (playing) setPlaying(false); else { if (step >= moves.length) goTo(0); setPlaying(true) } }}
            disabled={animating}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all">
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={stepForward} disabled={step >= moves.length || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">▶</button>
          <button onClick={() => goTo(moves.length)} disabled={step >= moves.length || animating}
            className="w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm">⏭</button>
        </div>

        {/* Lista de movimentos */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-3 border-t border-white/8">
          {moves.map((m, i) => (
            <button key={i} onClick={() => goTo(i + 1)} disabled={animating}
              className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200
                ${i + 1 === step ? 'bg-cyan-500 text-black scale-110' : i + 1 < step ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}
              `}>{m}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
