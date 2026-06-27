<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useMemoireStore } from '../../stores/useMemoireStore'
import type { Apercu, PisteColor, PisteId, ArticleId } from '../../types'
import ApercuList from './ApercuList.vue'
import JaugeEtat from './JaugeEtat.vue'
import MemIcon from './MemIcon.vue'

const store = useMemoireStore()

const COLORS: PisteColor[] = ['indigo', 'moss', 'amber', 'rose', 'steel']
const EXAMPLES = [
  'Je veux remplacer X — alternatives et retours de migration',
  'Maintenabilité à long terme du code généré par LLM',
  'Obligations concrètes de la CSRD pour les ETI',
]

// Édition d'une piste existante si composerDraftId pointe une piste connue.
const editing = computed(() =>
  store.composerDraftId ? store.pisteById(store.composerDraftId) ?? null : null,
)

const nom = ref(editing.value?.nom ?? '')
const couleur = ref<PisteColor>(editing.value?.couleur ?? 'indigo')
const descriptif = ref(editing.value?.descriptif ?? '')

const apercu = ref<Apercu | null>(null)
const apercuLoading = ref(false)
const multiTheme = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let controller: AbortController | null = null

async function recompute() {
  // Annule la requête obsolète (AbortController → signal passé à request).
  if (controller) controller.abort()
  controller = new AbortController()
  const signal = controller.signal
  const text = descriptif.value
  multiTheme.value = (await store.computeThemeSpread(text)) >= 2
  apercuLoading.value = true
  try {
    const res = await store.fetchApercu(text, signal)
    if (!signal.aborted) apercu.value = res
  } catch {
    // requête annulée ou erreur : on garde l'aperçu précédent
  } finally {
    if (!signal.aborted) apercuLoading.value = false
  }
}

watch(descriptif, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(recompute, 250)
})

onMounted(recompute)
onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (controller) controller.abort()
})

function applyExample(ex: string) {
  descriptif.value = ex
}

function splitInTwo() {
  // Nudge passif : on ne fait qu'amorcer une 2ᵉ piste — non bloquant.
  store.toast('Astuce : une intention = un seul axe')
}

// Favoris associés (édition d'une piste existante).
function favOn(articleId: ArticleId): boolean {
  return editing.value ? store.favoriById(articleId)?.pisteIds.includes(editing.value.id) ?? false : false
}
function toggleFav(articleId: ArticleId) {
  if (editing.value) store.toggleAssociation(articleId, editing.value.id)
}

const canSave = computed(() => nom.value.trim().length > 0 && descriptif.value.trim().length > 0)

async function save() {
  if (!canSave.value) return
  if (editing.value) {
    await store.updatePiste(editing.value.id, {
      nom: nom.value.trim(),
      couleur: couleur.value,
      descriptif: descriptif.value.trim(),
    })
    store.openFiche(editing.value.id)
  } else {
    const id: PisteId = await store.createPiste({
      nom: nom.value.trim(),
      couleur: couleur.value,
      descriptif: descriptif.value.trim(),
    })
    store.openFiche(id)
  }
}

function cancel() {
  if (editing.value) store.openFiche(editing.value.id)
  else store.goPistes()
}
</script>

<template>
  <div class="e-wrap">
    <section class="e-comp">
      <nav class="e-crumb">
        <button type="button" @click="cancel">
          <MemIcon name="arrow" :size="12" /> {{ editing ? 'Retour à la fiche' : 'Toutes les pistes' }}
        </button>
      </nav>

      <label class="e-field">
        <span class="e-flabel">Nom de la piste</span>
        <input v-model="nom" class="e-name" type="text" placeholder="Nommer cette piste…" aria-label="Nom de la piste" />
      </label>

      <div class="e-colors" role="radiogroup" aria-label="Couleur de la piste">
        <button
          v-for="c in COLORS"
          :key="c"
          type="button"
          class="e-swatch"
          role="radio"
          :aria-checked="couleur === c"
          :aria-label="c"
          :class="{ on: couleur === c }"
          :style="{ background: `var(--color-${c})` }"
          @click="couleur = c"
        />
      </div>

      <div class="e-field">
        <span class="e-flabel">Axe de recherche · votre intention</span>
        <div class="desced">
          <textarea
            v-model="descriptif"
            class="desced-ta"
            rows="4"
            placeholder="Je cherche X, et des retours sur Y…"
            aria-label="Axe de recherche"
          />
        </div>
        <p class="e-legend">
          phrase d'intention en langage naturel · ce texte pilote les sources remontées
        </p>
      </div>

      <JaugeEtat class="e-jauge" :state="apercu?.state ?? null" />

      <div v-if="multiTheme" class="nudge" role="note">
        <span class="nudge-label">Plusieurs axes ?</span>
        Ce descriptif semble mêler plusieurs sujets.
        <button type="button" class="nudge-act" @click="splitInTwo">En faire deux pistes</button>
      </div>

      <div class="e-examples">
        <span class="e-ex-label">Pour vous aider à formuler · adapté de l'exemple</span>
        <div class="e-ex-chips">
          <button
            v-for="ex in EXAMPLES"
            :key="ex"
            type="button"
            class="e-ex-chip"
            @click="applyExample(ex)"
          >{{ ex }}</button>
        </div>
      </div>

      <div v-if="editing" class="e-favs">
        <div class="e-favs-head">Favoris associés <span class="e-opt">facultatif</span></div>
        <ul class="e-fav-list">
          <li v-for="f in store.favorites" :key="f.articleId">
            <button type="button" class="e-fav-row" role="checkbox" :aria-checked="favOn(f.articleId)" @click="toggleFav(f.articleId)">
              <span class="e-fav-check" :class="{ on: favOn(f.articleId) }">
                <MemIcon v-if="favOn(f.articleId)" name="check" :size="11" />
              </span>
              <span class="e-fav-body">
                <span class="e-fav-title">{{ f.titre }}</span>
                <span class="e-fav-source">{{ f.source }} · {{ f.date }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div class="e-actions">
        <button type="button" class="btn-ghost" @click="cancel">Annuler</button>
        <button type="button" class="btn-primary" :disabled="!canSave" @click="save">Enregistrer</button>
      </div>
    </section>

    <aside class="e-side">
      <div class="e-side-head">
        <span>Aperçu en direct</span>
        <span class="e-live"><span class="e-live-dot" /> en direct</span>
      </div>
      <p class="e-side-lead">Avec ce descriptif, Le Veilleur vous remonterait aujourd'hui :</p>
      <ApercuList :apercu="apercu" :loading="apercuLoading" />
      <p class="e-side-foot">Précise encore (sources, secteur, type de retour) et l'aperçu se resserre.</p>
    </aside>
  </div>
</template>

<style scoped>
.e-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 392px;
  gap: 0;
  align-items: start;
}
.e-comp {
  padding: 4px 40px 40px 0;
  max-width: 600px;
}
.e-crumb {
  margin-bottom: 22px;
}
.e-crumb button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
.e-crumb button:hover {
  color: var(--color-indigo);
}
.e-field {
  display: block;
  margin-bottom: 18px;
}
.e-flabel {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 8px;
}
.e-name {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--color-rule);
  background: none;
  font-family: var(--font-serif);
  font-size: 24px;
  color: var(--color-ink);
  padding: 4px 0;
}
.e-name:focus {
  outline: none;
  border-bottom-color: var(--color-indigo);
}
.e-colors {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}
.e-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 0.08);
}
.e-swatch.on {
  border-color: var(--color-ink);
}
.e-swatch:focus-visible {
  outline: 2px solid var(--color-indigo-tint);
  outline-offset: 2px;
}
.desced {
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  background: var(--color-paper);
  padding: 12px 14px;
  transition: border-color 0.14s, box-shadow 0.14s;
}
.desced:focus-within {
  border-color: var(--color-indigo);
  box-shadow: 0 0 0 3px var(--color-indigo-tint);
}
.desced-ta {
  width: 100%;
  resize: vertical;
  border: none;
  background: none;
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-ink);
}
.desced-ta:focus {
  outline: none;
}
.e-legend {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12px;
  color: var(--color-ink-4);
  margin-top: 8px;
}
.e-jauge {
  margin: 4px 0 18px;
}
.nudge {
  background: var(--color-amber-tint);
  border: 1px solid var(--color-amber-tint2);
  border-radius: var(--mem-radius-card);
  padding: 12px 14px;
  margin-bottom: 18px;
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-ink-2);
}
.nudge-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-amber);
  display: block;
  margin-bottom: 4px;
}
.nudge-act {
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-indigo);
  padding: 0;
  margin-left: 4px;
}
.e-examples {
  margin-bottom: 18px;
}
.e-ex-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 8px;
}
.e-ex-chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.e-ex-chip {
  border: 1px solid var(--color-rule);
  background: var(--color-bg);
  border-radius: var(--radius-pill);
  padding: 6px 12px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  color: var(--color-ink-2);
  cursor: pointer;
  text-align: left;
}
.e-ex-chip:hover {
  background: var(--color-bg-2);
  color: var(--color-indigo);
}
.e-favs {
  margin-bottom: 18px;
}
.e-favs-head {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
.e-opt {
  color: var(--color-ink-4);
}
.e-fav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.e-fav-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px 6px;
  border-radius: var(--mem-radius-card);
  text-align: left;
}
.e-fav-row:hover {
  background: var(--color-bg-2);
}
.e-fav-check {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid var(--color-ink-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-paper);
  margin-top: 1px;
}
.e-fav-check.on {
  background: var(--color-indigo);
  border-color: var(--color-indigo);
}
.e-fav-title {
  display: block;
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--color-ink);
}
.e-fav-source {
  display: block;
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-top: 2px;
}
.e-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}
.btn-ghost,
.btn-primary {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 9px 16px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  min-height: 36px;
}
.btn-ghost {
  border: 1px solid var(--color-rule);
  background: var(--color-paper);
  color: var(--color-ink-2);
}
.btn-ghost:hover {
  background: var(--color-bg-2);
}
.btn-primary {
  border: 1px solid var(--color-indigo);
  background: var(--color-indigo);
  color: var(--color-paper);
}
.btn-primary:hover {
  background: var(--color-indigo-2);
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.e-side {
  border-left: 1px solid var(--color-rule);
  background: var(--color-bg);
  padding: 4px 0 40px 28px;
  align-self: stretch;
}
.e-side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
.e-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-moss);
}
.e-live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-moss);
}
.e-side-lead {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13.5px;
  color: var(--color-ink-3);
  margin: 12px 0;
}
.e-side-foot {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12px;
  color: var(--color-ink-4);
  margin-top: 14px;
}
@media (max-width: 920px) {
  .e-wrap {
    grid-template-columns: 1fr;
  }
  .e-comp {
    padding-right: 0;
  }
  .e-side {
    border-left: none;
    border-top: 1px solid var(--color-rule);
    padding: 24px 0 0;
  }
}
</style>
