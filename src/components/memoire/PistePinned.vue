<script setup lang="ts">
import type { Note } from '../../types'

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{ 'edit': [note: Note] }>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function renderBody(body: string): string {
  return body.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
}
</script>

<template>
  <blockquote class="piste-pinned">
    <div class="pin-mark">
      <svg class="pin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M12 2v15M9 7l3-5 3 5M8 22h8" />
      </svg>
      Note épinglée
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="renderBody(note.body)" />
    <div class="pin-foot">
      <span>{{ formatDate(note.createdAt) }} · épinglée par vous</span>
      <button class="pf-edit" @click="emit('edit', note)">Éditer</button>
    </div>
  </blockquote>
</template>

<style scoped>
.piste-pinned {
  background: oklch(97.5% 0.015 80);
  border: 1px solid oklch(89% 0.025 80);
  border-left: 2px solid var(--color-amber);
  border-radius: 0 3px 3px 0;
  padding: 20px 24px 18px;
  margin-bottom: 36px;
  position: relative;
}

.pin-mark {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-amber);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: var(--weight-medium);
}

.pin-mark::before {
  content: "";
  width: 14px;
  height: 1px;
  background: var(--color-amber);
}

.pin-ico {
  width: 11px;
  height: 11px;
}

.piste-pinned p {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.5;
  color: var(--color-ink);
  font-style: italic;
  text-wrap: pretty;
  font-weight: 400;
  margin: 0;
}

.piste-pinned :deep(b) {
  font-style: normal;
  font-weight: var(--weight-medium);
}

.pin-foot {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.pf-edit {
  margin-left: auto;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 9.5px;
  color: var(--color-ink-3);
  font-family: var(--font-mono);
  background: none;
  border: none;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.pf-edit:hover { background: var(--color-paper); color: var(--color-ink); }
</style>
