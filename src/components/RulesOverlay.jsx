import RulesContent from './RulesContent'
import './RulesOverlay.css'

export default function RulesOverlay({ onClose }) {
  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Rappel des règles">
      <div className="rules-overlay__panel">
        <div className="rules-overlay__head">
          <h2>Rappel des règles</h2>
          <button type="button" className="rules-overlay__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <RulesContent />
      </div>
    </div>
  )
}
