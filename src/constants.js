export const STEPS = [
  { face: 'U', title: 'Face de CIMA', color: 'Branca', hint: 'Segure o cubo com a face branca virada para cima.', rotation: 'rotateX(-35deg) rotateY(-30deg)', arrow: 'Incline o cubo para mostrar o topo' },
  { face: 'F', title: 'Face da FRENTE', color: 'Verde', hint: 'Aponte a câmera para a face da frente (verde no centro).', rotation: 'rotateX(0deg) rotateY(0deg)', arrow: 'Cubo de frente — face verde virada para você' },
  { face: 'R', title: 'Face DIREITA', color: 'Vermelha', hint: 'Gire o cubo 90° para a esquerda. A face vermelha fica de frente.', rotation: 'rotateX(0deg) rotateY(-90deg)', arrow: '↩️ Gire 90° para a esquerda' },
  { face: 'B', title: 'Face de TRÁS', color: 'Azul', hint: 'Gire mais 90° para a esquerda. A face azul fica de frente.', rotation: 'rotateX(0deg) rotateY(-180deg)', arrow: '↩️ Gire mais 90° para a esquerda' },
  { face: 'L', title: 'Face ESQUERDA', color: 'Laranja', hint: 'Gire mais 90° para a esquerda. A face laranja fica de frente.', rotation: 'rotateX(0deg) rotateY(-270deg)', arrow: '↩️ Gire mais 90° para a esquerda' },
  { face: 'D', title: 'Face de BAIXO', color: 'Amarela', hint: 'Incline o cubo para ver a face de baixo (amarela no centro).', rotation: 'rotateX(35deg) rotateY(-30deg)', arrow: 'Incline o cubo para mostrar a base' },
]

export const FACE_CENTER = { U: 'white', L: 'orange', F: 'green', R: 'red', B: 'blue', D: 'yellow' }
export const COLORS = ['white', 'red', 'green', 'yellow', 'orange', 'blue']
export const COLOR_HEX = { white: '#fff', red: '#f00', green: '#0a0', yellow: '#fd0', orange: '#f80', blue: '#04f' }
export const COLOR_NAMES = { white: 'Branco', red: 'Vermelho', green: 'Verde', yellow: 'Amarelo', orange: 'Laranja', blue: 'Azul' }
export const FACE_COLORS_3D = { U: '#ffffff', D: '#ffdd00', F: '#00aa00', B: '#0044ff', R: '#ff0000', L: '#ff8800' }
export const FACE_3D_MAP = { U: 'top', D: 'bottom', F: 'front', B: 'back', R: 'right', L: 'left' }

export function createEmptyFaces() {
  const faces = {}
  ;['U', 'D', 'F', 'B', 'R', 'L'].forEach(f => {
    faces[f] = Array(9).fill('empty')
    faces[f][4] = FACE_CENTER[f]
  })
  return faces
}

export function classifyColor(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0, s = max === 0 ? 0 : d / max, v = max
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  if (v > 0.65 && s < 0.25) return 'white'
  if (h >= 30 && h < 70 && s > 0.3) return 'yellow'
  if (h >= 10 && h < 30 && s > 0.3) return 'orange'
  if ((h < 10 || h >= 340) && s > 0.3) return 'red'
  if (h >= 80 && h < 170 && s > 0.2) return 'green'
  if (h >= 170 && h < 260 && s > 0.2) return 'blue'
  const dists = {
    white: (255 - r * 255) ** 2 + (255 - g * 255) ** 2 + (255 - b * 255) ** 2,
    red: (255 - r * 255) ** 2 + (g * 255) ** 2 + (b * 255) ** 2,
    orange: (255 - r * 255) ** 2 + (136 - g * 255) ** 2 + (b * 255) ** 2,
    yellow: (255 - r * 255) ** 2 + (221 - g * 255) ** 2 + (b * 255) ** 2,
    green: (r * 255) ** 2 + (170 - g * 255) ** 2 + (b * 255) ** 2,
    blue: (r * 255) ** 2 + (68 - g * 255) ** 2 + (255 - b * 255) ** 2,
  }
  return Object.entries(dists).sort((a, b) => a[1] - b[1])[0][0]
}
