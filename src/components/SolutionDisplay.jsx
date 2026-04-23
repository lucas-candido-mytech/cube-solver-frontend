import { useState } from 'react'

const MOVE_NAMES = { U: 'Cima', D: 'Baixo', F: 'Frente', B: 'Trás', R: 'Direita', L: 'Esquerda' }
const MOVE_COLORS = { U: 'bg-white/20', D: 'bg-yellow-500/20', F: 'bg-green-500/20', B: 'bg-blue-500/20', R: 'bg-red-500/20', L: 'bg-orange-500/20' }

function describeMove(m) {
  const face = MOVE_NAMES[m[0]] || m[0]
  if (m.endsWith("'")) return `${face} · 90° anti-horário ↺`
  if (m.endsWith('2')) return `${face} · 180° ↻↻`
  return `${face} · 90° horário ↻`
}

export default function SolutionDisplay({ solution }) {
  const moves = solution.split(' ')
  const [current, setCurrent] = useState(0)

  return (
    <div className="mt-6 w-full max-w-md animate-in">
      <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5">
        <div className="text-center mb-4">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Solução encontrada</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{moves.length} movimentos</p>
        </div>

        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
          {moves.map((m, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                ${i === current ? 'bg-cyan-500/15 border border-cyan-500/30 shadow-sm' : i < current ? 'opacity-40' : 'bg-white/3 hover:bg-white/6 border border-transparent'}
              `}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                ${i === current ? 'bg-cyan-400 text-black' : i < current ? 'bg-emerald-500 text-black' : 'bg-white/8 text-white/50'}
              `}>{i + 1}</span>
              <span className={`px-2 py-0.5 rounded-md text-base font-bold ${MOVE_COLORS[m[0]] || 'bg-white/10'}`}>{m}</span>
              <span className="text-xs text-white/50">{describeMove(m)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/8 text-center">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Notação completa</span>
          <p className="text-sm font-semibold text-emerald-400 tracking-widest mt-1">{solution}</p>
        </div>
      </div>
    </div>
  )
}
