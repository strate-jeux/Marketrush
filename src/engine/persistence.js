const STORAGE_KEY = 'market-rush-state-v1'

export function saveGame({ history, screenIndex }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ history, screenIndex }))
  } catch (err) {
    console.warn('Impossible de sauvegarder la partie :', err)
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.history) || typeof parsed.screenIndex !== 'number') return null
    return parsed
  } catch (err) {
    console.warn('Impossible de charger la partie :', err)
    return null
  }
}

export function resetGame() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('Impossible de réinitialiser la partie :', err)
  }
}
