const STORAGE_KEY = 'market-rush-state-v1'

export function saveGame({ history, screenIndex, fingerprint }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ history, screenIndex, fingerprint }))
  } catch (err) {
    console.warn('Impossible de sauvegarder la partie :', err)
  }
}

/**
 * `fingerprint` identifie la forme de la partie qui a produit la sauvegarde
 * (version des données + séquence d'écrans). Une sauvegarde faite sous une
 * autre forme ne veut plus rien dire — un `screenIndex` pointait vers une
 * décision de la manche 2 peut, après une mise à jour de l'app, pointer vers
 * un tout autre écran. Mieux vaut repartir à zéro qu'afficher un écran
 * incohérent : toute sauvegarde dont l'empreinte ne correspond pas est
 * silencieusement ignorée.
 */
export function loadGame(fingerprint) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.history) || typeof parsed.screenIndex !== 'number') return null
    if (parsed.fingerprint !== fingerprint) return null
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
