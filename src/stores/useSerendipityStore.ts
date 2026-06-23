import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchSerendipity, type SurfacedDossier } from '../api/serendipity'
import type { FaibleItem } from '../api/briefing'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// FrontieresVeille rend `body` en v-html → on échappe le contenu serveur et on ne
// pose que nos propres balises <b> autour de l'ancre.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function adapt(d: SurfacedDossier): FaibleItem {
  const claim = d.claims[0] ?? ''
  const pivot = d.ponts[0]?.pivot ?? ''
  const bridge = pivot ? ` <span>(pont via ${escapeHtml(pivot)})</span>` : ''
  return {
    where: d.column_label || 'Frontière',
    body: `<b>${escapeHtml(d.anchor)}</b> — ${escapeHtml(claim)}${bridge}`,
  }
}

export const useSerendipityStore = defineStore('serendipity', () => {
  const items = ref<FaibleItem[]>([])
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    if (USE_MOCK) {
      const { MOCK_BRIEFING } = await import('../mocks/briefing')
      items.value = MOCK_BRIEFING.faibles
      loaded.value = true
      return
    }
    try {
      const rows = await fetchSerendipity(3)
      // Frontière vide = pas de signal : on omet (jamais de remontée fabriquée).
      items.value = rows.map(adapt)
    } catch {
      items.value = []
    } finally {
      loaded.value = true
    }
  }

  return { items, loaded, load }
})
