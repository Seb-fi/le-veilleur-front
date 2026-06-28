<script setup lang="ts">
import { ref } from 'vue'
import type { Note } from '../../types'
import { useAutosize } from '../../composables/useAutosize'
import ArticleIcon from './ArticleIcon.vue'

// Carte de commentaire en marge (façon Docs), PRD §6.3 / §5. Éditable (le texte du
// commentaire) ; l'ancre n'est pas ré-éditable au MVP (§9.1). `orphan` = ancrage perdu
// (gate (c)) : la carte est conservée, signalée, jamais supprimée.
const props = defineProps<{ note: Note; active: boolean; orphan: boolean }>()
const emit = defineEmits<{
  (e: 'update', texte: string): void
  (e: 'delete'): void
  (e: 'focus'): void
}>()

const ta = ref<HTMLTextAreaElement | null>(null)
const draft = ref(props.note.texte)
useAutosize(ta, () => draft.value)

function commit() {
  const next = draft.value.trim()
  if (next !== props.note.texte) emit('update', next)
}
</script>

<template>
  <div
    class="ccard"
    :class="{ active }"
    role="group"
    :aria-label="`Commentaire : ${note.anchor?.quote ?? ''}`"
    @click="emit('focus')"
  >
    <div class="ccard-head">
      <span class="ccard-av" aria-hidden="true">CV</span>
      <span class="ccard-date">{{ note.updatedAt }}</span>
      <button
        class="ccard-del"
        type="button"
        aria-label="Supprimer le commentaire"
        @click.stop="emit('delete')"
      >
        <ArticleIcon name="x" :size="13" />
      </button>
    </div>
    <p v-if="orphan" class="ccard-orphan" title="Le passage commenté n’a pas été retrouvé dans le texte actuel">
      <ArticleIcon name="info" :size="11" /> ancrage perdu
    </p>
    <blockquote class="ccard-quote">« {{ note.anchor?.quote }} »</blockquote>
    <textarea
      ref="ta"
      v-model="draft"
      class="ccard-text"
      rows="1"
      placeholder="Votre commentaire…"
      aria-label="Commentaire sur ce passage"
      @focus="emit('focus')"
      @blur="commit"
    />
  </div>
</template>

<style scoped>
.ccard {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-hover);
  padding: 11px 13px;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.14s, border-color 0.14s;
}
.ccard.active {
  border-color: var(--color-amber);
  box-shadow: var(--shadow-popover);
}
.ccard::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 14px;
  width: 24px;
  height: 1px;
  background: var(--color-amber-tint2);
}
.ccard-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ccard-av {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-steel-tint);
  color: var(--color-steel);
  display: grid;
  place-items: center;
  font-family: var(--font-serif);
  font-size: 9px;
  flex: none;
}
.ccard-date {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--color-ink-4);
  margin-left: auto;
}
.ccard-del {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-ink-5);
  display: flex;
  padding: 2px;
}
.ccard-del:hover,
.ccard-del:focus-visible {
  color: var(--color-rose);
  outline: none;
}
.ccard-orphan {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 6px;
}
.ccard-quote {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--color-ink-4);
  border-left: 2px solid var(--color-amber);
  padding-left: 8px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ccard-text {
  width: 100%;
  resize: none;
  border: none;
  background: none;
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-ink);
  padding: 0;
  overflow: hidden;
}
.ccard-text:focus {
  outline: none;
}
.ccard-text::placeholder {
  color: var(--color-ink-4);
  font-style: italic;
}
</style>
