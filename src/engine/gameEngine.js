// Moteur de calcul Market Rush — CA, jauges, camembert, score.
// Toujours recalculé depuis l'historique des saisies (jamais accumulé).
//
// Les fonctions prennent le `dataset` construit par src/data/index.js : elles ne
// dépendent d'aucun fichier de données particulier, ce qui les rend testables
// hors navigateur.

import { RESTE_DU_MARCHE } from '../data/index.js'

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** État initial des 4 entreprises. */
function initialCompanies(dataset) {
  const { jauges, marche } = dataset.raw
  const companies = {}
  for (const e of dataset.entreprises) {
    companies[e.id] = {
      ca: marche.ca_depart_par_entreprise_k_eur,
      sante_financiere: jauges.depart,
      indicateur_societal: jauges.depart,
    }
  }
  return companies
}

/**
 * Rejoue tout l'historique des saisies et retourne l'état courant des 4 entreprises
 * ainsi que le détail des résultats de chaque décision jouée (verdicts, phrases, deltas).
 *
 * history: [{ decisionId, choices: { MOBISCO: 'A', LIGNEA: 'B', … } }, …]
 */
export function computeState(dataset, history) {
  const { jauges } = dataset.raw
  const [jaugeMin, jaugeMax] = jauges.bornes
  const companies = initialCompanies(dataset)
  const resultsByDecision = {}

  for (const entry of history) {
    const decision = dataset.decisionsById[entry.decisionId]
    if (!decision) continue
    const coefs = dataset.marcheByManche[decision.manche].coef_ca
    const results = {}

    for (const company of dataset.entreprises) {
      const id = company.id
      const choice = entry.choices[id]
      const resolution = dataset.getResolution(id, entry.decisionId, choice)
      if (!resolution) continue

      // Les coefficients v7.1 sont des fractions (0,12) et se composent, ils ne s'additionnent pas.
      const caBefore = companies[id].ca
      const coef = coefs[resolution.verdict]
      const caAfter = caBefore * (1 + coef)

      let jaugeBefore = null
      let jaugeAfter = null
      if (decision.jauge !== 'part_de_marche') {
        jaugeBefore = companies[id][decision.jauge]
        const delta = resolution.verdict === 'bon' ? jauges.pas
          : resolution.verdict === 'mauvais' ? -jauges.pas
          : 0
        jaugeAfter = clamp(jaugeBefore + delta, jaugeMin, jaugeMax)
        companies[id][decision.jauge] = jaugeAfter
      }

      companies[id].ca = caAfter

      results[id] = {
        choice,
        verdict: resolution.verdict,
        phrase: resolution.phrase,
        coutKEur: resolution.cout_k_eur,
        caBefore,
        caAfter,
        coef,
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
export function computeCamembert(dataset, companies, marcheKEUR) {
  const parts = dataset.entreprises.map((e) => ({
    id: e.id,
    label: e.id,
    couleur: e.couleur,
    ca: companies[e.id].ca,
  }))

  const sommeCA = parts.reduce((sum, p) => sum + p.ca, 0)
  const resteKEUR = Math.max(0, marcheKEUR - sommeCA)

  const total = marcheKEUR > 0 ? marcheKEUR : sommeCA || 1

  return {
    parts: parts.map((p) => ({ ...p, pct: (p.ca / total) * 100 })),
    reste: {
      id: RESTE_DU_MARCHE.id,
      label: RESTE_DU_MARCHE.libelle,
      couleur: RESTE_DU_MARCHE.couleur,
      ca: resteKEUR,
      pct: (resteKEUR / total) * 100,
    },
  }
}

/** Score courant d'une entreprise selon la formule du règlement. */
export function computeScores(dataset, companies) {
  const sommeCA = dataset.entreprises.reduce((sum, e) => sum + companies[e.id].ca, 0)
  const scores = {}

  for (const e of dataset.entreprises) {
    const c = companies[e.id]
    const partRelative = sommeCA > 0 ? (c.ca / sommeCA) * 100 : 0
    const indice = clamp((partRelative / 25) * 50, 0, 100)
    const score = 0.5 * indice + 0.25 * c.sante_financiere + 0.25 * c.indicateur_societal
    scores[e.id] = { score, partRelative, indice }
  }

  return scores
}

/** Classement des entreprises trié par score décroissant. */
export function ranking(dataset, companies) {
  const scores = computeScores(dataset, companies)
  return [...dataset.entreprises]
    .map((e) => ({ ...e, ...scores[e.id], ca: companies[e.id].ca, jauges: companies[e.id] }))
    .sort((a, b) => b.score - a.score)
}

/** Construit la séquence linéaire complète des écrans à partir du contenu. */
export function buildScreenSequence(dataset) {
  // L'ouverture est narrative : le rappel des règles reste accessible en cours
  // de partie par la superposition, il n'occupe plus les premiers écrans.
  const seq = [{ type: 'titre' }, { type: 'scenario' }, { type: 'comment-jouer' }]

  dataset.raw.manches.forEach((manche) => {
    seq.push({ type: 'manche-ouverture', manche: manche.manche })

    manche.decisions.forEach((decisionId, dIdx) => {
      seq.push({ type: 'decision-presentation', manche: manche.manche, decisionId })
      seq.push({ type: 'decision-reflexion', manche: manche.manche, decisionId })
      seq.push({ type: 'decision-saisie', manche: manche.manche, decisionId })
      seq.push({ type: 'decision-consequences', manche: manche.manche, decisionId })

      // L'événement se place entre la décision stratégique et la décision tactique.
      const isFirstOfTwo = manche.evenement && dIdx === 0 && manche.decisions.length > 1
      if (isFirstOfTwo) {
        seq.push({ type: 'evenement', manche: manche.manche })
      }
    })

    seq.push({ type: 'suivi', manche: manche.manche })
  })

  seq.push({ type: 'final' })

  return seq
}
