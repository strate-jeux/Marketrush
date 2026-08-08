// Moteur financier Market Rush — trésorerie, dette, découvert, runway.
// Recalculé depuis l'historique, comme gameEngine.js. N'entre jamais dans le score (cf. brief §2).

function initialFinances(content) {
  const finances = {}
  for (const e of content.entreprises) {
    finances[e.id] = {
      tresorerie: e.tresorerie_depart,
      dette: 0,
      decouvert: 0,
      paidKeys: new Set(),
    }
  }
  return finances
}

/** Taux de marge applicable pour une entreprise à une manche donnée, selon les modulations déclaratives. */
function tauxMarge(content, companyId, mancheNum, choicesById) {
  const company = content.entreprises.find((e) => e.id === companyId)
  let taux = company.taux_marge

  for (const rule of content.moteur_financier.modulations_marge) {
    if (rule.entreprise !== companyId) continue

    const isSinon = Boolean(rule.sinon_si)
    const cond = rule.si || rule.sinon_si
    const chosen = choicesById[cond.decision]
    const matches = isSinon ? chosen !== cond.option_differente_de : chosen === cond.option
    if (!matches) continue

    const inScope = 'a_partir_de' in rule ? mancheNum >= rule.a_partir_de
      : 'manche' in rule ? mancheNum === rule.manche
      : false
    if (!inScope) continue

    if ('taux' in rule) taux = rule.taux
    else if ('delta' in rule) taux += rule.delta
  }

  return taux
}

/** Redevance MODULAB : 9 % de la part de CA au-delà du seuil, si l'accord a été signé. */
function redevanceDue(content, companyId, mancheNum, ca, choicesById) {
  const r = content.moteur_financier.redevance
  if (!r || r.entreprise !== companyId) return 0
  const chosen = choicesById[r.si.decision]
  if (chosen !== r.si.option) return 0
  if (mancheNum < r.a_partir_de) return 0
  return r.taux * Math.max(0, ca - r.seuil_ca_kEUR)
}

/**
 * Rejoue l'historique et retourne, pour chaque entreprise, la trésorerie/dette/découvert
 * après chaque manche jouée, ainsi que le détail du dernier exercice calculé.
 */
export function computeFinances(content, history) {
  const { taux_interet_emprunt: txEmprunt, taux_interet_decouvert: txDecouvert, plafond_decouvert_pct_ca: plafondPct } = content.moteur_financier
  const investissements = content.moteur_financier.investissements

  const finances = initialFinances(content)
  const choicesById = {}
  for (const entry of history) {
    choicesById[entry.decisionId] = entry.choices
  }

  const byManche = {}
  for (const m of content.manches) byManche[m.numero] = []
  for (const entry of history) {
    const decision = content.decisions[entry.decisionId]
    if (decision) byManche[decision.manche]?.push(entry)
  }

  // CA par entreprise, recalculé manche par manche (nécessaire pour appliquer le plafond de découvert
  // et la redevance sur le CA de l'exercice, pas le CA final).
  const runningCa = {}
  for (const e of content.entreprises) runningCa[e.id] = content.parametres.ca_depart_kEUR

  const perMancheByCompany = {}
  for (const e of content.entreprises) perMancheByCompany[e.id] = []

  for (const manche of content.manches) {
    const decisionsThisManche = byManche[manche.numero] || []
    const fullyPlayed = decisionsThisManche.length === manche.decisions.length
      && manche.decisions.every((id) => choicesById[id])

    for (const e of content.entreprises) {
      const companyId = e.id

      for (const decisionId of manche.decisions) {
        const choice = choicesById[decisionId]?.[companyId]
        if (!choice) continue
        const decision = content.decisions[decisionId]
        const verdict = decision.resolution[companyId]?.[choice]?.verdict
        if (!verdict) continue
        const pct = content.bareme_ca[String(manche.numero)][verdict]
        runningCa[companyId] *= 1 + pct / 100
      }

      if (!fullyPlayed) continue

      const fin = finances[companyId]

      let investTotal = 0
      for (const decisionId of manche.decisions) {
        const choice = choicesById[decisionId][companyId]
        const items = investissements[companyId]?.[decisionId]?.[choice] || []
        for (const item of items) {
          if (!fin.paidKeys.has(item.cle)) {
            fin.paidKeys.add(item.cle)
            investTotal += item.montant
          }
        }
      }

      const decisionChoicesForCompany = {}
      for (const decisionId of Object.keys(choicesById)) {
        decisionChoicesForCompany[decisionId] = choicesById[decisionId][companyId]
      }

      const ca = runningCa[companyId]
      const taux = tauxMarge(content, companyId, manche.numero, decisionChoicesForCompany)
      const redevance = redevanceDue(content, companyId, manche.numero, ca, decisionChoicesForCompany)
      const fraisFinanciers = txEmprunt * fin.dette + txDecouvert * fin.decouvert
      const resultat = ca * taux + e.aides_annuelles - e.charges_fixes - fraisFinanciers - redevance

      const tresorerieBrute = fin.tresorerie + resultat - investTotal

      const besoin = Math.max(0, -tresorerieBrute)
      const emprunTire = Math.min(besoin, Math.max(0, e.capacite_emprunt - fin.dette))
      fin.dette += emprunTire
      const besoinRestant = besoin - emprunTire
      const plafondDecouvert = plafondPct * ca
      const decouvertTire = Math.min(besoinRestant, Math.max(0, plafondDecouvert - fin.decouvert))
      fin.decouvert += decouvertTire

      fin.tresorerie = tresorerieBrute + emprunTire + decouvertTire

      const runwayMois = e.charges_fixes > 0 ? (fin.tresorerie / e.charges_fixes) * 12 : null

      perMancheByCompany[companyId].push({
        manche: manche.numero,
        ca,
        resultat,
        investTotal,
        fraisFinanciers,
        redevance,
        tresorerie: fin.tresorerie,
        dette: fin.dette,
        decouvert: fin.decouvert,
        runwayMois,
      })
    }
  }

  const result = {}
  for (const e of content.entreprises) {
    const history = perMancheByCompany[e.id]
    const last = history[history.length - 1] || null
    result[e.id] = {
      tresorerie: last ? last.tresorerie : e.tresorerie_depart,
      dette: last ? last.dette : 0,
      decouvert: last ? last.decouvert : 0,
      runwayMois: last ? last.runwayMois : (e.tresorerie_depart / e.charges_fixes) * 12,
      parManche: history,
    }
  }

  return result
}
