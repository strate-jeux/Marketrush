# Market Rush — diaporama interactif

Application web autonome servant de support d'animation au jeu **Market Rush**
(Stratéjeux). Voir `Cahier des charges MarketRush v2.md` pour le brief complet.

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Ouvre `http://localhost:5173`.

## Construire le package statique

```bash
npm run build
```

Génère le dossier `dist/`, déployable tel quel sur n'importe quel hébergeur
statique (aucun backend requis).

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` publie automatiquement `dist/` sur
GitHub Pages à chaque push sur `main`. Il suffit d'activer GitHub Pages sur la
source **GitHub Actions** dans les paramètres du dépôt (Settings → Pages →
Build and deployment → Source : GitHub Actions).

## Modifier les textes du jeu

**Tout le contenu de jeu se trouve dans `src/data/content.json`** : accroches
de manche, événements, décisions, options A/B/C, grille de correction (verdicts
et phrases de conséquence), barème de chiffre d'affaires, paramètres de
départ. Le code ne contient aucun texte de jeu en dur — modifier une phrase
dans `content.json` suffit, il n'y a rien à toucher dans les fichiers `.jsx`.

Structure d'une décision dans `content.json` :

```json
"m4d2": {
  "titre": "Réponse réglementaire",
  "type": "tactique",
  "jauge": "sante_financiere",
  "options": { "A": { "label": "...", "description": "..." }, "B": {...}, "C": {...} },
  "resolution": {
    "MOBISCO": {
      "A": { "verdict": "mauvais", "phrase": "..." },
      "B": {...}, "C": {...}
    },
    "LIGNEA": {...}, "INCLUSIA": {...}, "MODULAB": {...}
  }
}
```

`verdict` doit être `"bon"`, `"moyen"` ou `"mauvais"` — ce sont ces valeurs qui
pilotent le calcul du chiffre d'affaires et des jauges (barème dans
`parametres.bareme_ca` du même fichier).

## Remplacer les images et le logo

- **Images d'événement** : `public/assets/evenements/`, aux noms référencés
  dans `content.json` (`n2-scoleurop.png`, etc.). Remplacer le fichier suffit.
- **Logo** : le logo actuel (`src/components/Logo.jsx`) est un texte stylisé
  provisoire en attendant le fichier définitif. Pour le remplacer par une
  image : déposer le fichier dans `public/assets/logo/` puis remplacer le
  contenu de `Logo.jsx` par une balise `<img>` pointant vers ce fichier.

## Comment jouer une séance

1. Ouvrir l'application en plein écran (bouton ⛶ ou touche `F`) sur le
   vidéoprojecteur.
2. Écran titre → *Démarrer la partie*, puis rappel des règles.
3. Chaque manche s'ouvre sur son accroche et son marché adressable.
4. Pour chaque décision : présentation des options (clic pour les révéler une
   à une), puis réflexion avec minuteur, puis saisie au clic des réponses des
   4 équipes, puis conséquences.
5. Un événement de marché s'intercale entre la décision stratégique et la
   décision tactique de chaque manche (à partir de N2).
6. L'écran de suivi (camembert, jauges, score) est accessible à tout moment
   via l'icône 📊 en haut à droite, comme le rappel des règles via 📖.
7. **Correction d'une saisie** : le bouton *Précédent* permet de revenir sur
   l'écran de saisie qui vient d'être joué et de modifier les réponses. Toute
   modification recalcule intégralement l'état de la partie.
8. La partie est sauvegardée automatiquement (`localStorage`) : un
   rafraîchissement de page ne fait pas perdre la progression. Le bouton
   *Nouvelle partie* (écran final) réinitialise la sauvegarde après
   confirmation.

## Raccourcis clavier

| Touche | Action |
|---|---|
| `→` | Écran suivant |
| `←` | Écran précédent |
| `F` | Plein écran |
| `Espace` | Pause / reprise du minuteur (quand un minuteur est affiché) |

## Architecture

```
market-rush/
├── public/assets/
│   ├── logo/
│   └── evenements/        ← les 4 images fournies
└── src/
    ├── data/content.json  ← tout le contenu de jeu
    ├── engine/             ← calcul CA / jauges / camembert / score, persistance
    ├── screens/            ← Titre, Règles, Manche, Décision(1-4), Événement, Suivi, Final
    ├── components/         ← Camembert, Jauge, Minuteur, cartes, navigation
    └── styles/tokens.css   ← couleurs et typographie
```

Stack : **React + Vite**, aucune dépendance réseau après chargement (polices
Fredoka et Public Sans embarquées via `@fontsource`, images dans le dépôt).
