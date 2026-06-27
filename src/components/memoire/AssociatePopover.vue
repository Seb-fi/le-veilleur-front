<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { Favori, Piste, PisteId } from '../../types'
import MemIcon from './MemIcon.vue'

const props = defineProps<{ favori: Favori; pistes: Piste[] }>()
const emit = defineEmits<{
  (e: 'toggle', pisteId: PisteId): void
  (e: 'new-piste'): void
  (e: 'close'): void
}>()

const root = ref<HTMLElement | null>(null)

function isChecked(id: PisteId): boolean {
  return props.favori.pisteIds.includes(id)
}

function onPointerDown(ev: PointerEvent) {
  if (root.value && !root.value.contains(ev.target as Node)) emit('close')
}
function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') emit('close')
}
onMounted(() => {
  // Différé d'un tick pour ne pas capter le clic qui a ouvert le popover.
  setTimeout(() => document.addEventListener('pointerdown', onPointerDown), 0)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="pop" role="dialog" aria-label="Associer à une ou plusieurs pistes">
    <div class="pop-title">Associer à une ou plusieurs pistes…</div>
    <ul class="pop-list">
      <li v-for="p in pistes" :key="p.id">
        <button
          type="button"
          class="pop-row"
          role="checkbox"
          :aria-checked="isChecked(p.id)"
          @click="emit('toggle', p.id)"
        >
          <span class="pop-check" :class="{ on: isChecked(p.id) }">
            <MemIcon v-if="isChecked(p.id)" name="check" :size="11" />
          </span>
          <span class="pop-dot" :style="{ background: `var(--color-${p.couleur})` }" />
          <span class="pop-name">{{ p.nom }}</span>
        </button>
      </li>
    </ul>
    <button type="button" class="pop-new" @click="emit('new-piste')">
      <MemIcon name="plus" :size="12" /> Nouvelle piste…
    </button>
  </div>
</template>

<style scoped>
.pop {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  width: 264px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-pop);
  box-shadow: var(--shadow-popover);
  padding: 12px;
}
.pop-title {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 8px;
}
.pop-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 240px;
  overflow-y: auto;
}
.pop-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 7px 6px;
  border-radius: var(--mem-radius-card);
  min-height: 32px;
  text-align: left;
  transition: background 0.14s;
}
.pop-row:hover {
  background: var(--color-bg-2);
}
.pop-row:focus-visible {
  outline: 2px solid var(--color-indigo-tint);
  outline-offset: 1px;
}
.pop-check {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid var(--color-ink-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-paper);
  background: var(--color-paper);
}
.pop-check.on {
  background: var(--color-indigo);
  border-color: var(--color-indigo);
}
.pop-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.pop-name {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-ink);
}
.pop-new {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  margin-top: 6px;
  padding: 7px 6px;
  border-top: 1px solid var(--color-rule-2);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-indigo);
}
.pop-new:hover {
  color: var(--color-indigo-2);
}
</style>
