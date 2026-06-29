<script setup lang="ts">
// Profil (porté du mockup « Le Veilleur — Mémoire active » §Profil) : synthèse
// « Le système a compris » alimentée par le user_context réel (/settings/download)
// + réglages de lecture (/settings). La recalibration réutilise l'entretien (/onboarding).
import { onMounted, computed } from 'vue'
import { useProfileStore } from '../stores/useProfileStore'
import FeedSubscribe from '../components/feed/FeedSubscribe.vue'

const store = useProfileStore()
onMounted(() => store.load())

const VOICES = ['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer']

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

const domaine = computed(() => String(store.context?.domaine ?? ''))
const role = computed(() => String(asRecord(store.context?.profil).role ?? ''))

// axes_de_veille : { libellé → requête }. Rendu défensif (valeurs string ou objet).
const axes = computed(() => {
  const a = asRecord(store.context?.axes_de_veille)
  const freq = asRecord(store.context?.frequence_par_axe)
  return Object.entries(a).map(([label, query]) => ({
    label,
    query: typeof query === 'string' ? query : JSON.stringify(query),
    freq: typeof freq[label] === 'string' ? (freq[label] as string) : '',
  }))
})

const lecture = computed(() => asRecord(store.context?.axes_de_lecture))

// tracked_entities : seaux d'entités (objet d'arrays) ou array plat → tags.
const sujets = computed(() => {
  const t = store.context?.tracked_entities
  if (Array.isArray(t)) return t.map(String)
  return Object.values(asRecord(t)).flatMap((v) => (Array.isArray(v) ? v.map(String) : []))
})

function setVoice(e: Event) {
  store.saveSettings({ voice: (e.target as HTMLSelectElement).value })
}
function setMaxArticles(e: Event) {
  store.saveSettings({ max_articles: Number((e.target as HTMLInputElement).value) })
}
function setSchedule(e: Event) {
  store.saveSettings({ schedule_time: (e.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="prof">
    <header class="prof-head">
      <p class="prof-eyebrow"><span class="mark" />Profil</p>
      <h1 class="prof-title">Ce que le système a compris</h1>
      <p v-if="domaine || role" class="prof-sub">{{ role }}<template v-if="role && domaine"> · </template><em>{{ domaine }}</em></p>
    </header>

    <div v-if="store.loading" class="prof-loading">Chargement de votre profil…</div>
    <p v-else-if="store.error" class="prof-err">{{ store.error }}</p>

    <div v-else class="prof-grid">
      <!-- Synthèse profil -->
      <section class="prof-summary">
        <div v-if="axes.length" class="ps-block">
          <div class="ps-label">Axes de veille</div>
          <ul class="ps-axes">
            <li v-for="a in axes" :key="a.label" class="ps-axis">
              <span class="ps-axis__name">{{ a.label }}</span>
              <span class="ps-axis__q">{{ a.query }}</span>
              <span v-if="a.freq" class="ps-axis__freq">{{ a.freq }}</span>
            </li>
          </ul>
        </div>

        <div v-if="sujets.length" class="ps-block">
          <div class="ps-label">Sujets suivis</div>
          <div class="ps-tags">
            <span v-for="s in sujets" :key="s" class="ps-tag">{{ s }}</span>
          </div>
        </div>

        <div v-if="lecture.niveau_abstraction || lecture.signal_recherche || lecture.ce_que_je_refuse" class="ps-block">
          <div class="ps-label">Filtres de lecture</div>
          <p v-if="lecture.signal_recherche" class="ps-line"><b>Signal&nbsp;:</b> {{ lecture.signal_recherche }}</p>
          <p v-if="lecture.niveau_abstraction" class="ps-line"><b>Niveau&nbsp;:</b> {{ lecture.niveau_abstraction }}</p>
          <p v-if="lecture.ce_que_je_refuse" class="ps-line"><b>Refus&nbsp;:</b> {{ lecture.ce_que_je_refuse }}</p>
        </div>

        <RouterLink to="/onboarding" class="ps-button">Recalibrer mon profil</RouterLink>
      </section>

      <!-- Réglages de lecture -->
      <aside class="prof-settings">
        <div class="ps-label">Réglages</div>
        <label class="set-row">
          <span>Voix du briefing</span>
          <select :value="store.settings?.voice" @change="setVoice">
            <option v-for="v in VOICES" :key="v" :value="v">{{ v }}</option>
          </select>
        </label>
        <label class="set-row">
          <span>Articles max ({{ store.settings?.max_articles }})</span>
          <input type="range" min="5" max="12" :value="store.settings?.max_articles" @change="setMaxArticles" />
        </label>
        <label class="set-row">
          <span>Heure d’édition</span>
          <input type="time" :value="store.settings?.schedule_time ?? ''" @change="setSchedule" />
        </label>
        <p v-if="store.saving" class="set-status">Enregistrement…</p>
        <button class="set-download" @click="store.downloadProfile()">Exporter mon profil (JSON)</button>
      </aside>
    </div>

    <!-- Mon flux audio — abonnement podcast privé per-user (PRD « Flux podcast audio »). -->
    <FeedSubscribe v-if="!store.loading && !store.error" />
  </div>
</template>

<style scoped>
.prof { max-width: 60rem; margin: 0 auto; padding: 3rem 2rem 4rem; position: relative; z-index: 1; }
.prof-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  display: flex; align-items: center; gap: 0.5rem;
}
.prof-eyebrow .mark { width: 5px; height: 5px; border-radius: 50%; background: var(--color-indigo); }
.prof-title {
  font-family: var(--font-serif);
  font-size: 2rem; font-weight: 500;
  color: var(--color-ink); margin-top: 0.75rem;
}
.prof-sub { font-family: var(--font-sans); color: var(--color-ink-3); margin-top: 0.4rem; }
.prof-sub em { font-style: italic; color: var(--color-indigo); }
.prof-loading, .prof-err { font-family: var(--font-sans); color: var(--color-ink-3); margin-top: 2rem; }
.prof-err { color: var(--color-rose); }

.prof-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2.5rem; margin-top: 2.5rem; }
@media (max-width: 720px) { .prof-grid { grid-template-columns: 1fr; } }

.ps-block { margin-bottom: 1.75rem; }
.ps-label {
  font-family: var(--font-mono);
  font-size: 0.625rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-ink-3);
  padding-bottom: 0.5rem; margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-rule-2);
}
.ps-axes { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
.ps-axis { display: flex; flex-direction: column; gap: 0.15rem; }
.ps-axis__name { font-family: var(--font-serif); font-size: 1.0625rem; color: var(--color-ink); }
.ps-axis__q { font-family: var(--font-sans); font-size: 0.875rem; color: var(--color-ink-2); }
.ps-axis__freq {
  font-family: var(--font-mono); font-size: 0.625rem; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--color-amber);
}
.ps-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ps-tag {
  font-family: var(--font-sans); font-size: 0.8125rem;
  padding: 0.25rem 0.7rem; border-radius: 999px;
  background: var(--color-indigo-tint); color: var(--color-ink);
}
.ps-line { font-family: var(--font-sans); font-size: 0.9375rem; color: var(--color-ink-2); margin: 0.3rem 0; line-height: 1.5; }
.ps-line b { color: var(--color-ink); }
.ps-button {
  display: inline-block; margin-top: 0.5rem;
  font-family: var(--font-sans); font-size: 0.875rem; font-weight: 500;
  padding: 0.65rem 1.25rem; border-radius: 12px;
  background: var(--color-ink); color: var(--color-paper); text-decoration: none;
}

.prof-settings { background: var(--color-bg-2); border-radius: 14px; padding: 1.5rem; height: fit-content; }
.set-row { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.set-row span { font-family: var(--font-sans); font-size: 0.8125rem; color: var(--color-ink-2); }
.set-row select, .set-row input[type="time"] {
  font-family: var(--font-sans); font-size: 0.875rem;
  padding: 0.45rem 0.6rem; border: 1px solid var(--color-rule); border-radius: 8px;
  background: var(--color-paper); color: var(--color-ink);
}
.set-status { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-moss); }
.set-download {
  width: 100%; margin-top: 0.5rem;
  font-family: var(--font-sans); font-size: 0.8125rem;
  padding: 0.55rem; border: 1px solid var(--color-rule); border-radius: 8px;
  background: var(--color-paper); color: var(--color-ink-2); cursor: pointer;
}
.set-download:hover { border-color: var(--color-ink-3); }
</style>
