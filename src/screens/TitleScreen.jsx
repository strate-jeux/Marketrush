import Logo from '../components/Logo'
import { IDENTITE } from '../data/index.js'
import './TitleScreen.css'

export default function TitleScreen({ onStart }) {
  return (
    <div className="screen title-screen">
      <div className="title-screen__center">
        <Logo size="lg" />
        <p className="title-screen__baseline">{IDENTITE.baseline}</p>
        <button type="button" className="title-screen__cta" onClick={onStart}>
          Démarrer la partie
        </button>
      </div>
      <p className="title-screen__editeur">{IDENTITE.editeur}</p>
    </div>
  )
}
