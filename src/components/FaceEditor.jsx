import { useState } from 'react'
import { STEPS, COLORS, COLOR_HEX, COLOR_NAMES } from '../constants'
import './FaceEditor.css'

export default function FaceEditor({ stepIdx, faces, onUpdateFace }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [activeColor, setActiveColor] = useState(null)
  const face = STEPS[stepIdx].face
  const faceColors = faces[face]

  const selectCell = (i) => {
    if (activeColor) {
      const next = [...faceColors]; next[i] = activeColor
      onUpdateFace(face, next)
      setSelectedCell(null)
    } else {
      setSelectedCell(i)
    }
  }

  const pickColor = (c) => {
    const newColor = activeColor === c ? null : c
    if (newColor && selectedCell !== null && selectedCell !== 4) {
      const next = [...faceColors]; next[selectedCell] = newColor
      onUpdateFace(face, next)
      setSelectedCell(null)
      setActiveColor(null)
    } else {
      setActiveColor(newColor)
    }
  }

  return (
    <div className="edit-section">
      <div className="current-face">
        {faceColors.map((c, i) => {
          const isCenter = i === 4
          const isSel = i === selectedCell && !isCenter
          return (
            <div key={i}
              className={`sq color-${c}${isCenter ? ' center' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => !isCenter && selectCell(i)}
            >{isCenter && '★'}</div>
          )
        })}
      </div>
      <div className="color-picker">
        {COLORS.map(c => (
          <div key={c}
            className={`swatch${c === activeColor ? ' active-color' : ''}`}
            style={{ background: COLOR_HEX[c] }}
            onClick={() => pickColor(c)}
          ><span className="label">{COLOR_NAMES[c]}</span></div>
        ))}
      </div>
    </div>
  )
}
