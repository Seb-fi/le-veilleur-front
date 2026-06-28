// Mock détaillé de la page article (mode VITE_USE_MOCK). Sert l'E2E Playwright et le dev
// sans back. Couvre les deux états §7 : un article AVEC texte intégral (état A : a-icl) et
// un SANS (état B : a-amnesia). Inclut thèse, contrepoint, entités.

import type { ArticleDetail, ArticleEntity } from '../api/articles'
import type { ArticleId } from '../types'

function detail(d: Partial<ArticleDetail> & Pick<ArticleDetail, 'id' | 'title' | 'source' | 'summary'>): ArticleDetail {
  return {
    date: '25 juin 2026',
    score: 0.84,
    why: '',
    axis: 'Cycle de vie des LLM',
    axisClass: 'indigo',
    type: 'Recherche',
    img: '',
    relatedCount: 0,
    context: 'analysis',
    contextLabel: 'Analyse',
    trending: false,
    labels: ['ai_ml'],
    relatedIds: [],
    published: '2026-06-25',
    thesisFr: null,
    isArgumentative: false,
    contradictionIds: [],
    contradictionScores: [],
    fullText: null,
    ...d,
  }
}

// Article principal — ÉTAT A (texte intégral disponible) + thèse + contrepoint + entités.
const ICL = detail({
  id: 'a-icl',
  title:
    'LLM Evolution as an Industry-Scale Ecosystem: A Lifecycle Perspective on Continual Learning',
  source: 'arxiv.org/rss/cs.LG',
  date: '25 juin 2026',
  score: 0.92,
  why: 'Vous suivez le cycle de vie des LLM : cet article formalise les principes de conception que vos pistes « Apprentissage continu » et « Cycle de vie des LLM » cherchaient à structurer.',
  type: 'Recherche',
  context: 'research',
  contextLabel: 'Recherche',
  trending: false,
  labels: ['ai_ml', 'research'],
  thesisFr:
    "L'apprentissage continu industriel doit se penser comme un problème de publication en boucle fermée — pas comme un simple réentraînement — sous peine d'éroder la plasticité et de rompre l'héritage des capacités.",
  isArgumentative: true,
  relatedIds: ['a-orion', 'a-mlubench'],
  contradictionIds: ['a-amnesia'],
  contradictionScores: [0.79],
  link: 'https://arxiv.org/abs/2606.05355',
  summary: [
    "L'article propose une perspective sur l'apprentissage continu industriel (ICL) des modèles de langage en tant que problème de mise à jour et de publication en boucle fermée. Il identifie trois défis majeurs : l'érosion de la plasticité, la rupture de l'héritage des capacités lors des mises à jour, et les contraintes de durabilité en déploiement.",
    'Cinq principes de conception sont introduits pour structurer le paysage technique, et un plan de déploiement pratique est proposé pour faciliter l’évolution des modèles sur le long terme.',
  ].join('\n\n'),
  fullText: [
    "En production, un modèle de langage n'est jamais « terminé ». Chaque mise à jour — nouveau corpus, nouvelle politique d'alignement, correctif de sécurité — rejoue l'ensemble du cycle de vie et peut dégrader silencieusement des capacités déjà acquises. C'est ce constat qui motive une lecture de l'apprentissage continu comme un problème industriel, et non purement algorithmique.",
    "Premier défi : l'érosion de la plasticité. Après plusieurs cycles de fine-tuning, le modèle perd progressivement sa capacité à intégrer de nouvelles connaissances sans réécrire les anciennes. Les auteurs montrent que cette érosion est mesurable et qu'elle s'accélère lorsque les mises à jour sont fréquentes et peu espacées.",
    "Deuxième défi : la rupture de l'héritage des capacités. Une mise à jour ciblée sur un domaine peut faire régresser des compétences sans rapport apparent — un effet de bord difficile à anticiper sans un suivi systématique des capacités au fil des versions.",
    "Pour structurer ce paysage, cinq principes de conception sont proposés : versionner explicitement les capacités, mesurer la plasticité en continu, isoler les mises à jour à risque, conserver une mémoire de rejeu contrôlée, et tracer chaque release comme un artefact reproductible.",
  ].join('\n\n'),
})

// Article lié « même sujet ».
const ORION = detail({
  id: 'a-orion',
  title: 'Orion: Self-adaptive Memory Management for On-device Continual Learning',
  source: 'arxiv.org/rss/eess.SY',
  date: '24 juin 2026',
  score: 0.88,
  type: 'Recherche',
  summary: 'Gestion mémoire auto-adaptative pour l’apprentissage continu embarqué.',
  relatedIds: ['a-icl'],
})

const MLUBENCH = detail({
  id: 'a-mlubench',
  title: 'MLUBench: A Benchmark for Lifelong Unlearning Evaluation in MLLMs',
  source: 'arxiv.org/rss/cs.AI',
  date: '20 juin 2026',
  score: 0.74,
  type: 'Recherche',
  summary: 'Un banc d’essai pour l’évaluation du désapprentissage à vie.',
  relatedIds: ['a-icl'],
})

// Contrepoint — ÉTAT B (PAS de texte intégral) : la bascule Résumé/Intégral est grisée.
const AMNESIA = detail({
  id: 'a-amnesia',
  title: 'Amnesia: A Stealthy Replay Attack on Continual Learning Dreams',
  source: 'arxiv.org/rss/cs.CR',
  date: '21 juin 2026',
  score: 0.79,
  type: 'Recherche',
  context: 'analysis',
  contextLabel: 'Analyse',
  thesisFr:
    "Le rejeu (replay), recommandé pour préserver les capacités, ouvre une surface d'attaque furtive qui fragilise l'apprentissage continu.",
  isArgumentative: true,
  summary:
    "Les auteurs montrent qu'un attaquant peut empoisonner la mémoire de rejeu d'un système d'apprentissage continu sans être détecté, retournant contre lui la technique censée le protéger. Le replay — recommandé par les travaux récents — devient ici une faille.",
  fullText: null,
  contradictionIds: ['a-icl'],
  contradictionScores: [0.79],
  link: 'https://arxiv.org/abs/2606.07446',
})

export const MOCK_ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  [ICL.id]: ICL,
  [ORION.id]: ORION,
  [MLUBENCH.id]: MLUBENCH,
  [AMNESIA.id]: AMNESIA,
}

export const MOCK_ARTICLE_ENTITIES: Record<string, ArticleEntity[]> = {
  'a-icl': [
    { id: 'e-icl', label: 'Apprentissage continu (ICL)' },
    { id: 'e-llm', label: 'LLM' },
    { id: 'e-plasticite', label: 'Plasticité' },
    { id: 'e-deploy', label: 'Déploiement' },
  ],
  'a-amnesia': [
    { id: 'e-replay', label: 'Rejeu (replay)' },
    { id: 'e-secu', label: 'Sécurité des modèles' },
  ],
}

// Identifiant de l'article par défaut ouvert par les liens internes en mode mock.
export const MOCK_DEFAULT_ARTICLE_ID = 'a-icl' as ArticleId
