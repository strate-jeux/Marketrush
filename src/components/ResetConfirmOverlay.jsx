import './ResetConfirmOverlay.css'

/**
 * Confirmation avant réinitialisation complète — accessible à tout moment
 * depuis GameChrome, pas seulement à l'écran final. Une action destructive
 * (perte de l'historique de la partie en cours) exige un geste délibéré.
 */
export default function ResetConfirmOverlay({ onConfirm, onCancel }) {
  return (
    <div className="reset-confirm-overlay" role="dialog" aria-modal="true" aria-label="Nouvelle partie">
      <div className="reset-confirm-overlay__panel">
        <p>Réinitialiser complètement la partie ?</p>
        <div className="reset-confirm-overlay__actions">
          <button type="button" className="reset-confirm-overlay__yes" onClick={onConfirm}>
            Oui, réinitialiser
          </button>
          <button type="button" className="reset-confirm-overlay__no" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
