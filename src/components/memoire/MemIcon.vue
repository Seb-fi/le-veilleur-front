<script setup lang="ts">
// Jeu d'icônes minimal de la Mémoire active (stroke 1.6, viewBox 24).
// Équivalents Lucide/Phosphor — pas les SVG inline du proto React.
export type IconName =
  | 'search' | 'filter' | 'note' | 'plus' | 'check' | 'x'
  | 'article' | 'piste' | 'mem' | 'spark' | 'chev' | 'pen' | 'arrow'

defineProps<{ name: IconName; size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 14"
    :height="size ?? 14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" />
    </template>
    <template v-else-if="name === 'filter'">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </template>
    <template v-else-if="name === 'note' || name === 'pen'">
      <path d="M14 4l6 6M4 20l1-4L16 5l3 3L8 19z" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </template>
    <template v-else-if="name === 'x'">
      <path d="M6 6l12 12M18 6L6 18" />
    </template>
    <template v-else-if="name === 'article'">
      <path d="M5 4h11l3 3v13H5z" /><path d="M16 4v3h3M8 11h8M8 14h8M8 17h5" />
    </template>
    <template v-else-if="name === 'piste'">
      <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </template>
    <template v-else-if="name === 'mem'">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="6.5" opacity=".55" />
      <circle cx="12" cy="12" r="10.5" opacity=".28" />
    </template>
    <template v-else-if="name === 'spark'">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </template>
    <template v-else-if="name === 'chev'">
      <path d="M9 6l6 6-6 6" />
    </template>
    <template v-else-if="name === 'arrow'">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </template>
  </svg>
</template>
