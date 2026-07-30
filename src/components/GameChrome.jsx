import './GameChrome.css'

export default function GameChrome({ onShowRules, onShowSuivi, onToggleFullscreen }) {
  return (
    <div className="game-chrome">
      <button type="button" className="game-chrome__btn" onClick={onShowSuivi} aria-label="Voir le suivi" title="Suivi (part de marché, jauges, score)">
        📊
      </button>
      <button type="button" className="game-chrome__btn" onClick={onShowRules} aria-label="Rappel des règles" title="Rappel des règles">
        📖
      </button>
      <button type="button" className="game-chrome__btn" onClick={onToggleFullscreen} aria-label="Plein écran" title="Plein écran (F)">
        ⛶
      </button>
    </div>
  )
}
