<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useMemoireStore } from '../../stores/useMemoireStore'
import { useOpenArticle } from '../../composables/useOpenArticle'
import type { Apercu, Note, ArticleId } from '../../types'
import ApercuList from './ApercuList.vue'
import AssociateFavoriPopover from './AssociateFavoriPopover.vue'
import MemNoteLine from './MemNoteLine.vue'
import MemIcon from './MemIcon.vue'

const store = useMemoireStore()
const openArticle = useOpenArticle()

const apercu = ref<Apercu | null>(null)
const apercuLoading = ref(false)
const popOpen = ref(false)
const addingNote = ref(false)
const newNote = ref('')

const piste = computed(() => store.currentPiste)

const associatedFavoris = computed(() =>
  piste.value ? store.favorisOf(piste.value.id) : [],
)

const pisteNotes = computed<Note[]>(() =>
  piste.value
    ? store.notes.filter((n) => n.kind === 'piste' && n.targetId === piste.value!.id)
    : [],
)

const multiTheme = ref(false)

async function loadApercu() {
  if (!piste.value) return
  apercuLoading.value = true
  try {
    apercu.value = await store.fetchApercu(piste.value.descriptif)
    multiTheme.value = (await store.computeThemeSpread(piste.value.descriptif)) >= 2
  } finally {
    apercuLoading.value = false
  }
}

onMounted(loadApercu)
watch(() => piste.value?.id, loadApercu)

function toggleFavori(articleId: ArticleId) {
  if (piste.value) store.toggleAssociation(articleId, piste.value.id)
}

async function submitNote() {
  const text = newNote.value.trim()
  if (!text || !piste.value) {
    addingNote.value = false
    return
  }
  await store.addNote('piste', piste.value.id, text)
  newNote.value = ''
  addingNote.value = false
}
</script>

<template>
  <div v-if="piste" class="b-wrap">
    <article class="b-doc">
      <nav class="b-crumb">
        <button type="button" @click="store.goPistes()">Pistes</button>
        <MemIcon name="chev" :size="11" />
        <span>{{ piste.nom }}</span>
      </nav>

      <h1 class="b-title">
        <span class="b-tdot" :style="{ background: `var(--color-${piste.couleur})` }" />
        {{ piste.nom }}
      </h1>
      <div class="b-overline">Axe de recherche · rédigé par vous</div>

      <div class="b-intent">
        <div class="b-intent-label">L'intention de cette piste</div>
        <blockquote class="b-quote">« {{ piste.descriptif }} »</blockquote>
      </div>

      <ul class="b-margins">
        <li>{{ multiTheme ? '⚠ Plusieurs axes ?' : '✓ Un seul axe' }}</li>
        <li>✓ Langage naturel</li>
        <li>⚲ Affiner le descriptif change les sources</li>
      </ul>

      <section class="b-apercu">
        <div class="b-apercu-head">Ce que cette piste ramène aujourd'hui</div>
        <ApercuList :apercu="apercu" :loading="apercuLoading" />
      </section>
    </article>

    <aside class="b-rail">
      <div class="b-rail-block">
        <div class="b-rail-head">
          Favoris associés ({{ associatedFavoris.length }})
        </div>
        <ul class="b-favs">
          <li v-for="f in associatedFavoris" :key="f.articleId" class="b-fav">
            <div
              class="b-fav-body"
              role="link"
              tabindex="0"
              @click="openArticle(f.articleId)"
              @keydown.enter="openArticle(f.articleId)"
            >
              <div class="b-fav-title">{{ f.titre }}</div>
              <div class="b-fav-source">{{ f.source }} · {{ f.date }}</div>
            </div>
            <button
              type="button"
              class="b-fav-x"
              aria-label="Dissocier ce favori"
              @click="toggleFavori(f.articleId)"
            >
              <MemIcon name="x" :size="12" />
            </button>
          </li>
          <li v-if="!associatedFavoris.length" class="b-rail-empty">Aucun favori associé.</li>
        </ul>
        <div class="b-assoc-wrap">
          <button type="button" class="b-chip" :aria-expanded="popOpen" @click="popOpen = !popOpen">
            <MemIcon name="plus" :size="11" /> associer un favori
          </button>
          <AssociateFavoriPopover
            v-if="popOpen"
            :piste-id="piste.id"
            :favorites="store.favorites"
            @toggle="toggleFavori"
            @close="popOpen = false"
          />
        </div>
      </div>

      <div class="b-rail-block">
        <div class="b-rail-head">Notes sur la piste ({{ pisteNotes.length }})</div>
        <MemNoteLine
          v-for="n in pisteNotes"
          :key="n.id"
          :note="n"
          @update="(t) => store.updateNote(n.id, t)"
          @delete="store.deleteNote(n.id)"
        />
        <div v-if="addingNote" class="b-noteadd">
          <textarea
            v-model="newNote"
            class="b-noteinput"
            rows="1"
            placeholder="Une note sur cette piste…"
            aria-label="Nouvelle note de piste"
            @keydown.enter.exact.prevent="submitNote"
            @blur="submitNote"
          />
        </div>
        <button v-else type="button" class="b-addnote" @click="addingNote = true">
          ajouter une autre note
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.b-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 0;
  align-items: start;
}
.b-doc {
  padding: 4px 40px 40px 0;
}
.b-doc > * {
  max-width: 680px;
}
.b-crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 22px;
}
.b-crumb button {
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: var(--color-ink-3);
}
.b-crumb button:hover {
  color: var(--color-indigo);
}
.b-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-serif);
  font-size: 34px;
  line-height: 1.04;
  letter-spacing: -0.022em;
  color: var(--color-ink);
  font-weight: var(--weight-regular);
}
.b-tdot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: none;
}
.b-overline {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-indigo);
  margin: 10px 0 24px;
}
.b-intent {
  border-left: 2px solid var(--color-indigo-tint);
  padding-left: 22px;
  margin-bottom: 18px;
}
.b-intent-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 8px;
}
.b-quote {
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.5;
  color: var(--color-ink);
  margin: 0;
}
.b-margins {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 0 0 30px;
  padding: 0;
}
.b-margins li {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: var(--color-ink-3);
}
.b-apercu-head {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 4px;
}
.b-rail {
  border-left: 1px solid var(--color-rule);
  background: var(--color-bg);
  padding: 4px 0 40px 28px;
  align-self: stretch;
}
.b-rail-block {
  margin-bottom: 28px;
}
.b-rail-head {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 12px;
}
.b-favs {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
}
.b-fav {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-rule-2);
}
.b-fav-body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.b-fav-body:hover .b-fav-title {
  color: var(--color-indigo);
}
.b-fav-body:focus-visible {
  outline: 2px solid var(--color-indigo-tint);
  border-radius: var(--radius-sm);
}
.b-fav-title {
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.3;
  color: var(--color-ink);
}
.b-fav-source {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-top: 3px;
}
.b-fav-x {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-ink-4);
  padding: 4px;
  opacity: 0;
  transition: opacity 0.14s, color 0.14s;
}
.b-fav:hover .b-fav-x {
  opacity: 1;
}
.b-fav-x:hover,
.b-fav-x:focus-visible {
  color: var(--color-rose);
  opacity: 1;
  outline: none;
}
.b-rail-empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12.5px;
  color: var(--color-ink-4);
}
.b-assoc-wrap {
  position: relative;
}
.b-chip,
.b-addnote {
  border: 1px dashed var(--color-ink-4);
  background: none;
  cursor: pointer;
  border-radius: var(--radius-pill);
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
}
.b-chip:hover,
.b-addnote:hover {
  color: var(--color-indigo);
  border-color: var(--color-indigo-tint);
}
.b-noteinput {
  width: 100%;
  resize: none;
  border: none;
  background: var(--color-bg-2);
  border-radius: var(--mem-radius-card);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-ink-2);
  padding: 6px 8px;
}
.b-noteinput:focus {
  outline: 2px solid var(--color-indigo-tint);
}
@media (max-width: 920px) {
  .b-wrap {
    grid-template-columns: 1fr;
  }
  .b-doc {
    padding-right: 0;
  }
  .b-rail {
    border-left: none;
    border-top: 1px solid var(--color-rule);
    padding: 24px 0 0;
  }
}
</style>
