<script setup lang="ts">
defineProps<{
  name: string
  email: string
  initials: string
}>()
</script>

<template>
  <div class="account">
    <div class="avatar">{{ initials }}</div>
    <div class="account-info">
      <div class="account-name">{{ name }}</div>
      <div class="account-mail">{{ email }}</div>
    </div>
    <svg class="account-more" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
      <circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  </div>
</template>

<style scoped>
.account {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 10px 10px;
  margin-top: 8px;
  border-top: var(--border-thin);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--motion-quick) var(--ease-out);
}

.account:hover {
  background: var(--color-bg-2);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-indigo) 0%, oklch(48% 0.09 285) 100%);
  color: white;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: var(--weight-medium);
  display: grid;
  place-items: center;
  flex: none;
  letter-spacing: 0;
  user-select: none;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--weight-medium);
  line-height: 1.2;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-mail {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-more {
  width: 14px;
  height: 14px;
  color: var(--color-ink-4);
  flex: none;
}
</style>
