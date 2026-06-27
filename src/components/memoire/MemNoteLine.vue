<script setup lang="ts">
import { ref } from 'vue'
import type { Note } from '../../types'
import { useAutosize } from '../../composables/useAutosize'
import MemIcon from './MemIcon.vue'

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{
  (e: 'update', texte: string): void
  (e: 'delete'): void
}>()

const ta = ref<HTMLTextAreaElement | null>(null)
const draft = ref(props.note.texte)
useAutosize(ta, () => draft.value)

function commit() {
  const next = draft.value.trim()
  if (next && next !== props.note.texte) emit('update', next)
  else draft.value = props.note.texte
}
</script>

<template>
  <div class="fnote">
    <span class="fnote-pen" aria-hidden="true"><MemIcon name="pen" :size="12" /></span>
    <div class="fnote-body">
      <textarea
        ref="ta"
        v-model="draft"
        class="fnote-text"
        rows="1"
        aria-label="Note"
        @blur="commit"
      />
      <span class="fnote-date">{{ note.updatedAt }}</span>
    </div>
    <button class="fnote-del" type="button" aria-label="Supprimer la note" @click="emit('delete')">
      <MemIcon name="x" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.fnote {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 6px 0;
  position: relative;
}
.fnote-pen {
  color: var(--color-amber);
  margin-top: 3px;
  flex: none;
}
.fnote-body {
  flex: 1;
  min-width: 0;
}
.fnote-text {
  width: 100%;
  resize: none;
  border: none;
  background: none;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-ink-2);
  padding: 0;
  overflow: hidden;
}
.fnote-text:focus {
  outline: none;
  background: var(--color-bg-2);
  border-radius: var(--mem-radius-card);
  padding: 4px 6px;
}
.fnote-date {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
  margin-top: 2px;
}
.fnote-del {
  flex: none;
  border: none;
  background: none;
  color: var(--color-ink-4);
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.14s, color 0.14s;
}
.fnote:hover .fnote-del {
  opacity: 1;
}
.fnote-del:hover,
.fnote-del:focus-visible {
  color: var(--color-rose);
  opacity: 1;
  outline: none;
}
</style>
