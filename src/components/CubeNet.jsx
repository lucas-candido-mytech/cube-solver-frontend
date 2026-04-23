import { STEPS, COLOR_BG } from '../constants'

const POS = { U: 'col-start-2 row-start-1', L: 'col-start-1 row-start-2', F: 'col-start-2 row-start-2', R: 'col-start-3 row-start-2', B: 'col-start-4 row-start-2', D: 'col-start-2 row-start-3' }

export default function CubeNet({ stepIdx, faces, onGoToFace }) {
  const curFace = STEPS[stepIdx].face
  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-1 mt-2">
      {['U', 'L', 'F', 'R', 'B', 'D'].map(f => (
        <button key={f} onClick={() => onGoToFace(f)}
          className={`${POS[f]} grid grid-cols-3 grid-rows-3 gap-px w-12 h-12 rounded-md overflow-hidden transition-all duration-200 hover:scale-105
            ${f === curFace ? 'ring-2 ring-cyan-400 shadow-md shadow-cyan-500/20' : 'ring-1 ring-white/5'}
          `}>
          {faces[f].map((c, i) => <div key={i} className={`${COLOR_BG[c]} rounded-[1px]`} />)}
        </button>
      ))}
    </div>
  )
}
