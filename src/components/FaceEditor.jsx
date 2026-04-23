import { useState } from 'react'
import { STEPS, COLORS, COLOR_HEX, COLOR_NAMES, COLOR_BG } from '../constants'

export default function FaceEditor({ stepIdx, faces, onUpdateFace }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [activeColor, setActiveColor] = useState(null)
  const face = STEPS[stepIdx].face
  const faceColors = faces[face]

  const selectCell = (i) => {
    if (activeColor) {
      const next = [...faceColors]; next[i] = activeColor
      onUpdateFace(face, next); setSelectedCell(null)
    } else setSelectedCell(i)
  }

  const pickColor = (c) => {
    const nc = activeColor === c ? null : c
    if (nc && selectedCell !== null && selectedCell !== 4) {
      const next = [...faceColors]; next[selectedCell] = nc
      onUpdateFace(face, next); setSelectedCell(null); setActiveColor(null)
    } else setActiveColor(nc)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-1.5">
        {faceColors.map((c, i) => {
          const isCenter = i === 4
          const isSel = i === selectedCell && !isCenter
          return (
            <button key={i} onClick={() => !isCenter && selectCell(i)}
              className={`w-14 h-14 rounded-xl transition-all duration-200
                ${COLOR_BG[c]} ${isCenter ? 'opacity-80 cursor-default' : 'cursor-pointer hover:scale-105'}
                ${isSel ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'border border-white/15'}
              `}
            >{isCenter && <span className="text-black/30 text-lg">★</span>}</button>
          )
        })}
      </div>

      <div className="flex gap-2">
        {COLORS.map(c => (
          <button key={c} onClick={() => pickColor(c)}
            className={`group relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-115
              ${c === activeColor ? 'ring-2 ring-white scale-110 shadow-lg' : 'border-2 border-transparent hover:border-white/40'}
            `} style={{ background: COLOR_HEX[c] }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {COLOR_NAMES[c]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
