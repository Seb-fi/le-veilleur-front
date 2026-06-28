<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Favori, Note, PisteId } from '../../types'
import { useMemoireStore } from '../../stores/useMemoireStore'
import { useOpenArticle } from '../../composables/useOpenArticle'
import AssociatePopover from './AssociatePopover.vue'
import MemNoteLine from './MemNoteLine.vue'
import MemIcon from './MemIcon.vue'

const props = defineProps<{ favori: Favori }>()
const store = useMemoireStore()
const openArticle = useOpenArticle()

const popOpen = ref(false)
const adding = ref(false)
const newNote = ref('')

const pastilles = computed(() =>
  props.favori.pisteIds
    .map((id) => store.pisteById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p)),
)

const favNotes = computed<Note[]>(() =>
  store.notes.filter((n) => n.kind === 'fav' && n.targetId === props.favori.articleId),
)

function openPiste(id: PisteId) {
  store.openFiche(id)
}

function onNewPiste() {
  popOpen.value = false
  store.openComposer(null)
}

async function submitNote() {
  const text = newNote.value.trim()
  if (!text) {
    adding.value = false
    return
  }
  await store.addNote('fav', props.favori.articleId, text)
  newNote.value = ''
  adding.value = false
}
</script>

<template>
  <article class="fav">
    <div class="fav-meta">
      <span class="fav-source">{{ favori.source }}</span>
      <span class="fav-dot">·</span>
      <span class="fav-date">{{ favori.date }}</span>
    </div>
    <h3
      class="fav-title"
      role="link"
      tabindex="0"
      @click="openArticle(favori.articleId)"
      @keydown.enter="openArticle(favori.articleId)"
    >
      {{ favori.titre }}
    </h3>
    <p class="fav-extrait">{{ favori.extrait }}</p>

    <div class="fav-pistes">
      <button
        v-for="p in pastilles"
        :key="p.id"
        type="button"
        class="pchip"
        @click="openPiste(p.id)"
      >
        <span class="pchip-dot" :style="{ background: `var(--color-${p.couleur})` }" />
        {{ p.nom }}
      </button>

      <div class="assoc-wrap">
        <button
          type="button"
          class="chip-assoc"
          :class="{ unassigned: pastilles.length === 0 }"
          :aria-expanded="popOpen"
          @click="popOpen = !popOpen"
        >
          <MemIcon name="plus" :size="11" />
          {{ pastilles.length === 0 ? 'associer à une piste' : 'associer' }}
        </button>
        <span v-if="pastilles.length === 0" class="unassigned-tag">non associé</span>

        <AssociatePopover
          v-if="popOpen"
          :favori="favori"
          :pistes="store.pistes"
          @toggle="(id) => store.toggleAssociation(favori.articleId, id)"
          @new-piste="onNewPiste"
          @close="popOpen = false"
        />
      </div>
    </div>

    <div v-if="favNotes.length || adding" class="fav-notes">
      <MemNoteLine
        v-for="n in favNotes"
        :key="n.id"
        :note="n"
        @update="(t) => store.updateNote(n.id, t)"
        @delete="store.deleteNote(n.id)"
      />
      <div v-if="adding" class="fav-noteadd">
        <textarea
          v-model="newNote"
          class="fav-noteinput"
          rows="1"
          placeholder="Votre angle sur cet article…"
          aria-label="Nouvelle note"
          @keydown.enter.exact.prevent="submitNote"
          @blur="submitNote"
        />
      </div>
    </div>

    <button v-if="!adding" type="button" class="fav-addnote" @click="adding = true">
      {{ favNotes.length ? 'ajouter une autre note' : 'ajouter une note' }}
    </button>
  </article>
</template>

<style scoped>
.fav {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  box-shadow: var(--shadow-hover);
  padding: 14px 16px;
  transition: box-shadow 0.15s;
}
.fav:hover {
  box-shadow: var(--shadow-popover);
}
.fav-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
.fav-dot {
  color: var(--color-ink-4);
}
.fav-title {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.22;
  letter-spacing: -0.008em;
  color: var(--color-ink);
  margin: 6px 0 6px;
  font-weight: var(--weight-regular);
  cursor: pointer;
}
.fav-title:hover {
  color: var(--color-indigo);
}
.fav-title:focus-visible {
  outline: 2px solid var(--color-indigo-tint);
  border-radius: var(--radius-sm);
}
.fav-extrait {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-ink-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fav-pistes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}
.pchip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-rule);
  background: var(--color-bg);
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  cursor: pointer;
  min-height: 24px;
  transition: background 0.14s;
}
.pchip:hover {
  background: var(--color-bg-2);
}
.pchip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}
.assoc-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.chip-assoc {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px dashed var(--color-ink-4);
  background: none;
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  cursor: pointer;
  min-height: 24px;
  transition: color 0.14s, border-color 0.14s;
}
.chip-assoc:hover {
  color: var(--color-indigo);
  border-color: var(--color-indigo-tint);
}
.chip-assoc.unassigned {
  color: var(--color-amber);
  border-color: var(--color-amber);
}
.unassigned-tag {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-amber);
}
.fav-notes {
  margin-top: 10px;
  border-top: 1px solid var(--color-rule-2);
  padding-top: 4px;
}
.fav-noteinput {
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
.fav-noteinput:focus {
  outline: 2px solid var(--color-indigo-tint);
}
.fav-addnote {
  border: none;
  background: none;
  cursor: pointer;
  margin-top: 8px;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  transition: color 0.14s;
}
.fav-addnote:hover {
  color: var(--color-indigo);
}
</style>
