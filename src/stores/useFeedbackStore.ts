import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  postArticleFeedback,
  postListen,
  type ArticleFeedbackType,
} from '../api/feedback'
import { createFavorite, deleteFavorite, fetchFavorites } from '../api/memoire'
import type { ArticleId } from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/

// Feedback = réglage, pas récompense (cf. docs/feedback_design.md). État optimiste,
// idempotent, sans compteur. Le back modélise des ÉVÉNEMENTS (pas un état togglable) :
// un dé-toggle efface l'état visuel local sans événement de négation (il n'en existe pas).
export type Opinion = 'relevant' | 'not_relevant' | null

interface ArticleFb {
  favorite: boolean
  opinion: Opinion
}

export const useFeedbackStore = defineStore('feedback', () => {
  const state = ref<Record<string, ArticleFb>>({})
  // Implicites + écoute : on n'émet qu'une fois par (article|date) et par type.
  const firedImplicit = ref<Set<string>>(new Set())
  const listenSent = ref<Set<string>>(new Set())
  const favoritesHydrated = ref(false)

  function get(id: string): ArticleFb {
    return state.value[id] ?? { favorite: false, opinion: null }
  }

  // Hydrate l'étoile depuis la bibliothèque persistante (table `user_favorites`) : sans ça,
  // l'état favori est local et l'étoile retombe « éteinte » au rechargement. Idempotent,
  // best-effort, appelé une fois au bootstrap (App.vue) après résolution de l'identité.
  async function hydrateFavorites() {
    if (USE_MOCK || favoritesHydrated.value) return
    favoritesHydrated.value = true
    try {
      const favs = await fetchFavorites()
      for (const f of favs) {
        const cur = get(f.articleId)
        state.value[f.articleId] = { ...cur, favorite: true }
      }
    } catch {
      favoritesHydrated.value = false // permet un nouvel essai (ex. token tardif)
    }
  }

  function send(id: string, type: ArticleFeedbackType, briefingDate?: string) {
    if (USE_MOCK) return
    // Best-effort : le feedback n'est pas critique, on n'interrompt jamais la lecture.
    postArticleFeedback(id, type, briefingDate).catch(() => {})
  }

  function toggleFavorite(id: string, briefingDate?: string) {
    const cur = get(id)
    const favorite = !cur.favorite
    state.value[id] = { ...cur, favorite }
    if (favorite) send(id, 'favorite', briefingDate) // signal de scoring (pas d'« unfavorite »)
    // Bibliothèque Mémoire active : le favori est un objet persistant (table `user_favorites`),
    // distinct du signal de feedback. Toggle réel : ajout/retrait. Best-effort.
    if (!USE_MOCK) {
      const aid = id as ArticleId
      ;(favorite ? createFavorite(aid) : deleteFavorite(aid)).catch(() => {})
    }
  }

  // Tri-état mutuellement exclusif : re-cliquer l'opinion active l'efface (local only).
  function setOpinion(id: string, opinion: Exclude<Opinion, null>, briefingDate?: string) {
    const cur = get(id)
    const next = cur.opinion === opinion ? null : opinion
    state.value[id] = { ...cur, opinion: next }
    if (next) send(id, next, briefingDate)
  }

  function markImplicit(
    id: string,
    type: Extract<ArticleFeedbackType, 'source_clicked' | 'related_clicked'>,
    briefingDate?: string,
  ) {
    const key = `${id}:${type}`
    if (firedImplicit.value.has(key)) return
    firedImplicit.value.add(key)
    send(id, type, briefingDate)
  }

  // Écoute audio : POST /briefings/{date}/listen { percent }. Une fois par édition,
  // avec le dernier % connu. Garde ISO (le composite mock n'a pas de date ISO).
  function markListen(date: string, percent: number) {
    if (USE_MOCK || !ISO_DATE.test(date)) return
    const pct = Math.round(Math.max(0, Math.min(100, percent)))
    if (pct <= 0) return
    listenSent.value.add(date) // dernier % gagne : on autorise un ré-envoi à la hausse
    postListen(date, pct).catch(() => {})
  }

  return { get, toggleFavorite, hydrateFavorites, setOpinion, markImplicit, markListen }
})
