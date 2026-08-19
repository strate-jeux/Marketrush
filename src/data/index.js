// Accès aux données de jeu.
//
// `marketrush_data_v7.json` est la source de vérité : il est importé tel quel et
// n'est jamais transformé ici. Ce module se contente de construire des index
// d'accès — le fichier livre `resolution` à plat, et les manches en deux volets
// (narratif dans `manches`, chiffré dans `marche.manches`) — puis de porter les
// deux constantes d'habillage que le fichier v7.1 ne fournit pas (arbitrage Lot 0).

import raw from './marketrush_data_v7.json' with { type: 'json' }

/* ------------------------------------------------------------------ *
 * Constantes d'habillage absentes du fichier de données v7.1
 * ------------------------------------------------------------------ */

/** Le fichier v7.1 ne porte plus de chemin d'image : rattachement par clé de manche. */
export const EVENEMENT_IMAGES = {
  N2: 'assets/evenements/n2-scoleurop.png',
  N3: 'assets/evenements/n3-gel-dotations.png',
  N4: 'assets/evenements/n4-economie-circulaire.png',
  N5: 'assets/evenements/n5-scoleurop-retrait.png',
}

/** Segment résiduel du camembert — habillage, pas donnée de jeu. */
export const RESTE_DU_MARCHE = {
  id: 'RESTE',
  libelle: 'Reste du marché',
  couleur: '#8C9BB5',
}

/** Signature de marque : `meta.baseline` et `meta.editeur` de la v5 ne sont plus portés par v7.1. */
export const IDENTITE = {
  baseline: 'La course à la part de marché',
  editeur: 'Stratéjeux',
}

/* ------------------------------------------------------------------ *
 * Construction des index
 * ------------------------------------------------------------------ */

/**
 * Indexe un fichier de données v7.1 sans le transformer.
 * Le moteur et les écrans reçoivent le résultat ; `raw` reste accessible tel quel.
 */
export function buildDataset(source) {
  const resolutionIndex = {}
  for (const r of source.resolution) {
    if (!resolutionIndex[r.entreprise]) resolutionIndex[r.entreprise] = {}
    if (!resolutionIndex[r.entreprise][r.decision]) resolutionIndex[r.entreprise][r.decision] = {}
    resolutionIndex[r.entreprise][r.decision][r.option] = r
  }

  return {
    /** Le fichier v7.1 tel quel. */
    raw: source,

    /** Entreprises : livrées en objet, dérivées ici en liste ordonnée portant leur `id`. */
    entreprises: Object.entries(source.entreprises).map(([id, e]) => ({ id, ...e })),

    /** Décisions par identifiant (`positionnement_marque`, `outil_production`, …). */
    decisionsById: Object.fromEntries(source.decisions.map((d) => [d.id, d])),

    /** Ordre de jeu complet des identifiants de décision, manche après manche. */
    decisionOrder: source.manches.flatMap((m) => m.decisions),

    /** Volet narratif des manches, par clé (`N1` … `N5`). */
    manchesByKey: Object.fromEntries(source.manches.map((m) => [m.manche, m])),

    /** Volet chiffré des manches (marché, évolution, coefficients de CA), par clé. */
    marcheByManche: Object.fromEntries(source.marche.manches.map((m) => [m.manche, m])),

    /** Résolution d'un triplet (entreprise, décision, option). */
    getResolution(entrepriseId, decisionId, option) {
      return resolutionIndex[entrepriseId]?.[decisionId]?.[option]
    },
  }
}

const dataset = buildDataset(raw)

export default dataset
