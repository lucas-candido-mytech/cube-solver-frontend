import { STEPS } from '../constants'

export default function Stepper({ stepIdx, faces, onGoStep }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {STEPS.map((s, i) => {
        const done = !faces[s.face].includes('empty')
        return (
          <div key={i} className="flex items-center">
            {i > 0 && <div className="w-4 h-0.5 bg-white/10" />}
            <button onClick={() => onGoStep(i)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${i === stepIdx
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-black scale-110 shadow-lg shadow-cyan-500/30'
                  : done
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
                }`}
            >{i + 1}</button>
          </div>
        )
      })}
    </div>
  )
}
