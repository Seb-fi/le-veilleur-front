import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchMyFeed,
  regenerateFeed,
  postSubscribeIntent,
  type SubscribeApp,
  type SubscribeAction,
} from '../api/feed'
import { mockFetchMyFeed, mockRegeneratedUrl } from '../mocks/feed'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// État du canal flux podcast per-user (PRD « Flux podcast audio »). La création/
// rotation passe TOUJOURS par regenerate (POST) — jamais un effet de bord d'un GET.
export const useFeedStore = defineStore('feed', () => {
  const feedUrl = ref<string | null>(null)
  const loaded = ref(false)
  const loading = ref(false)
  const regenerating = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    if (loaded.value || loading.value) return
    loading.value = true
    error.value = null
    try {
      // Aligné back : me renvoie l'URL réelle si un flux actif existe, sinon null.
      // En mock, le helper simule le cas actif par défaut (?feed=empty force null).
      const res = USE_MOCK ? mockFetchMyFeed() : await fetchMyFeed()
      feedUrl.value = res.feed_url
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement du flux'
    } finally {
      loading.value = false
    }
  }

  // Création initiale ET rotation : même route POST regenerate (INV-F3). La rotation
  // invalide l'ancien lien — l'appelant a la responsabilité d'avertir l'utilisateur.
  async function regenerate(): Promise<void> {
    regenerating.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        feedUrl.value = mockRegeneratedUrl()
      } else {
        const res = await regenerateFeed()
        feedUrl.value = res.feed_url
      }
      loaded.value = true
      intent('autre', 'regenerate')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Échec de la régénération du flux'
      throw e
    } finally {
      regenerating.value = false
    }
  }

  // Best-effort (§5.6) : jamais bloquant, jamais d'erreur remontée à l'UX.
  function intent(app: SubscribeApp, action: SubscribeAction): void {
    if (USE_MOCK) return
    postSubscribeIntent(app, action).catch(() => {})
  }

  return { feedUrl, loaded, loading, regenerating, error, load, regenerate, intent }
})
