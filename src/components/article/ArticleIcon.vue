<script setup lang="ts">
// Jeu d'icônes de la page détail article (stroke 1.6, viewBox 24). Équivalents Lucide —
// transposition du composant `Ico` du proto React (handoff design), pas les SVG portés tels quels.
export type ArticleIconName =
  | 'back' | 'chev' | 'article' | 'layers' | 'thesis' | 'note' | 'plus' | 'check'
  | 'x' | 'star' | 'up' | 'down' | 'piste' | 'link' | 'ext' | 'light' | 'entity'
  | 'swap' | 'info' | 'trend' | 'flat' | 'share'

defineProps<{ name: ArticleIconName; size?: number; fill?: boolean }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 24 24"
    :fill="fill ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'back'"><path d="M15 5l-7 7 7 7" /></template>
    <template v-else-if="name === 'chev'"><path d="M9 6l6 6-6 6" /></template>
    <template v-else-if="name === 'article'">
      <path d="M5 4h11l3 3v13H5z" /><path d="M16 4v3h3M8 11h8M8 14h8M8 17h5" />
    </template>
    <template v-else-if="name === 'layers'">
      <path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" />
    </template>
    <template v-else-if="name === 'thesis'">
      <path d="M12 3l2.2 5.6L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.4z" />
    </template>
    <template v-else-if="name === 'note'">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'check'"><path d="M5 12.5l4.5 4.5L19 6.5" /></template>
    <template v-else-if="name === 'x'"><path d="M6 6l12 12M18 6L6 18" /></template>
    <template v-else-if="name === 'star'">
      <path d="M12 3.5l2.5 5.9 6.4.5-4.9 4.2 1.5 6.2L12 17l-5.5 3.5 1.5-6.2-4.9-4.2 6.4-.5z" />
    </template>
    <template v-else-if="name === 'up'">
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0l4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 18.8 20H7" />
    </template>
    <template v-else-if="name === 'down'">
      <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3zm0 0l-4 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 4H17" />
    </template>
    <template v-else-if="name === 'piste'">
      <path d="M3 6.5h7l2 2h9v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </template>
    <template v-else-if="name === 'link'">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </template>
    <template v-else-if="name === 'ext'">
      <path d="M14 5h5v5M19 5l-8 8M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </template>
    <template v-else-if="name === 'light'">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.2-1 2.5H9c0-1.3-.3-1.8-1-2.5A6 6 0 0 1 12 3z" />
    </template>
    <template v-else-if="name === 'entity'">
      <circle cx="12" cy="7" r="3" /><circle cx="5" cy="17" r="2.4" /><circle cx="19" cy="17" r="2.4" />
      <path d="M10 9.5L6.5 15M14 9.5L17.5 15" />
    </template>
    <template v-else-if="name === 'swap'">
      <path d="M4 8h13M14 5l3 3-3 3M20 16H7M10 13l-3 3 3 3" />
    </template>
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
    </template>
    <template v-else-if="name === 'trend'"><path d="M4 16l5-5 4 3 6-7M16 7h3v3" /></template>
    <template v-else-if="name === 'flat'"><path d="M4 12h16" /></template>
    <template v-else-if="name === 'share'">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </template>
  </svg>
</template>
