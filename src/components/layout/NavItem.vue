<script setup lang="ts">
defineProps<{
  to: string
  sub?: boolean
  dot?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="nav-item"
    :class="{ 'nav-item--sub': sub }"
    exact-active-class="nav-item--active"
  >
    <span v-if="$slots.icon" class="nav-item__ico">
      <slot name="icon" />
    </span>
    <slot />
    <span v-if="dot" class="nav-item__dot" />
  </RouterLink>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-2);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: var(--weight-regular);
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
  position: relative;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--color-bg-2);
  color: var(--color-ink);
}

.nav-item--sub {
  padding-left: 30px;
  color: var(--color-ink-3);
  font-size: 13px;
}

.nav-item--active {
  background: var(--color-paper);
  color: var(--color-ink);
  font-weight: var(--weight-medium);
  box-shadow: inset 0 0 0 1px var(--color-rule);
}

.nav-item--active::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-indigo);
  border-radius: 0 2px 2px 0;
}

.nav-item__ico {
  width: 16px;
  height: 16px;
  flex: none;
  color: var(--color-ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item--active .nav-item__ico {
  color: var(--color-indigo);
}

.nav-item__dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: 0 0 0 3px oklch(68% 0.12 75 / 0.15);
  flex: none;
}
</style>
