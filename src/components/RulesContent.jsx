import './RulesContent.css'

export default function RulesContent() {
  return (
    <div className="rules-content">
      <section className="rules-content__block">
        <h3>Le principe</h3>
        <p>
          4 startups concurrentes sur le marché du mobilier scolaire — <strong>MOBISCO</strong>,{' '}
          <strong>LIGNEA</strong>, <strong>INCLUSIA</strong>, <strong>MODULAB</strong> — se disputent
          le marché sur <strong>5 manches</strong> (années N1 à N5) : lancement, croissance, puis
          trois années de maturité.
        </p>
      </section>

      <section className="rules-content__block">
        <h3>11 décisions</h3>
        <p>
          3 décisions fondatrices en manche 1, puis 1 décision stratégique et 1 décision tactique par
          manche de N2 à N5, chacune séparée par un événement de marché. Chaque décision propose 3
          options — A, B ou C. Délibérez au brouillon, puis annoncez votre réponse : l'animateur la
          saisit à l'écran.
        </p>
      </section>

      <section className="rules-content__block">
        <h3>3 indicateurs</h3>
        <ul>
          <li><strong>Part de marché</strong> — un camembert alimenté par le chiffre d'affaires de chaque entreprise.</li>
          <li><strong>Santé financière</strong> — jauge de 0 à 100, départ à 50.</li>
          <li><strong>Indicateur sociétal</strong> — jauge de 0 à 100, départ à 50.</li>
        </ul>
      </section>

      <section className="rules-content__block">
        <h3>Objectif</h3>
        <p>
          Obtenir le meilleur score en fin de partie : 50 % de la part de marché relative, 25 % de
          Santé financière, 25 % d'Indicateur sociétal. Il n'y a pas une seule bonne stratégie —
          plusieurs positionnements différents peuvent tous gagner.
        </p>
      </section>
    </div>
  )
}
