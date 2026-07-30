import Navigation from '../components/Navigation'
import './MancheOuvertureScreen.css'

export default function MancheOuvertureScreen({ manche, onPrev, onNext }) {
  return (
    <div className="screen manche-ouverture">
      <div className="manche-ouverture__eyebrow">
        Manche {manche.numero} — {manche.phase} · {manche.annee}
      </div>
      <p className="manche-ouverture__accroche">{manche.accroche}</p>
      <div className="manche-ouverture__marche">
        <span className="manche-ouverture__marche-value">{manche.marche_kEUR.toLocaleString('fr-FR')} K€</span>
        <span className="manche-ouverture__marche-label">
          marché adressable{manche.evolution ? ` · ${manche.evolution}` : ''}
        </span>
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
