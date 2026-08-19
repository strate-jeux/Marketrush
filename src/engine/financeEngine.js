// Moteur financier Market Rush — trésorerie, endettement, autonomie.
//
// La trésorerie n'entre jamais dans le score : elle rend visible qu'une entreprise
// peut gagner des parts de marché et se retrouver à sec.
//
// Équations (brief § 3.1) :
//   résultat       = CA × taux_de_marge − redevance + aides − charges_fixes − frais_financiers
//   trésorerie_fin = trésorerie_début + résultat − investissements_de_la_manche
//   autonomie_mois = trésorerie ÷ charges_fixes × 12
//
// Comme gameEngine, tout est recalculé depuis l'historique des saisies.

/* ------------------------------------------------------------------ *
 * Lecture des règles déclaratives du fichier de données
 * ------------------------------------------------------------------ */

/**
 * `modulations_marge[].effet` est une expression textuelle. On l'interprète en
 * une forme exploitable, en échouant bruyamment sur une forme inconnue : une
 * modulation silencieusement ignorée fausserait toutes les trajectoires.
 */
function parseEffet(effet) {
  let m = /^taux_marge\s*=\s*([\d.]+)$/.exec(effet)
  if (m) return { cible: 'taux_marge', mode: 'fixe', valeur: Number(m[1]) }

  m = /^taux_marge\s*([+-])=\s*([\d.]+)$/.exec(effet)
  if (m) return { cible: 'taux_marge', mode: 'delta', valeur: (m[1] === '-' ? -1 : 1) * Number(m[2]) }

  m = /^redevance\s*=\s*([\d.]+)\s*\*\s*max\(\s*0\s*,\s*CA\s*-\s*([\d.]+)\s*\)$/.exec(effet)
  if (m) return { cible: 'redevance', mode: 'seuil', taux: Number(m[1]), seuil: Number(m[2]) }

  throw new Error(`Effet de modulation non reconnu : "${effet}"`)
}

/** Rang d'une manche (`N1` → 0) pour comparer les `a_partir_de`. */
function buildMancheRank(dataset) {
  return Object.fromEntries(dataset.raw.manches.map((m, i) => [m.manche, i]))
}

/**
 * Une modulation est déclenchée si son option a été jouée.
 *
 * R1 — seul le bon choix encaisse le bénéfice : un déclencheur positif exige un
 * verdict `bon`. Les déclencheurs négatifs (`!=C`) sont des pénalités : ils se
 * déclenchent précisément parce que le bon choix n'a pas été fait, et ne sont
 * donc pas conditionnés au verdict.
 */
function modulationDeclenchee(dataset, modulation, companyId, choicesByDecision) {
  const [decisionId, option] = modulation.declencheur
  const joue = choicesByDecision[decisionId]
  if (!joue) return false

  if (option.startsWith('!=')) return joue !== option.slice(2)
  if (joue !== option) return false

  return dataset.getResolution(companyId, decisionId, joue)?.verdict === 'bon'
}

/**
 * R2 — un même investissement n'est décaissé qu'une fois.
 * `deja_paye` liste les couples « si (décision, option) alors (décision, option) gratuite ».
 * Le déclencheur n'est pas conditionné au verdict : payer pour un mauvais choix reste payer.
 */
function estDejaPaye(dataset, companyId, decisionId, option, choicesByDecision) {
  return dataset.raw.moteur_financier.deja_paye.some((regle) => {
    if (regle.entreprise !== companyId) return false
    if (regle.alors_gratuit[0] !== decisionId || regle.alors_gratuit[1] !== option) return false
    return choicesByDecision[regle.si[0]] === regle.si[1]
  })
}

/* ------------------------------------------------------------------ *
 * Calcul
 * ------------------------------------------------------------------ */

/**
 * Rejoue l'historique et retourne, par entreprise, la situation financière
 * après chaque manche entièrement jouée.
 *
 * history: [{ decisionId, choices: { MOBISCO: 'A', … } }, …]
 */
export function computeFinances(dataset, history) {
  const { constantes } = dataset.raw.moteur_financier
  const mancheRank = buildMancheRank(dataset)
  const modulations = dataset.raw.moteur_financier.modulations_marge
    .map((m) => ({ ...m, parsed: parseEffet(m.effet) }))

  // Choix saisis, par entreprise puis par décision.
  const choicesByCompany = {}
  for (const e of dataset.entreprises) choicesByCompany[e.id] = {}
  for (const entry of history) {
    for (const [companyId, option] of Object.entries(entry.choices)) {
      if (choicesByCompany[companyId]) choicesByCompany[companyId][entry.decisionId] = option
    }
  }

  const result = {}

  for (const company of dataset.entreprises) {
    const choices = choicesByCompany[company.id]
    const parManche = []

    let ca = dataset.raw.marche.ca_depart_par_entreprise_k_eur
    let tresorerie = company.tresorerie
    // Position d'endettement de clôture : elle porte les frais financiers de l'exercice suivant.
    let dette = 0
    let decouvert = 0

    for (const manche of dataset.raw.manches) {
      const coefs = dataset.marcheByManche[manche.manche].coef_ca

      // 1-3. Appliquer les verdicts de la manche au CA, puis le figer.
      let complete = true
      for (const decisionId of manche.decisions) {
        const option = choices[decisionId]
        const resolution = option && dataset.getResolution(company.id, decisionId, option)
        if (!resolution) { complete = false; break }
        ca *= 1 + coefs[resolution.verdict]
      }
      // Une manche partiellement saisie n'a pas de situation financière.
      if (!complete) break

      // 4. Modulations de marge acquises à cette manche.
      let tauxMarge = company.taux_marge_depart
      let redevance = 0
      for (const modulation of modulations) {
        if (modulation.entreprise !== company.id) continue
        if (mancheRank[manche.manche] < mancheRank[modulation.a_partir_de]) continue
        if (!modulationDeclenchee(dataset, modulation, company.id, choices)) continue

        const { parsed } = modulation
        if (parsed.cible === 'taux_marge') {
          if (parsed.mode === 'fixe') tauxMarge = parsed.valeur
          else tauxMarge += parsed.valeur
        } else {
          redevance += parsed.taux * Math.max(0, ca - parsed.seuil)
        }
      }

      // 5. Résultat. Les frais financiers sont assis sur la position d'ouverture
      //    de l'exercice, c'est-à-dire la clôture du précédent (brief § 3.2).
      const fraisFinanciers = constantes.taux_emprunt * dette + constantes.taux_decouvert * decouvert
      const resultat = ca * tauxMarge - redevance + company.aides - company.charges_fixes - fraisFinanciers

      // 6. Décaissement des investissements de la manche, R2 appliqué.
      let investissements = 0
      for (const decisionId of manche.decisions) {
        const option = choices[decisionId]
        if (estDejaPaye(dataset, company.id, decisionId, option, choices)) continue
        investissements += dataset.getResolution(company.id, decisionId, option).cout_k_eur
      }

      // 7. Trésorerie de clôture, puis position d'endettement (R4 → R5 → R6).
      tresorerie = tresorerie + resultat - investissements

      // R6 plafonne le découvert à 50 % du CA : au total, l'entreprise ne peut pas
      // se financer au-delà de sa capacité d'emprunt augmentée de ce plafond. Le solde
      // bute donc sur ce plancher. C'est la convention de position d'endettement du
      // brief § 3.2, celle qui reproduit les trajectoires du § 6.3 et les 28 médianes
      // de tolérance à l'erreur du § 6.4.
      const financementMax = company.capacite_emprunt + constantes.plafond_decouvert_pct_ca * ca
      tresorerie = Math.max(tresorerie, -financementMax)

      const besoin = Math.max(0, -tresorerie)
      dette = Math.min(besoin, company.capacite_emprunt)
      decouvert = besoin - dette

      parManche.push({
        manche: manche.manche,
        ca,
        tauxMarge,
        redevance,
        fraisFinanciers,
        resultat,
        investissements,
        tresorerie,
        dette,
        decouvert,
        autonomieMois: (tresorerie / company.charges_fixes) * 12,
      })
    }

    const dernier = parManche[parManche.length - 1]
    result[company.id] = {
      parManche,
      tresorerie: dernier ? dernier.tresorerie : company.tresorerie,
      dette: dernier ? dernier.dette : 0,
      decouvert: dernier ? dernier.decouvert : 0,
      autonomieMois: dernier
        ? dernier.autonomieMois
        : (company.tresorerie / company.charges_fixes) * 12,
    }
  }

  return result
}
