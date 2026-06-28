<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Note, PisteId } from '../../types'
import { useMemoireStore } from '../../stores/useMemoireStore'
import { useAutosize } from '../../composables/useAutosize'
import { useOpenArticle } from '../../composables/useOpenArticle'
import MemIcon from './MemIcon.vue'

const props = defineProps<{ note: Note }>()
const store = useMemoireStore()
const openArticle = useOpenArticle()

const ta = ref<HTMLTextAreaElement | null>(null)
const draft = ref(props.note.texte)
useAutosize(ta, () => draft.value)

const isFav = computed(() => props.note.kind === 'fav')

const article = computed(() =>
  isFav.value ? store.favoriById(props.note.targetId as import('../../types').ArticleId) : undefined,
)

const derivedPistes = computed(() =>
  store
    .derivedPistesOfNote(props.note)
    .map((id) => store.pisteById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p)),
)

const ownerPiste = computed(() =>
  !isFav.value ? store.pisteById(props.note.targetId as PisteId) : undefined,
)

function commit() {
  const next = draft.value.trim()
  if (next && next !== props.note.texte) store.updateNote(props.note.id, next)
  else draft.value = props.note.texte
}

function openArticlePiste(id: PisteId) {
  store.openFiche(id)
}
</script>

<template>
  <article class="ncard" :class="{ piste: !isFav }">
    <header class="nc-head">
      <span class="nc-badge" :class="isFav ? 'is-fav' : 'is-piste'">
        {{ isFav ? "Note d'article" : 'Note de piste' }}
      </span>
      <span class="nc-date">{{ note.updatedAt }}</span>
      <button type="button" class="nc-del" aria-label="Supprimer la note" @click="store.deleteNote(note.id)">
        <MemIcon name="x" :size="12" />
      </button>
    </header>

    <textarea
      ref="ta"
      v-model="draft"
      class="nc-text"
      rows="1"
      aria-label="Note"
      @blur="commit"
    />

    <div
      v-if="isFav && article"
      class="nc-article"
      role="link"
      tabindex="0"
      @click="openArticle(note.targetId)"
      @keydown.enter="openArticle(note.targetId)"
    >
      <MemIcon name="article" :size="13" />
      <div class="nc-article-body">
        <div class="nc-article-title">{{ article.titre }}</div>
        <div class="nc-article-source">{{ article.source }} · {{ article.date }}</div>
      </div>
    </div>

    <div v-if="isFav && derivedPistes.length" class="nc-pistes">
      <button
        v-for="p in derivedPistes"
        :key="p.id"
        type="button"
        class="nc-pchip"
        @click="openArticlePiste(p.id)"
      >
        <span class="nc-pdot" :style="{ background: `var(--color-${p.couleur})` }" />
        {{ p.nom }}
      </button>
      <span class="nc-via">via l'article</span>
    </div>

    <div v-if="!isFav && ownerPiste" class="nc-pistes">
      <button type="button" class="nc-pchip" @click="openArticlePiste(ownerPiste.id)">
        <span class="nc-pdot" :style="{ background: `var(--color-${ownerPiste.couleur})` }" />
        {{ ownerPiste.nom }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.ncard {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  padding: 13px 15px;
  box-shadow: var(--shadow-hover);
}
.ncard.piste {
  background: var(--color-amber-tint);
}
.nc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.nc-badge {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: var(--radius-sm);
}
.nc-badge.is-fav {
  color: var(--color-indigo);
  background: var(--color-indigo-tint);
}
.nc-badge.is-piste {
  color: var(--color-amber);
  background: var(--color-amber-tint2);
}
.nc-date {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-4);
}
.nc-del {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-ink-4);
  padding: 4px;
  opacity: 0;
  transition: opacity 0.14s, color 0.14s;
}
.ncard:hover .nc-del {
  opacity: 1;
}
.nc-del:hover,
.nc-del:focus-visible {
  color: var(--color-rose);
  opacity: 1;
  outline: none;
}
.nc-text {
  width: 100%;
  resize: none;
  border: none;
  background: none;
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink);
  padding: 0;
  overflow: hidden;
}
.nc-text:focus {
  outline: none;
  background: var(--color-bg-2);
  border-radius: var(--mem-radius-card);
  padding: 4px 6px;
}
.nc-article {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-rule-2);
  border-radius: var(--mem-radius-card);
  cursor: pointer;
  color: var(--color-ink-3);
}
.nc-article:hover {
  border-color: var(--color-indigo-tint);
}
.nc-article-title {
  font-family: var(--font-serif);
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--color-ink-2);
}
.nc-article-source {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-top: 2px;
}
.nc-pistes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}
.nc-pchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--color-rule);
  background: var(--color-paper);
  border-radius: var(--radius-pill);
  padding: 3px 9px;
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  cursor: pointer;
}
.nc-pchip:hover {
  background: var(--color-bg-2);
}
.nc-pdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.nc-via {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11px;
  color: var(--color-ink-4);
}
</style>
