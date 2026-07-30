import Logo from '../components/Logo'
import content from '../data/content.json'
import './TitleScreen.css'

export default function TitleScreen({ onStart }) {
  return (
    <div className="screen title-screen">
      <div className="title-screen__center">
        <Logo size="lg" />
        <p className="title-screen__baseline">{content.meta.baseline}</p>
        <button type="button" className="title-screen__cta" onClick={onStart}>
          Démarrer la partie
        </button>
      </div>
      <p className="title-screen__editeur">{content.meta.editeur}</p>
    </div>
  )
}
