<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { PopoverPos, PopoverCtx } from '../../composables/usePopover'

const props = defineProps<{
  position: PopoverPos
  context: PopoverCtx | null
  visible: boolean
  newPisteInput: string
}>()

const emit = defineEmits<{
  'close': []
  'confirm-piste': [name: string]
  'action': [act: string, ctx: PopoverCtx]
  'update:newPisteInput': [v: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.visible, async (v) => {
  if (v && props.context?.type === 'empty') {
    await nextTick()
    inputRef.value?.focus()
  }
})

function onConfirmPiste() {
  const name = props.newPisteInput.trim() || 'Nouvelle piste'
  emit('confirm-piste', name)
}

function onInputKey(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    onConfirmPiste()
  }
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="visible && context"
    class="g-action-popover"
    :class="{ show: visible }"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <!-- Empty canvas → new piste -->
    <template v-if="context.type === 'empty'">
      <div class="gap-head">
        <span>Nouveau · espace vide</span>
      </div>
      <div class="gap-input">
        <input
          ref="inputRef"
          type="text"
          placeholder="Nom de la nouvelle piste…"
          maxlength="60"
          :value="newPisteInput"
          @input="emit('update:newPisteInput', ($event.target as HTMLInputElement).value)"
          @keydown="onInputKey"
        />
        <button @click="onConfirmPiste">Créer</button>
      </div>
      <div class="gap-foot">
        Une piste est un fil que vous décidez de suivre.
        <kbd>Esc</kbd> pour annuler.
      </div>
    </template>

    <!-- Article / event entity -->
    <template v-else-if="context.type === 'entity'">
      <div class="gap-head">
        <span>{{ context.kind === 'event' ? 'Évènement' : 'Article' }}</span>
        <span class="gh-ctx">{{ context.label }}</span>
      </div>
      <button class="gap-item primary" @click="emit('action', 'new-note', context)">
        <svg class="gi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Créer une note
      </button>
      <button class="gap-item" @click="emit('action', 'open', context)">
        <svg class="gi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M7 17L17 7M17 7H8M17 7v9"/>
        </svg>
        Ouvrir
      </button>
      <button class="gap-item" @click="emit('action', 'pin-entity', context)">
        <svg class="gi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2v15M9 7l3-5 3 5M8 22h8"/>
        </svg>
        Épingler une note
      </button>
    </template>

    <!-- Note -->
    <template v-else-if="context.type === 'note'">
      <div class="gap-head">
        <span>Note</span>
        <span class="gh-ctx">{{ context.label }}</span>
      </div>
      <button class="gap-item primary" @click="emit('action', 'edit-note', context)">
        <svg class="gi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/>
        </svg>
        Éditer
      </button>
      <button
        class="gap-item"
        :class="{ pinned: context.isPinned }"
        @click="emit('action', 'pin-note', context)"
      >
        <svg class="gi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2v15M9 7l3-5 3 5M8 22h8"/>
        </svg>
        {{ context.isPinned ? 'Désépingler' : 'Épingler' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.g-action-popover {
  position: absolute;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  box-shadow: 0 8px 24px oklch(0% 0 0 / .12), 0 2px 6px oklch(0% 0 0 / .06);
  padding: 4px;
  z-index: 10;
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-3px);
  transition: opacity .14s ease, transform .14s ease, visibility .14s;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.g-action-popover.show {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
}

.gap-head {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  padding: 8px 10px 6px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-rule-2);
  margin-bottom: 3px;
}

.gh-ctx {
  flex: 1;
  color: var(--color-ink-2);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 200px;
}

.gap-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: .06em;
  color: var(--color-ink-2);
  cursor: pointer;
  text-align: left;
  font-weight: var(--weight-medium);
  background: transparent;
  border: none;
  width: 100%;
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}

.gap-item:hover { background: var(--color-bg-2); color: var(--color-ink); }
.gap-item.primary { color: var(--color-indigo); }
.gap-item.primary:hover { background: var(--color-indigo-tint); }
.gap-item.pinned { color: var(--color-amber); }
.gi-ico { width: 13px; height: 13px; flex: none; color: currentColor; }

.gap-input {
  padding: 6px 8px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gap-input input {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: 3px;
  padding: 7px 10px;
  font-family: var(--font-sans);
  font-size: 13px;
  outline: none;
  color: var(--color-ink);
  min-width: 0;
}

.gap-input input:focus { border-color: var(--color-ink-3); }

.gap-input button {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .16em;
  text-transform: uppercase;
  background: var(--color-ink);
  color: var(--color-bg);
  padding: 7px 11px;
  border-radius: 3px;
  font-weight: var(--weight-medium);
  flex: none;
  border: none;
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out);
}

.gap-input button:hover { background: var(--color-indigo); }

.gap-foot {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-4);
  letter-spacing: .16em;
  text-transform: uppercase;
  padding: 6px 10px 8px;
  border-top: 1px dashed var(--color-rule-2);
  margin-top: 3px;
  font-weight: var(--weight-medium);
  line-height: 1.4;
}

.gap-foot kbd {
  font-family: var(--font-mono);
  background: var(--color-bg-2);
  border: 1px solid var(--color-rule-2);
  border-radius: 2px;
  padding: 1px 5px;
  letter-spacing: 0;
  font-size: 9.5px;
  color: var(--color-ink-3);
}
</style>
