<script setup lang="ts">
defineProps<{
  axisOptions: string[]
  sortOptions: string[]
  axisFilter: string
  sortOrder: string
  searchQuery: string
}>()

const emit = defineEmits<{
  'update:axisFilter': [value: string]
  'update:sortOrder': [value: string]
  'update:searchQuery': [value: string]
}>()

function axisCounts(axis: string): number {
  const COUNTS: Record<string, number> = {
    'Tous': 247,
    'Signaux faibles': 38,
    'Pro · Data': 62,
    'Pro · Dev': 71,
    'Pro · Boulot': 44,
  }
  return COUNTS[axis] ?? 0
}
</script>

<template>
  <div class="filters">
    <div class="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        :value="searchQuery"
        type="text"
        placeholder="Rechercher…"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
      <kbd>/</kbd>
    </div>

    <div class="fbar">
      <span class="fbar-label">Axe</span>
      <button
        v-for="opt in axisOptions"
        :key="opt"
        class="fbtn"
        :class="{ on: axisFilter === opt }"
        @click="emit('update:axisFilter', opt)"
      >
        {{ opt }}
        <span class="count">{{ axisCounts(opt) }}</span>
      </button>
    </div>

    <div class="fbar sort-bar">
      <span class="fbar-label">Tri</span>
      <button
        v-for="opt in sortOptions"
        :key="opt"
        class="fbtn"
        :class="{ on: sortOrder === opt }"
        @click="emit('update:sortOrder', opt)"
      >
        {{ opt }}{{ opt === 'Score' ? ' ↓' : '' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  padding: 14px 32px;
  border-bottom: var(--border-rule);
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 2;
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 380px;
  padding: 8px 12px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  transition: border-color var(--motion-quick) var(--ease-out);
}

.search:focus-within {
  border-color: var(--color-ink-3);
}

.search svg {
  width: 14px;
  height: 14px;
  color: var(--color-ink-3);
  flex: none;
}

.search input {
  flex: 1;
  background: none;
  border: 0;
  outline: 0;
  font-size: 13px;
  color: var(--color-ink);
  font-family: var(--font-sans);
}

.search input::placeholder {
  color: var(--color-ink-4);
}

.search kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  padding: 1px 5px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-rule);
  border-radius: 3px;
}

.fbar {
  display: flex;
  gap: 4px;
  align-items: center;
}

.sort-bar {
  margin-left: auto;
}

.fbar-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-right: 4px;
}

.fbtn {
  padding: 6px 10px;
  font-size: 12.5px;
  font-family: var(--font-sans);
  color: var(--color-ink-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.fbtn:hover {
  background: var(--color-bg-2);
}

.fbtn.on {
  background: var(--color-ink);
  color: var(--color-bg);
}

.count {
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: 0.6;
}
</style>
