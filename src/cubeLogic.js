// Cada face é um array de 9 posições (0-8):
// 0 1 2
// 3 4 5
// 6 7 8

function rotateFaceCW(face) {
  const f = [...face]
  return [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]]
}

function rotateFaceCCW(face) {
  const f = [...face]
  return [f[2], f[5], f[8], f[1], f[4], f[7], f[0], f[3], f[6]]
}

function cloneFaces(faces) {
  const c = {}
  for (const k in faces) c[k] = [...faces[k]]
  return c
}

// Aplica um movimento CW na face e cicla as bordas adjacentes
const EDGE_CYCLES = {
  U: [
    ['F', [0,1,2], 'R', [0,1,2], 'B', [0,1,2], 'L', [0,1,2]],
  ],
  D: [
    ['F', [6,7,8], 'L', [6,7,8], 'B', [6,7,8], 'R', [6,7,8]],
  ],
  R: [
    ['F', [2,5,8], 'U', [2,5,8], 'B', [6,3,0], 'D', [2,5,8]],
  ],
  L: [
    ['F', [0,3,6], 'D', [0,3,6], 'B', [8,5,2], 'U', [0,3,6]],
  ],
  F: [
    ['U', [6,7,8], 'R', [0,3,6], 'D', [2,1,0], 'L', [8,5,2]],
  ],
  B: [
    ['U', [2,1,0], 'L', [0,3,6], 'D', [6,7,8], 'R', [8,5,2]],
  ],
}

function applyCW(faces, move) {
  const s = cloneFaces(faces)
  s[move] = rotateFaceCW(s[move])
  for (const cycle of EDGE_CYCLES[move]) {
    const [f1, i1, f2, i2, f3, i3, f4, i4] = cycle
    const tmp = i4.map(i => s[f4][i])
    for (let j = 0; j < 3; j++) s[f4][i4[j]] = s[f3][i3[j]]
    for (let j = 0; j < 3; j++) s[f3][i3[j]] = s[f2][i2[j]]
    for (let j = 0; j < 3; j++) s[f2][i2[j]] = s[f1][i1[j]]
    for (let j = 0; j < 3; j++) s[f1][i1[j]] = tmp[j]
  }
  return s
}

export function applyMove(faces, notation) {
  const base = notation[0] // U, D, R, L, F, B
  if (notation.endsWith("'")) {
    // CCW = 3x CW
    return applyCW(applyCW(applyCW(faces, base), base), base)
  }
  if (notation.endsWith('2')) {
    return applyCW(applyCW(faces, base), base)
  }
  return applyCW(faces, base)
}

// Gera todos os estados intermediários
export function generateStates(initialFaces, solution) {
  const moves = solution.split(' ')
  const states = [cloneFaces(initialFaces)]
  let current = cloneFaces(initialFaces)
  for (const m of moves) {
    current = applyMove(current, m)
    states.push(current)
  }
  return states
}
