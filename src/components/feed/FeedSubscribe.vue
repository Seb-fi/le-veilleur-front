<script setup lang="ts">
// « Mon flux audio » (PRD « Flux podcast audio per-user », §5.4 / §5.6).
// Pattern gestionnaire de packages : un onglet par app, chacun = action clic-1
// best-effort (deep-link, schémas custom marqués to_verify) + repli copier-coller
// GARANTI. Critère de réussite honnête (A3) : s'abonner sans auto-mail, parcours
// guidé ; le copier-coller n'est jamais bloquant.
import { ref, computed, onMounted } from 'vue'
import { useFeedStore } from '../../stores/useFeedStore'
import type { SubscribeApp } from '../../api/feed'

const store = useFeedStore()
onMounted(() => store.load())

interface AppTab {
  id: SubscribeApp
  label: string
  platform: string
  // Construit le deep-link clic-1 (schéma custom, to_verify) ; null = copier-coller
  // uniquement (ex. AntennaPod : intent « ouvrir avec »).
  deepLink: ((feedUrl: string) => string) | null
  // Instruction de repli affichée sous le bouton.
  hint: string
}

// feedURL = l'URL du flux SANS le préfixe https:// (convention deep-links §5.4).
function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '')
}

const TABS: AppTab[] = [
  {
    id: 'apple',
    label: 'Apple Podcasts',
    platform: 'iPhone',
    deepLink: (u) => `podcast://${stripScheme(u)}`,
    hint: 'Ouvre Apple Podcasts. Si rien ne se passe, copiez l’URL puis Bibliothèque → … → Ajouter un podcast par URL.',
  },
  {
    id: 'podcastaddict',
    label: 'Podcast Addict',
    platform: 'Android · iOS',
    deepLink: (u) => `podcastaddict://${stripScheme(u)}`,
    hint: 'Ouvre Podcast Addict. Sinon, copiez l’URL puis + → Ajouter un flux RSS.',
  },
  {
    id: 'pocketcasts',
    label: 'Pocket Casts',
    platform: 'iOS · Android · Web',
    deepLink: (u) => `pktc://subscribe/${stripScheme(u)}`,
    hint: 'Ouvre Pocket Casts. Sinon, copiez l’URL puis Profil → Flux par URL.',
  },
  {
    id: 'overcast',
    label: 'Overcast',
    platform: 'iOS',
    deepLink: (u) => `overcast://x-callback-url/add?url=${encodeURIComponent(u)}`,
    hint: 'Ouvre Overcast. Sinon, copiez l’URL puis + → Add URL.',
  },
  {
    id: 'podcastguru',
    label: 'Podcast Guru',
    platform: 'iOS · Android',
    deepLink: (u) => `podcastguru://${stripScheme(u)}`,
    hint: 'Ouvre Podcast Guru. Sinon, copiez l’URL puis Ajouter par URL.',
  },
  {
    id: 'autre',
    label: 'AntennaPod',
    platform: 'Android',
    deepLink: null,
    hint: 'Copiez l’URL, puis dans AntennaPod : + → Ajouter un podcast par URL RSS.',
  },
  {
    id: 'autre',
    label: 'Autre lecteur',
    platform: 'tout lecteur',
    deepLink: null,
    hint: 'Collez cette URL dans « Ajouter un podcast par URL » de votre application.',
  },
]

const activeIndex = ref(0)
const activeTab = computed<AppTab>(() => TABS[activeIndex.value])
const feedUrl = computed(() => store.feedUrl)

const copied = ref(false)
const showRegenerateConfirm = ref(false)
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

function flash(msg: string): void {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2400)
}

async function copyUrl(): Promise<void> {
  const url = feedUrl.value
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
    flash('URL du flux copiée')
  } catch {
    flash('Copie impossible — sélectionnez l’URL manuellement')
  }
  store.intent(activeTab.value.id, 'copy_url')
}

function openDeepLink(): void {
  const url = feedUrl.value
  const tab = activeTab.value
  if (!url || !tab.deepLink) return
  store.intent(tab.id, 'deeplink_tap')
  // Navigation vers un schéma custom : best-effort (peut échouer silencieusement si
  // l'app n'est pas installée → le copier-coller reste le chemin garanti).
  window.location.href = tab.deepLink(url)
}

async function onGenerate(): Promise<void> {
  // 1er affichage sans token : on GÉNÈRE via regenerate (jamais via un GET, INV-F3).
  try {
    await store.regenerate()
    flash('Flux audio créé')
  } catch {
    flash('Échec de la création du flux')
  }
}

async function onRegenerate(): Promise<void> {
  try {
    await store.regenerate()
    showRegenerateConfirm.value = false
    flash('Nouveau flux généré — l’ancien lien est désactivé')
  } catch {
    flash('Échec de la régénération')
  }
}
</script>

<template>
  <section class="feed">
    <div class="feed-head">
      <div class="ps-label feed-label">Mon flux audio</div>
      <p class="feed-intro">
        Écoutez votre briefing en voiture, mains-libres, comme un podcast privé.
        Abonnez votre application : votre briefing du matin s’y ajoute chaque jour,
        sans auto-envoi par e-mail.
      </p>
    </div>

    <div v-if="store.loading" class="feed-state">Chargement de votre flux…</div>

    <!-- Aucun token actif : on propose de générer (création via regenerate, jamais GET). -->
    <div v-else-if="store.loaded && !feedUrl" class="feed-empty">
      <p class="feed-empty__text">
        Vous n’avez pas encore de flux audio. Générez-en un pour vous abonner depuis
        votre application de podcast.
      </p>
      <button
        type="button"
        class="feed-btn feed-btn--primary"
        :aria-disabled="store.regenerating"
        :disabled="store.regenerating"
        @click="onGenerate"
      >
        {{ store.regenerating ? 'Création…' : 'Générer mon flux audio' }}
      </button>
    </div>

    <template v-else-if="feedUrl">
      <!-- Onglets par application (priorisés marché FR). -->
      <div class="feed-tabs" role="tablist" aria-label="Applications de podcast">
        <button
          v-for="(tab, i) in TABS"
          :key="tab.label"
          type="button"
          role="tab"
          class="feed-tab"
          :class="{ 'feed-tab--active': i === activeIndex }"
          :aria-selected="i === activeIndex"
          @click="activeIndex = i"
        >
          <span class="feed-tab__name">{{ tab.label }}</span>
          <span class="feed-tab__plat">{{ tab.platform }}</span>
        </button>
      </div>

      <div class="feed-panel" role="tabpanel">
        <!-- Clic-1 best-effort (deep-link, to_verify) si disponible. -->
        <button
          v-if="activeTab.deepLink"
          type="button"
          class="feed-btn feed-btn--primary"
          @click="openDeepLink"
        >
          Ouvrir dans {{ activeTab.label }}
        </button>
        <p v-if="activeTab.deepLink" class="feed-hint feed-hint--verify">
          Si l’application ne s’ouvre pas, utilisez le copier-coller ci-dessous.
        </p>

        <!-- Repli copier-coller GARANTI : URL brute + bouton Copier. -->
        <div class="feed-url">
          <input
            class="feed-url__input"
            type="text"
            readonly
            :value="feedUrl"
            aria-label="URL de votre flux audio"
            @focus="(e) => (e.target as HTMLInputElement).select()"
          />
          <button
            type="button"
            class="feed-btn feed-btn--copy"
            :class="{ 'feed-btn--copied': copied }"
            @click="copyUrl"
          >
            {{ copied ? 'Copié' : 'Copier' }}
          </button>
        </div>
        <p class="feed-hint">{{ activeTab.hint }}</p>
      </div>

      <!-- Bandeau honnête Spotify / Deezer (A2) + repli vers l'existant. -->
      <p class="feed-banner" role="note">
        <b>Spotify et Deezer</b> n’autorisent pas l’ajout d’un flux par URL : ils ne
        sont pas proposés ici. Vous pouvez écouter votre briefing
        <RouterLink to="/briefing" class="feed-banner__link">sur le portail</RouterLink>
        (lecteur web) ou le télécharger.
      </p>

      <!-- Régénération : invalide l'ancien lien (avertissement explicite). -->
      <div class="feed-rotate">
        <button
          v-if="!showRegenerateConfirm"
          type="button"
          class="feed-btn feed-btn--ghost"
          @click="showRegenerateConfirm = true"
        >
          Régénérer mon flux
        </button>
        <div v-else class="feed-confirm" role="alertdialog" aria-label="Régénérer le flux">
          <p class="feed-confirm__warn">
            Votre ancien lien cessera de fonctionner : vous devrez vous réabonner
            depuis vos applications.
          </p>
          <div class="feed-confirm__actions">
            <button
              type="button"
              class="feed-btn feed-btn--danger"
              :aria-disabled="store.regenerating"
              :disabled="store.regenerating"
              @click="onRegenerate"
            >
              {{ store.regenerating ? 'Régénération…' : 'Confirmer la régénération' }}
            </button>
            <button
              type="button"
              class="feed-btn feed-btn--ghost"
              @click="showRegenerateConfirm = false"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </template>

    <p v-if="store.error" class="feed-err">{{ store.error }}</p>

    <Transition name="feed-toast">
      <div v-if="toast" class="feed-toast" role="status">{{ toast }}</div>
    </Transition>
  </section>
</template>

<style scoped>
.feed {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-rule-2);
}
.feed-label { border-bottom: none; padding-bottom: 0; margin-bottom: 0.6rem; }
.feed-intro {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink-2);
  line-height: 1.55;
  max-width: 44rem;
  margin: 0 0 1.5rem;
}
.feed-state { font-family: var(--font-sans); color: var(--color-ink-3); }

.feed-empty {
  background: var(--color-bg-2);
  border-radius: 14px;
  padding: 1.5rem;
  max-width: 44rem;
}
.feed-empty__text {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink-2);
  margin: 0 0 1.1rem;
  line-height: 1.5;
}

.feed-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.feed-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  min-height: 44px;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--color-rule);
  border-radius: 10px;
  background: var(--color-paper);
  cursor: pointer;
  text-align: left;
}
.feed-tab:hover { border-color: var(--color-ink-4); }
.feed-tab:focus-visible { outline: 2px solid var(--color-indigo); outline-offset: 2px; }
.feed-tab--active {
  border-color: var(--color-indigo);
  background: var(--color-indigo-tint);
}
.feed-tab__name {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}
.feed-tab__plat {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  color: var(--color-ink-3);
}

.feed-panel { max-width: 44rem; }

.feed-url {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.feed-url__input {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-rule);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-ink-2);
}
.feed-url__input:focus-visible { outline: 2px solid var(--color-indigo); outline-offset: 1px; }

.feed-btn {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  min-height: 36px;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
}
.feed-btn:focus-visible { outline: 2px solid var(--color-indigo); outline-offset: 2px; }
.feed-btn[disabled], .feed-btn[aria-disabled='true'] { opacity: 0.55; cursor: default; }
.feed-btn--primary { background: var(--color-ink); color: var(--color-paper); }
.feed-btn--primary:hover:not([disabled]) { background: var(--color-indigo); }
.feed-btn--copy {
  flex: 0 0 auto;
  background: var(--color-paper);
  border-color: var(--color-rule);
  color: var(--color-ink);
}
.feed-btn--copy:hover { border-color: var(--color-ink-4); }
.feed-btn--copied { background: var(--color-moss-tint); border-color: var(--color-moss); color: var(--color-ink); }
.feed-btn--ghost {
  background: transparent;
  border-color: var(--color-rule);
  color: var(--color-ink-2);
}
.feed-btn--ghost:hover { border-color: var(--color-ink-4); color: var(--color-ink); }
.feed-btn--danger { background: var(--color-rose); color: var(--color-paper); }
.feed-btn--danger:hover:not([disabled]) { filter: brightness(1.05); }

.feed-hint {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--color-ink-3);
  line-height: 1.5;
  margin: 0.6rem 0 0;
}
.feed-hint--verify { margin: 0.45rem 0 0.9rem; }

.feed-banner {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--color-ink-2);
  line-height: 1.55;
  max-width: 44rem;
  margin: 1.5rem 0 0;
  padding: 0.85rem 1rem;
  background: var(--color-amber-tint);
  border-radius: 10px;
}
.feed-banner b { color: var(--color-ink); }
.feed-banner__link { color: var(--color-indigo); text-decoration: underline; }

.feed-rotate { margin-top: 1.5rem; }
.feed-confirm {
  max-width: 44rem;
  padding: 1rem;
  border: 1px solid var(--color-rose);
  border-radius: 12px;
  background: var(--color-rose-tint);
}
.feed-confirm__warn {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-ink);
  margin: 0 0 0.9rem;
  line-height: 1.5;
}
.feed-confirm__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.feed-err {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-rose);
  margin-top: 1rem;
}

.feed-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 60;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  padding: 10px 18px;
  border-radius: 10px;
}
.feed-toast-enter-active, .feed-toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.feed-toast-enter-from, .feed-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
