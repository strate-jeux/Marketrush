import Navigation from '../components/Navigation'
import './EventScreen.css'

export default function EventScreen({ manche, onPrev, onNext }) {
  const evt = manche.evenement
  return (
    <div className="screen event-screen">
      <div className="event-screen__eyebrow">Événement · Manche {manche.numero}</div>
      <h1 className="event-screen__title">{evt.titre}</h1>
      {evt.sous_titre && <p className="event-screen__sous-titre">{evt.sous_titre}</p>}
      <div className="event-screen__body">
        <img className="event-screen__image" src={`${import.meta.env.BASE_URL}${evt.image}`} alt={evt.titre} />
        <p className="event-screen__texte">{evt.texte}</p>
      </div>
      <div className="event-screen__effet">
        <span className="event-screen__effet-label">Effet mécanique</span>
        <p>{evt.effet_mecanique}</p>
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
