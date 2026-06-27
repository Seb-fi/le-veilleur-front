// Mock déterministe de la « Mémoire active » (mode VITE_USE_MOCK).
// Données réalistes (tech / conseil / QHSE / juridique) inspirées du handoff design.
// Sert l'E2E Playwright et le dev sans back. Le contrat reste celui du §9 — ici on
// expose directement les types camelCase de `src/types` (la couche api/ ne s'interpose
// pas en mode mock : le store appelle ces helpers).

import type {
  Favori, Piste, PisteId, Note, NoteId, ArticleId, Apercu, ApercuState,
} from '../types'

// ----------------------------------------------------------------------------
// Pistes
// ----------------------------------------------------------------------------
export const MOCK_PISTES: Piste[] = [
  {
    id: 'p-foundry' as PisteId,
    nom: 'Remplacer Foundry',
    couleur: 'indigo',
    descriptif:
      'Je veux remplacer Palantir Foundry — alternatives crédibles (open-source ou managées) et retours d’expérience concrets de migration d’équipes data.',
    favoriCount: 0,
  },
  {
    id: 'p-llm' as PisteId,
    nom: 'Code généré par LLM',
    couleur: 'moss',
    descriptif:
      'Maintenabilité à long terme du code généré par LLM : dette technique, revue de code et couverture de tests.',
    favoriCount: 0,
  },
  {
    id: 'p-csrd' as PisteId,
    nom: 'Directive CSRD',
    couleur: 'amber',
    descriptif:
      'Application de la directive CSRD pour les ETI — obligations concrètes, calendrier et premiers retours de mise en conformité.',
    favoriCount: 0,
  },
  {
    id: 'p-aiact' as PisteId,
    nom: 'AI Act — déployeurs',
    couleur: 'rose',
    descriptif:
      'Obligations de l’AI Act pour les déployeurs de systèmes à haut risque — échéances 2026 et interprétations juridiques.',
    favoriCount: 0,
  },
  {
    id: 'p-cloud' as PisteId,
    nom: 'Souveraineté cloud',
    couleur: 'steel',
    descriptif:
      'Souveraineté des données dans le cloud pour le secteur public — offres qualifiées SecNumCloud et arbitrage coût / contrôle.',
    favoriCount: 0,
  },
]

// ----------------------------------------------------------------------------
// Favoris
// ----------------------------------------------------------------------------
export const MOCK_FAVORITES: Favori[] = [
  {
    articleId: 'a-tofu' as ArticleId,
    titre: 'OpenTofu 1.8 : le fork de Terraform mûrit',
    source: 'InfoQ',
    date: '12 juin',
    lien: 'https://example.test/opentofu',
    extrait:
      'La communauté consolide l’alternative open-source : les premières migrations d’entreprise s’enclenchent.',
    pisteIds: ['p-foundry' as PisteId],
    hasNotes: false,
  },
  {
    articleId: 'a-foundry-exit' as ArticleId,
    titre: 'Migrer hors de Foundry : le retour d’une data team',
    source: 'Blog Architecture',
    date: '7 juin',
    lien: 'https://example.test/foundry-exit',
    extrait:
      'Coûts cachés, pièges de la reprise des pipelines et bénéfices après six mois hors de la plateforme.',
    pisteIds: ['p-foundry' as PisteId],
    hasNotes: true,
  },
  {
    articleId: 'a-llm-debt' as ArticleId,
    titre: 'La dette technique invisible du code IA',
    source: 'IEEE Software',
    date: '9 juin',
    lien: 'https://example.test/llm-debt',
    extrait:
      'Le code généré passe les tests mais dérive en maintenabilité : un angle mort des copilotes.',
    pisteIds: ['p-llm' as PisteId],
    hasNotes: true,
  },
  {
    articleId: 'a-dagster' as ArticleId,
    titre: 'Dagster vs Foundry : orchestration de pipelines',
    source: 'The New Stack',
    date: '3 juin',
    lien: 'https://example.test/dagster',
    extrait:
      'Comparatif d’orchestration : modèle d’assets, lignage et coût d’exploitation.',
    pisteIds: ['p-foundry' as PisteId, 'p-llm' as PisteId],
    hasNotes: true,
  },
  {
    articleId: 'a-copilotes' as ArticleId,
    titre: 'Revue de code à l’ère des copilotes',
    source: 'ACM Queue',
    date: '4 juin',
    lien: 'https://example.test/copilotes',
    extrait:
      'Comment adapter la revue quand le modèle du diff est généré : nouveaux critères, nouveaux risques.',
    pisteIds: [],
    hasNotes: false,
  },
  {
    articleId: 'a-csrd-eti' as ArticleId,
    titre: 'CSRD : ce que les ETI doivent publier dès 2025',
    source: 'Les Échos',
    date: '6 juin',
    lien: 'https://example.test/csrd-eti',
    extrait:
      'Première double matérialité et premiers indicateurs obligatoires pour les entreprises de taille intermédiaire.',
    pisteIds: ['p-csrd' as PisteId],
    hasNotes: true,
  },
  {
    articleId: 'a-secnum' as ArticleId,
    titre: 'SecNumCloud : comparatif des offres 2026',
    source: 'LeMagIT',
    date: '9 juin',
    lien: 'https://example.test/secnumcloud',
    extrait: 'Panorama des offres qualifiées et des écarts de couverture pour le secteur public.',
    pisteIds: ['p-cloud' as PisteId],
    hasNotes: false,
  },
  {
    articleId: 'a-aiact-registre' as ArticleId,
    titre: 'AI Act : registre déployeur, le format type',
    source: 'Village Justice',
    date: '7 juin',
    lien: 'https://example.test/aiact-registre',
    extrait: 'Le format attendu du registre des systèmes à haut risque pour les déployeurs.',
    pisteIds: [],
    hasNotes: false,
  },
]

// ----------------------------------------------------------------------------
// Notes (polymorphes) — derivedPisteIds calculés à la volée par le store
// ----------------------------------------------------------------------------
export const MOCK_NOTES: Note[] = [
  {
    id: 'n-1' as NoteId,
    kind: 'fav',
    targetId: 'a-foundry-exit',
    texte: 'Le passage le plus utile : leur checklist de reprise des pipelines.',
    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },
  {
    id: 'n-2' as NoteId,
    kind: 'fav',
    targetId: 'a-dagster',
    texte: 'Comparer le modèle d’assets de Dagster à notre besoin de lignage.',
    createdAt: '2026-06-10',
    updatedAt: '2026-06-10',
  },
  {
    id: 'n-3' as NoteId,
    kind: 'fav',
    targetId: 'a-llm-debt',
    texte: 'À rapprocher de notre incident de l’an dernier sur du code généré.',
    createdAt: '2026-06-10',
    updatedAt: '2026-06-10',
  },
  {
    id: 'n-4' as NoteId,
    kind: 'fav',
    targetId: 'a-csrd-eti',
    texte: 'Vérifier si le seuil ETI nous concerne dès l’exercice 2025.',
    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },
  {
    id: 'n-5' as NoteId,
    kind: 'piste',
    targetId: 'p-foundry',
    texte: 'Prioriser les retours d’équipes < 20 personnes : nos contraintes sont proches.',
    createdAt: '2026-06-08',
    updatedAt: '2026-06-08',
  },
  {
    id: 'n-6' as NoteId,
    kind: 'piste',
    targetId: 'p-foundry',
    texte: 'Trancher entre managé et auto-hébergé avant la fin du trimestre.',
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
  },
  {
    id: 'n-7' as NoteId,
    kind: 'piste',
    targetId: 'p-csrd',
    texte: 'Demander à Léa le calendrier interne de mise en conformité.',
    createdAt: '2026-06-12',
    updatedAt: '2026-06-12',
  },
]

// ----------------------------------------------------------------------------
// Aperçu vivant — stub déterministe (porté de v2-apercu.jsx).
// Contrat UX : descriptif vague → aperçu générique + état bas ;
// descriptif précis → aperçu resserré + SIGNAL_NET. Aucune persistance.
// ----------------------------------------------------------------------------
function fold(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const THEME_VOCAB: Record<string, string[]> = {
  foundry: ['foundry', 'palantir', 'migration', 'migrer', 'alternative', 'data', 'pipeline', 'dagster', 'airflow', 'opentofu', 'terraform', 'open-source', 'manage', 'retour', 'experience', 'equipe', 'reversibilite'],
  llm: ['llm', 'genere', 'maintenabilite', 'dette', 'technique', 'revue', 'code', 'test', 'couverture', 'copilote', 'regression'],
  csrd: ['csrd', 'eti', 'materialite', 'conformite', 'reporting', 'esg', 'obligation', 'calendrier', 'durabilite', 'publier'],
  aiact: ['ai act', 'deployeur', 'haut risque', 'registre', 'echeance', '2026', 'fournisseur'],
  cloud: ['secnumcloud', 'souverainete', 'souverain', 'cloud', 'secteur public', 'reversibilite', 'qualifie', 'administration'],
}

interface Candidate { articleId: string; t: string; s: string; date: string; kw: string[] }
const CANDIDATES: Record<string, Candidate[]> = {
  foundry: [
    { articleId: 'c-palantir', t: 'Sortir de Palantir : le guide d’une banque européenne', s: 'Blog Architecture', date: '7 juin', kw: ['palantir', 'foundry', 'migration', 'retour', 'experience'] },
    { articleId: 'c-cout', t: 'Coût total d’une plateforme data managée', s: 'Gartner', date: '20 mai', kw: ['data', 'manage'] },
    { articleId: 'c-bigbang', t: 'Reprise de pipelines : éviter le big-bang', s: 'InfoQ', date: '29 mai', kw: ['pipeline', 'migration', 'data'] },
    { articleId: 'c-tofu', t: 'OpenTofu en production : 6 retours d’équipes', s: 'LeMagIT', date: '24 mai', kw: ['opentofu', 'terraform', 'retour', 'experience', 'equipe'] },
  ],
  llm: [
    { articleId: 'c-dette', t: 'Mesurer la dette du code généré : une métrique', s: 'IEEE Software', date: '9 juin', kw: ['dette', 'genere', 'code', 'maintenabilite'] },
    { articleId: 'c-copilote', t: 'Copilotes et revue : retour de 200 équipes', s: 'ACM Queue', date: '4 juin', kw: ['copilote', 'revue', 'code'] },
    { articleId: 'c-tests', t: 'Tests générés : couverture réelle vs apparente', s: 'martinfowler.com', date: '1 juin', kw: ['test', 'couverture', 'genere', 'regression'] },
    { articleId: 'c-angle', t: 'La maintenabilité, angle mort des LLM de code', s: 'InfoQ', date: '27 mai', kw: ['maintenabilite', 'llm', 'code', 'technique'] },
  ],
  csrd: [
    { articleId: 'c-mat', t: 'Double matérialité : la méthode pas à pas', s: 'Novethic', date: '10 juin', kw: ['materialite', 'csrd', 'reporting'] },
    { articleId: 'c-eti', t: 'CSRD pour ETI : modèle de feuille de route', s: 'Les Échos', date: '6 juin', kw: ['csrd', 'eti', 'calendrier', 'obligation'] },
    { articleId: 'c-esg', t: 'Données ESG manquantes : comment combler', s: 'Carbone 4', date: '2 juin', kw: ['esg', 'reporting', 'durabilite'] },
  ],
  aiact: [
    { articleId: 'c-registre', t: 'AI Act : registre déployeur, le format type', s: 'Village Justice', date: '7 juin', kw: ['registre', 'deployeur', 'ai act'] },
    { articleId: 'c-hautrisque', t: 'Haut risque : la liste des cas en 2026', s: 'Euractiv', date: '3 juin', kw: ['haut risque', '2026', 'echeance'] },
    { articleId: 'c-qui', t: 'Fournisseur ou déployeur : qui porte quoi', s: 'Dalloz', date: '30 mai', kw: ['fournisseur', 'deployeur', 'obligation'] },
  ],
  cloud: [
    { articleId: 'c-secnum', t: 'SecNumCloud : comparatif des offres 2026', s: 'LeMagIT', date: '9 juin', kw: ['secnumcloud', 'qualifie', 'cloud'] },
    { articleId: 'c-confiance', t: 'Cloud de confiance : ce que veut l’État', s: 'Acteurs Publics', date: '5 juin', kw: ['souverain', 'secteur public', 'administration'] },
    { articleId: 'c-revers', t: 'Réversibilité : la clause qui change tout', s: 'Le Monde Informatique', date: '31 mai', kw: ['reversibilite', 'donnee'] },
  ],
}

function detectTheme(text: string): { theme: string; hits: number } {
  const t = fold(text)
  let best = 'foundry'
  let bestHits = 0
  for (const id of Object.keys(THEME_VOCAB)) {
    let h = 0
    for (const k of THEME_VOCAB[id]) if (t.includes(k)) h++
    if (h > bestHits) {
      bestHits = h
      best = id
    }
  }
  return { theme: best, hits: bestHits }
}

/** Nombre de thèmes distincts touchés — alimente le nudge « un seul axe ». */
export function themeSpread(text: string): number {
  const t = fold(text)
  let n = 0
  for (const id of Object.keys(THEME_VOCAB)) {
    if (THEME_VOCAB[id].some((k) => t.includes(k))) n++
  }
  return n
}

/** Stub déterministe : descriptif → Apercu (résultats + état borné). */
export function computeApercu(text: string): Apercu {
  const t = fold(text)
  const len = t.trim().length
  const { theme } = detectTheme(text)
  const vocab = THEME_VOCAB[theme] ?? []
  const distinct = vocab.filter((k) => t.includes(k)).length
  const specificity = Math.min(1, distinct / 5)
  const lengthBonus = Math.min(1, Math.max(0, (len - 28) / 130))
  const intentBonus = /(je (cherche|veux|suis)|retour|comment|alternative|obligation)/.test(t) ? 0.12 : 0
  let quality = Math.max(0, Math.min(1, 0.62 * specificity + 0.3 * lengthBonus + intentBonus))
  if (len < 12) quality = Math.min(quality, 0.06)

  const pool = (CANDIDATES[theme] ?? [])
    .map((c) => {
      const overlap = c.kw.filter((k) => t.includes(k)).length
      const base = 0.45 + 0.5 * (overlap / Math.max(1, c.kw.length))
      const score = Math.round(100 * Math.min(0.97, base * (0.55 + 0.45 * quality)))
      return { ...c, score }
    })
    .sort((a, b) => b.score - a.score)

  const nShow = Math.max(1, Math.min(4, 1 + Math.round(quality * 3)))
  let picked = pool.slice(0, nShow)
  let state: ApercuState
  if (len < 12 || quality < 0.18) {
    // Descriptif vide / trop vague / hors-corpus → aucune source crédible.
    picked = []
    state = 'AUCUNE_SOURCE'
  } else if (quality < 0.5) {
    state = 'SIGNAL_FAIBLE'
  } else {
    state = 'SIGNAL_NET'
  }

  const results = picked.map((c) => ({
    articleId: c.articleId as ArticleId,
    titre: c.t,
    source: c.s,
    date: c.date,
    score: c.score,
  }))

  const scores = results.map((r) => r.score)
  const n = scores.length
  const top = n ? Math.max(...scores) : 0
  const mean = n ? Math.round(scores.reduce((s, v) => s + v, 0) / n) : 0
  const dispersion = n ? top - Math.min(...scores) : 0

  return { results, state, scoreStats: { n, top, mean, dispersion } }
}
