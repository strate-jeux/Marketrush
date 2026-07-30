// Moteur de calcul Market Rush — CA, jauges, camembert, score.
// Toujours recalculé depuis l'historique des saisies (jamais accumulé), cf. cahier des charges §4 et §5.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** Liste ordonnée de tous les id de décision dans l'ordre de jeu. */
export function decisionOrder(content) {
  return content.manches.flatMap((m) => m.decisions)
}

/** État initial des 4 entreprises. */
function initialCompanies(content) {
  const companies = {}
  for (const e of content.entreprises) {
    companies[e.id] = {
      ca: content.parametres.ca_depart_kEUR,
      sante_financiere: content.parametres.jauges_depart,
      indicateur_societal: content.parametres.jauges_depart,
    }
  }
  return companies
}

/**
 * Rejoue tout l'historique des saisies et retourne l'état courant des 4 entreprises
 * ainsi que le détail des résultats de chaque décision jouée (verdicts, phrases, deltas).
 *
 * history: [{ decisionId, choices: { MOBISCO: 'A', LIGNEA: 'B', ... } }, ...]
 */
export function computeState(content, history) {
  const companies = initialCompanies(content)
  const resultsByDecision = {}

  for (const entry of history) {
    const decision = content.decisions[entry.decisionId]
    if (!decision) continue
    const bareme = content.bareme_ca[String(decision.manche)]
    const results = {}

    for (const company of content.entreprises) {
      const id = company.id
      const choice = entry.choices[id]
      const resolution = decision.resolution[id]?.[choice]
      if (!resolution) continue

      const caBefore = companies[id].ca
      const caPct = bareme[resolution.verdict]
      const caAfter = caBefore * (1 + caPct / 100)

      let jaugeBefore = null
      let jaugeAfter = null
      if (decision.jauge !== 'part_de_marche') {
        jaugeBefore = companies[id][decision.jauge]
        const delta = resolution.verdict === 'bon' ? content.parametres.delta_jauge
          : resolution.verdict === 'mauvais' ? -content.parametres.delta_jauge
          : 0
        jaugeAfter = clamp(jaugeBefore + delta, content.parametres.jauge_min, content.parametres.jauge_max)
        companies[id][decision.jauge] = jaugeAfter
      }

      companies[id].ca = caAfter

      results[id] = {
        choice,
        verdict: resolution.verdict,
        phrase: resolution.phrase,
        caBefore,
        caAfter,
        caPct,
        jauge: decision.jauge,
        jaugeBefore,
        jaugeAfter,
      }
    }

    resultsByDecision[entry.decisionId] = results
  }

  return { companies, resultsByDecision }
}

/**
 * Camembert des parts de marché pour une taille de marché adressable donnée (année courante).
 * Le reste du marché est calculé par résidu, garantissant un total toujours égal à 100 %.
 */
export function computeCamembert(content, companies, marcheKEUR) {
  const parts = content.entreprises.map((e) => ({
    id: e.id,
    label: e.nom,
    couleur: e.couleur,
    ca: companies[e.id].ca,
  }))

  const sommeCA = parts.reduce((sum, p) => sum + p.ca, 0)
  const resteKEUR = Math.max(0, marcheKEUR - sommeCA)

  const total = marcheKEUR > 0 ? marcheKEUR : sommeCA || 1

  return {
    parts: parts.map((p) => ({ ...p, pct: (p.ca / total) * 100 })),
    reste: {
      id: 'RESTE',
      label: content.reste_du_marche.libelle,
      couleur: content.reste_du_marche.couleur,
      ca: resteKEUR,
      pct: (resteKEUR / total) * 100,
    },
  }
}

/** Score courant d'une entreprise selon la formule du règlement (§4). */
export function computeScores(content, companies) {
  const sommeCA = content.entreprises.reduce((sum, e) => sum + companies[e.id].ca, 0)
  const scores = {}

  for (const e of content.entreprises) {
    const c = companies[e.id]
    const partRelative = sommeCA > 0 ? (c.ca / sommeCA) * 100 : 0
    const indice = clamp((partRelative / 25) * 50, 0, 100)
    const score = 0.5 * indice + 0.25 * c.sante_financiere + 0.25 * c.indicateur_societal
    scores[e.id] = { score, partRelative, indice }
  }

  return scores
}

/** Classement des entreprises trié par score décroissant. */
export function ranking(content, companies) {
  const scores = computeScores(content, companies)
  return [...content.entreprises]
    .map((e) => ({ ...e, ...scores[e.id], ca: companies[e.id].ca, jauges: companies[e.id] }))
    .sort((a, b) => b.score - a.score)
}

/** Construit la séquence linéaire complète des écrans à partir du contenu. */
export function buildScreenSequence(content) {
  const seq = [{ type: 'titre' }, { type: 'regles' }]

  content.manches.forEach((manche, mIdx) => {
    seq.push({ type: 'manche-ouverture', manche: manche.numero })

    manche.decisions.forEach((decisionId, dIdx) => {
      seq.push({ type: 'decision-presentation', manche: manche.numero, decisionId })
      seq.push({ type: 'decision-reflexion', manche: manche.numero, decisionId })
      seq.push({ type: 'decision-saisie', manche: manche.numero, decisionId })
      seq.push({ type: 'decision-consequences', manche: manche.numero, decisionId })

      // L'événement se place entre la décision stratégique et la décision tactique.
      const isFirstOfTwo = manche.evenement && dIdx === 0 && manche.decisions.length > 1
      if (isFirstOfTwo) {
        seq.push({ type: 'evenement', manche: manche.numero })
      }
    })

    seq.push({ type: 'suivi', manche: manche.numero })
  })

  seq.push({ type: 'final' })

  return seq
}
