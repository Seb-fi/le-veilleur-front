// Mock déterministe du « Flux podcast audio » (mode VITE_USE_MOCK).
// Aligné sur le nouveau contrat back : GET /api/feed/me renvoie l'URL RÉELLE du flux
// quand un token actif existe (avant : toujours null). Le mock simule donc par défaut
// le cas « flux actif » (URL présente) → la rubrique d'abonnement s'affiche.
//
// Cas null testable : `?feed=empty` dans l'URL (ou localStorage 've_feed_empty')
// force fetchMyFeed à renvoyer { feed_url: null } → l'UI propose « Générer mon flux ».
// Cela permet de couvrir les DEUX branches sans backend.

import type { FeedMe } from '../api/feed'

export const MOCK_FEED_URL = 'https://veille.example.eu/feed/mock-token-abc123.xml'

// L'override est lu à chaud (pas mis en cache) pour que l'E2E puisse piloter le cas.
function wantsEmptyFeed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.get('feed') === 'empty') return true
    // Le routeur est en mode hash : le query est souvent après le #.
    const hash = window.location.hash
    const qi = hash.indexOf('?')
    if (qi !== -1 && new URLSearchParams(hash.slice(qi + 1)).get('feed') === 'empty') return true
    return window.localStorage.getItem('ve_feed_empty') === 'true'
  } catch {
    return false
  }
}

export function mockFetchMyFeed(): FeedMe {
  return { feed_url: wantsEmptyFeed() ? null : MOCK_FEED_URL }
}

// La rotation/création renvoie toujours une nouvelle URL (déterministe par appel).
export function mockRegeneratedUrl(): string {
  return `https://veille.example.eu/feed/rotated-${Date.now().toString(36)}.xml`
}
