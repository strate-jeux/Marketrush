import './Navigation.css'

export default function Navigation({ onPrev, onNext, canPrev = true, canNext = true, nextLabel = 'Suivant' }) {
  return (
    <div className="nav-bar">
      <button
        type="button"
        className="nav-bar__btn nav-bar__btn--ghost"
        onClick={onPrev}
        disabled={!canPrev}
      >
        ← Précédent
      </button>
      <button
        type="button"
        className="nav-bar__btn nav-bar__btn--primary"
        onClick={onNext}
        disabled={!canNext}
      >
        {nextLabel} →
      </button>
    </div>
  )
}
