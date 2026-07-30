# CAHIER DES CHARGES — Diaporama interactif MARKET RUSH
**STRATÉJEUX — Brief technique pour développement (Claude Code)**
Version 2 — juillet 2026 · Source de vérité du contenu : `MarketRush_Dossier_v5.docx`

---

## 1. Objet

Application web autonome servant de support d'animation au jeu **Market Rush**, simulation stratégique de conquête de marché jouée en classe (BTS, BUT, licence, école de commerce).

L'enseignant anime la séance en projetant l'application devant 4 équipes. L'application porte **tout ce qui varie** dans la partie : contexte de l'année, taille du marché, événements, intitulés de décisions et options A/B/C, minuteurs, saisie des choix, calcul des résultats, affichage des conséquences, écran de suivi.

Le matériel physique (12 fiches services cartonnées, brouillon d'équipe A4) reste inchangé et hors périmètre.

**Livrable attendu : un package autonome, versionnable et hébergeable sur GitHub.** Pas d'artifact Claude.ai.

---

## 2. Principe du jeu

- 4 startups concurrentes sur le marché du mobilier scolaire : **MOBISCO, LIGNEA, INCLUSIA, MODULAB**.
- 5 manches (années N1 à N5) : lancement → croissance → maturité ×3.
- **11 décisions** : 3 décisions fondatrices en manche 1 (sans événement), puis 1 décision stratégique + 1 événement + 1 décision tactique par manche de N2 à N5.
- Chaque décision propose 3 options (A/B/C). Les équipes délibèrent au brouillon papier et rendent leur réponse oralement.
- **L'animateur clique la réponse de chaque équipe directement dans l'application.** L'application possède la grille de correction, calcule tous les effets et affiche les conséquences.
- 3 indicateurs : **Part de marché** (camembert, alimentée par le CA), **Santé financière** et **Indicateur sociétal** (jauges 0–100, départ à 50).

---

## 3. Ce que l'application doit savoir (données embarquées)

Tout le contenu de jeu est fourni dans le fichier **`content.json`** livré avec ce cahier des charges. Il contient :

| Contenu | Volume |
|---|---|
| Les 5 manches (accroche, année, phase, marché adressable, évolution) | 5 |
| Les 4 événements (titre, texte narratif, effet mécanique, chemin d'image) | 4 |
| Les 11 décisions (titre, notion pédagogique, type, jauge concernée) | 11 |
| Les options A/B/C avec libellé et description détaillée | 33 |
| **Grille de correction et phrases de conséquence** — pour chaque décision × chaque entreprise × chaque option : le verdict (`bon` / `moyen` / `mauvais`) et la phrase explicative | **132** |
| Barème d'impact CA par année, paramètres de jauges, formule de score | — |

Le code ne doit **jamais** contenir de texte de jeu en dur : tout se lit depuis `content.json`, pour que Kenza puisse corriger un texte sans toucher au code.

### Structure de `content.json` (extrait réel)

```json
"m4d2": {
  "id": "m4d2", "manche": 4,
  "titre": "Réponse réglementaire",
  "notion": "internalisation ou externalisation d'une mise en conformité",
  "type": "tactique",
  "jauge": "sante_financiere",
  "options": {
    "A": { "label": "A. Se mettre en conformité en interne",
           "description": "Mobiliser ses propres équipes. Démarche maîtrisée et crédible, exige la compétence et la disponibilité correspondantes." },
    "B": { "…": "…" }, "C": { "…": "…" }
  },
  "resolution": {
    "MOBISCO": {
      "A": { "verdict": "mauvais", "phrase": "Aucune compétence QSE et 6 mois pour recruter : la conformité arrive après l'échéance." },
      "B": { "verdict": "mauvais", "phrase": "Exclusion des appels d'offres au moment précis où SCOLEUROP libère ses volumes." },
      "C": { "verdict": "bon",     "phrase": "8 K€ clé en main chez le fournisseur : conforme à temps, marchés de SCOLEUROP récupérés." }
    },
    "LIGNEA": { "…": "…" }, "INCLUSIA": { "…": "…" }, "MODULAB": { "…": "…" }
  }
}
```

---

## 4. Moteur de calcul

À chaque décision validée, pour chacune des 4 entreprises :

1. Lire le verdict dans `resolution[entreprise][option choisie]`.
2. **Chiffre d'affaires** : `CA = CA × (1 + barème[manche][verdict] / 100)`.

   | Année | ✅ bon | ⚠️ moyen | ❌ mauvais |
   |---|---|---|---|
   | N1 | +5 % | 0 % | −5 % |
   | N2 | +12 % | +5 % | −6 % |
   | N3 | +8 % | +3 % | −8 % |
   | N4 | +5 % | +2 % | −9 % |
   | N5 | +3 % | +1 % | −10 % |

3. **Jauge concernée** (si `jauge` ≠ `part_de_marche`) : `+10` si bon, `0` si moyen, `−10` si mauvais. Bornée 0–100.
   *Chaque jauge est concernée par 4 décisions, donc le maximum atteignable est 90 : elle ne sature jamais.*
4. **Camembert** — recalculé par résidu, ce qui garantit un total toujours égal à 100 % :
   - `part(entreprise) = CA(entreprise) ÷ marché adressable de l'année`
   - `reste du marché = marché adressable − somme des 4 CA`
   - **Le reste du marché est affiché** dans le camembert, comme 5ᵉ part (gris neutre).
5. **Score** — calculé et **affiché en permanence**, pas seulement en fin de partie :
   - part relative = `CA ÷ somme des 4 CA × 100`
   - indice de part de marché = `part relative ÷ 25 × 50`, plafonné à 100
   - `Score = 50 % × indice + 25 % × Santé financière + 25 % × Indicateur sociétal`

Départ de partie : chaque entreprise à **400 K€** de CA (20 % du marché N1 de 2 000 K€), jauges à **50**.

---

## 5. Architecture des écrans (navigation linéaire)

Navigation **strictement linéaire** : boutons **Précédent** / **Suivant** + flèches clavier. Pas de sommaire, pas de saut arbitraire.

**Correction d'une erreur de saisie** : le bouton *Précédent* doit permettre de revenir sur l'**écran de saisie de la décision qui vient d'être jouée** et d'y modifier les choix. Toute modification recalcule intégralement l'état (CA, jauges, camembert, score). L'état est donc **recalculé à partir de l'historique des saisies**, jamais accumulé de manière destructive — c'est la condition technique qui rend la correction fiable.

### 5.1 Écrans d'ouverture
1. **Titre** — logo Market Rush + baseline, bouton *Démarrer la partie*.
2. **Rappel des règles** — principe, 5 manches, 11 décisions, les 3 indicateurs, objectif. Également rappelable à tout moment en cours de partie via une icône discrète, sans perdre l'état de la partie.

### 5.2 Ouverture de manche
Titre « Manche N — [phase] · année [N…] », accroche narrative en gros, marché adressable de l'année et son évolution.

### 5.3 Séquence de décision — **4 écrans distincts**

Cœur du découpage demandé. Chacune des 11 décisions suit exactement cette séquence :

| # | Écran | Contenu |
|---|---|---|
| **1** | **Présentation de la décision** | Intitulé en très gros. Les 3 options A/B/C en version détaillée (libellé + description complète). **Apparition séquentielle** des options (A, puis B, puis C) au clic ou en animation douce. Aucun minuteur visible. |
| **2** | **Réflexion** | Même contenu que l'écran 1, options toutes visibles, **mise en page identique** pour éviter tout effet de rupture — **le minuteur apparaît et se déclenche**. Contrôles discrets : pause, +1 min, reset. Alerte visuelle sur les 30 dernières secondes. |
| **3** | **Saisie** | Les 4 entreprises côte à côte. Pour chacune, 3 gros boutons A / B / C — **saisie exclusivement au clic**. Bouton *Valider les décisions* actif uniquement quand les 4 réponses sont saisies. |
| **4** | **Conséquences** | Pour chaque entreprise : l'option jouée, le pictogramme du verdict (✅ / ⚠️ / ❌) et **la phrase explicative issue de `content.json`**. Variation de CA et de jauge affichées. Écran à plus fort enjeu pédagogique : lisible, aéré, propice au commentaire de l'enseignant. |

**Durées de minuteur par défaut** : décision **stratégique → 10 min** · décision **tactique → 1 min**.
*(Les 3 décisions fondatrices de la manche 1 sont des décisions stratégiques → 10 min chacune.)*

### 5.4 Écran événement (manches 2 à 5 uniquement)
Placé entre la décision stratégique et la décision tactique de la manche.
- Titre de l'événement, **image d'illustration fournie par Kenza** (une par événement, dans `assets/evenements/`), texte narratif.
- L'**effet mécanique** est affiché dans un encart visuellement distinct, en bas.

### 5.5 Écran de suivi
Affiché en fin de manche, et accessible en un clic à tout moment :
- **Camembert** des parts de marché : 4 entreprises aux couleurs de marque + reste du marché en gris.
- Pour chaque entreprise : **2 jauges** — Santé financière et Indicateur sociétal (0–100) — et **le score courant**.
- Classement des 4 entreprises.

> On suit **le règlement, pas le mockup** : 2 jauges officielles, pas 3 barres. Le CA n'est pas une jauge, il est représenté par le camembert.

### 5.6 Écran final
Classement définitif après la manche 5, détail du calcul du score des 4 entreprises, rappel du message pédagogique (quatre stratégies différentes, toutes cohérentes, toutes gagnantes ; départage au brouillon en cas d'égalité).

---

## 6. Identité visuelle

### 6.1 Couleur par entreprise (charte existante, à respecter strictement)

| Entreprise | Couleur | Hex |
|---|---|---|
| MOBISCO | Bleu | `#2454FF` |
| LIGNEA | Orange | `#FFA102` |
| INCLUSIA | Rose / magenta | `#E474B1` |
| MODULAB | Corail | `#F6664B` |
| *Reste du marché* | Gris neutre | `#8C9BB5` |

Ces couleurs sont celles du logo Market Rush et des fiches produits : elles identifient les entreprises partout (camembert, cartes de saisie, cartes de conséquence, classement).

### 6.2 Palette d'habillage

| Rôle | Hex |
|---|---|
| Fond général (sombre) | `#010D1F` |
| Fond des panneaux / cartes | `#04152C` |
| Texte principal | `#DFE7F2` |
| Accent minuteur / urgence | `#FFAB16` |
| Crème (texte sur aplat bleu) | `#FFF8E7` |

Typographie : sans-serif arrondie et grasse pour les titres, dans l'esprit du logo (**Baloo 2**, **Fredoka** ou **Poppins ExtraBold**), avec une sans-serif neutre très lisible pour les textes longs.

### 6.3 Direction artistique
**Le mockup fourni est une inspiration, pas une maquette à suivre.** L'exigence est un rendu **plus lisible et moins chargé** :
- un seul propos par écran — c'est le sens du découpage en 4 temps ;
- très gros corps de texte : l'écran est lu depuis le fond de la salle ;
- beaucoup d'air, peu de bordures, pas d'empilement d'encarts ;
- la couleur sert à identifier les entreprises, pas à décorer ;
- animations sobres et rapides (apparition des options, variation des jauges).

---

## 7. Exigences techniques

- **Application web statique**, sans backend. Stack conseillée : **React + Vite**, build statique déployable sur **GitHub Pages**.
- **Persistance obligatoire** : l'état de la partie doit **survivre à un rafraîchissement de page**. Sauvegarde automatique dans `localStorage` à chaque changement d'écran et à chaque saisie (aucune restriction ici puisqu'on ne livre pas d'artifact Claude.ai).
  - Sauvegarder l'**historique des saisies** (manche, décision, choix des 4 entreprises) + l'écran courant, et **recalculer** CA / jauges / scores à partir de cet historique au chargement.
  - Prévoir un bouton *Nouvelle partie* avec confirmation, qui réinitialise le stockage.
- **Fonctionnement hors ligne** après chargement : aucune dépendance réseau en cours de séance, polices et images embarquées dans le dépôt.
- **Mode plein écran**, cible d'affichage 16:9 (vidéoprojecteur / TBI). Pas de contrainte mobile forte.
- Navigation clavier : ← / → précédent-suivant, `F` plein écran, `Espace` pause du minuteur.

### Arborescence de dépôt suggérée

```
market-rush/
├── README.md                  ← installation, lancement, déploiement, comment modifier les textes
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── assets/
│       ├── logo/
│       └── evenements/        ← les 4 images fournies par Kenza
└── src/
    ├── data/content.json      ← TOUT le contenu de jeu (fourni)
    ├── engine/                ← calcul CA, jauges, camembert, score, persistance
    ├── screens/               ← Titre, Règles, Manche, Décision(1-4), Événement, Suivi, Final
    ├── components/            ← Camembert, Jauge, Minuteur, CarteEntreprise, Navigation
    └── styles/tokens.css      ← couleurs et typographie
```

---

## 8. Éléments à fournir par Kenza

1. **4 images d'événement** (une par manche N2 à N5) → `public/assets/evenements/`. Noms attendus, déjà référencés dans `content.json` :
   `n2-scoleurop.png` · `n3-gel-dotations.png` · `n4-economie-circulaire.png` · `n5-scoleurop-retrait.png`
2. Le **logo Market Rush** en PNG détouré ou SVG.
3. Confirmation de la police de titre retenue.

---

## 9. Récapitulatif des arbitrages actés

| Sujet | Décision |
|---|---|
| Saisie des réponses | Au clic, par l'animateur, directement dans le diaporama |
| Grille de correction | Embarquée dans l'application (132 phrases + verdicts) |
| Mode coulisses | **Aucun** — un seul flux, tout se passe à l'écran projeté |
| Navigation | Linéaire, avec retour possible sur la décision précédente pour corriger |
| Persistance | Obligatoire (`localStorage`), survie au rafraîchissement |
| Reste du marché | Visible dans le camembert |
| Indicateurs | 2 jauges officielles (règlement), pas les 3 barres du mockup |
| Score | Visible en permanence |
| Minuteurs | 10 min (stratégique) · 1 min (tactique) |
| Écran de règles | Oui, en ouverture et rappelable en cours de partie |
| Séquence de décision | 4 écrans : présentation → réflexion + minuteur → saisie → conséquences |
| Mockup | Inspiration seulement ; viser plus lisible et moins chargé |
| Livraison | Package autonome compatible GitHub, pas d'artifact |

---

*Document de travail Stratéjeux — à faire évoluer avec Claude Code au fil du développement.*
