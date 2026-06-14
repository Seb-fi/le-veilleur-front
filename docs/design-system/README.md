# Le Veilleur — Design System

> Système de design éditorial pour Le Veilleur, assistant de veille
> haut de gamme. Ton crème, contrastes doux, profondeur subtile,
> hiérarchie typographique élégante. Cible : Vue 3 + TypeScript.

---

## Promesse

Cet espace appartient à l'utilisateur. Le système IA doit rester
discret — il peut suggérer ou enrichir, mais il ne doit jamais
dominer visuellement.

Le DS est conçu pour traduire cette posture dans le code :

- **Tokens éditoriaux** (palette papier, typographie serif + mono)
- **Composants silencieux** (popovers, modals, badges, notes)
- **Composables Vue** pour les interactions clés (graphe, drag-drop,
  popover contextuel)
- **Pas de framework de design** (Tailwind, MUI…) — uniquement CSS
  natif + custom properties pour un contrôle total et zéro runtime.

---

## Arborescence

```
design-system/
├── README.md                  ← vous êtes ici
├── index.html                 ← catalogue de référence (à ouvrir)
│
├── tokens/                    ← variables CSS pures
│   ├── _index.css             ← import master
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   └── motion.css
│
├── base/                      ← reset + classes typographiques
│   ├── _index.css
│   ├── reset.css
│   ├── typography.css
│   └── layout.css
│
├── components/                ← CSS par composant
│   ├── _index.css
│   ├── button.css             ← .v-btn, .v-mode-toggle
│   ├── badge.css              ← .v-tag, .v-dot, .v-status
│   ├── note.css               ← .v-pinned, .v-note-inline, .v-whisper
│   ├── popover.css            ← .v-popover (+ picker)
│   ├── modal.css              ← .v-modal, .v-choice
│   ├── piste.css              ← .v-piste-*, .v-stream-item, .v-event-row
│   └── graph.css              ← .v-graph (mode mémoire mentale)
│
└── vue/                       ← Vue 3 + TS
    ├── types.ts               ← types métier (Piste, Article, Trace…)
    ├── composables/
    │   ├── useMemoryGraph.ts
    │   ├── usePopover.ts
    │   └── useArticleDnD.ts
    └── components/
        ├── ActionPopover.vue
        ├── MoveLinkModal.vue
        ├── MemGraph.vue
        ├── PisteCard.vue
        └── StreamItem.vue
```

---

## Setup dans une app Vue 3

### 1. Polices

Dans le `<head>` de l'app :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

### 2. CSS

Dans `main.ts` :

```ts
// 1. Tokens (variables CSS)
import "@veilleur/design-system/tokens/_index.css"
// 2. Base (reset, typo)
import "@veilleur/design-system/base/_index.css"
// 3. Components (à la carte)
import "@veilleur/design-system/components/_index.css"
```

L'ordre **doit** être respecté : les composants utilisent les
variables de tokens.

### 3. Composants Vue

Les composants Vue sont **du scaffolding documenté** — pensez-les
comme des points de départ canoniques, pas comme une bibliothèque
finie. Copiez ce dont vous avez besoin dans votre app et adaptez :

```vue
<script setup lang="ts">
import { useMemoryGraph } from "@veilleur/design-system/vue/composables/useMemoryGraph"
import { usePopover } from "@veilleur/design-system/vue/composables/usePopover"
import { useArticleDnD } from "@veilleur/design-system/vue/composables/useArticleDnD"
import MemGraph from "@veilleur/design-system/vue/components/MemGraph.vue"

// pistes / satellites / edges chargés depuis votre store Pinia
const graph   = useMemoryGraph({ pistes, satellitesByPiste, edges })
const popover = usePopover()
const dnd     = useArticleDnD({ resolveTargetAt, onDrop: openMoveLinkModal })
</script>

<template>
  <MemGraph :graph="graph" :dnd="dnd" :popover="popover" />
</template>
```

---

## Conventions

### Nommage CSS

Toutes les classes du DS sont préfixées **`v-`** (pour _Veilleur_).
Pas de conflit avec les conventions d'app type Tailwind ou UnoCSS.

- `.v-popover`              → bloc
- `.v-popover__head`        → élément
- `.v-popover--picker`      → modifier
- `.is-open`, `.is-pinned`  → états transitoires (pilotés par JS)

### Italique = sens

L'italique du Newsreader est réservé à :

- les **réflexions personnelles** (notes, citations)
- les **mots-clés métier** dans un titre (`<em>` dans `.v-piste-title`)
- les **marginalia** (étiquettes système silencieuses)

Jamais décoratif, jamais "stylé pour rien".

### Couleurs sémantiques

Quatre rôles, et c'est tout :

| Rôle           | Token              | Quand                                |
|----------------|--------------------|--------------------------------------|
| Encre/lecture  | `--color-ink*`     | Texte par défaut                     |
| Vous (indigo)  | `--color-indigo*`  | Tout ce que l'utilisateur crée       |
| Pin (amber)    | `--color-amber*`   | Notes épinglées · évènements         |
| Convergence    | `--color-moss*`    | Signaux convergents, en hausse       |
| Tension (rose) | `--color-rose*`    | Tensions actives, warnings           |

Pas de couleurs hors palette. Si vous avez besoin d'un état, dérivez
en oklch (préserve la luminance perceptive).

### Espacements

Échelle de 4px, mais le rythme reste éditorial — `--sp-6` (24px)
domine, `--sp-12` (48px) entre sections, `--sp-24` (96px) en fin de
page. Évitez les valeurs intermédiaires hors échelle.

### Typographie

Trois familles seulement :

| Famille            | Usage                                       |
|--------------------|---------------------------------------------|
| Newsreader (serif) | Titres, citations, corps long, italique     |
| IBM Plex Sans      | Boutons, contrôles, descriptions courtes    |
| IBM Plex Mono      | Eyebrows, meta, dates, labels système       |

Toute autre famille est interdite.

---

## Mode "Mémoire active" — concepts

Le DS est piloté par les besoins de l'écran _Mémoire active_ qui est
le cœur du Veilleur. Quelques concepts clés :

- **Piste** : un fil de pensée que l'utilisateur suit dans le temps.
- **Trace** : tout ce qui rattache une piste à du contenu (notes,
  articles sauvegardés, évènements).
- **Note épinglée** : une réflexion centrale, présentée comme
  centerpiece d'une piste (amber pin).
- **Graphe** : la **mémoire mentale** de l'utilisateur — pas la
  cartographie globale du savoir. Les nœuds ont des positions
  semi-stables, pas de physics live.
- **Système · murmure** : suggestions IA discrètes, en marge,
  jamais centrées.

---

## Catalogue visuel

Ouvrez `design-system/index.html` dans un navigateur pour voir tous
les tokens, composants et patterns à l'œuvre. C'est la référence
canonique — toute modification visuelle doit y figurer.

---

## À ne pas faire

- ❌ Ajouter une couleur hors palette
- ❌ Utiliser une 4ᵉ famille de police
- ❌ Dashboards / gros KPI / animations spectaculaires
- ❌ Cartes avec bordure colorée à gauche + bg pastel (cliché AI)
- ❌ Emoji dans l'UI (sauf si la marque le revendique — ce qui n'est
  pas le cas du Veilleur)
- ❌ Sidebars surchargées, contrôles trop denses
- ❌ Gradient backgrounds (rare et discret max)
- ❌ Drop shadows fortes — toujours ombres calques discrètes

---

## License

Privé · Le Veilleur.
