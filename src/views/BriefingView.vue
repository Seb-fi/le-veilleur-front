<script setup lang="ts">
import { onMounted } from 'vue'
import { useBriefingStore } from '../stores/useBriefingStore'
import { useThreadsStore } from '../stores/useThreadsStore'
import { useSerendipityStore } from '../stores/useSerendipityStore'
import BriefingMasthead from '../components/briefing/BriefingMasthead.vue'
import BriefingGreeting from '../components/briefing/BriefingGreeting.vue'
import AudioPlayer from '../components/common/AudioPlayer.vue'
import ThreadsStrip from '../components/briefing/ThreadsStrip.vue'
import ThreadDetailDrawer from '../components/briefing/ThreadDetailDrawer.vue'
import DossierCard from '../components/briefing/DossierCard.vue'
import ArticleSecondCard from '../components/briefing/ArticleSecondCard.vue'
import BrevesSection from '../components/briefing/BrevesSection.vue'
import FaiblesSection from '../components/briefing/FaiblesSection.vue'
import PrevBriefings from '../components/briefing/PrevBriefings.vue'

const store = useBriefingStore()
const threadsStore = useThreadsStore()
const serendipityStore = useSerendipityStore()
onMounted(() => {
  store.load()
  threadsStore.load()
  serendipityStore.load()
})
</script>

<template>
  <div class="brief-page">
    <div v-if="store.loading" class="brief-loading">
      <span>Chargement…</span>
    </div>

    <div v-else-if="store.data" class="brief">
      <BriefingMasthead
        :edition="store.data.edition"
        :date="store.data.date"
        :time="store.data.time"
      />

      <BriefingGreeting
        :name="store.data.greetingName"
        :sources-scanned="store.data.sourcesScanned"
        :signal-count="store.data.signalCount"
        :read-minutes="store.data.readMinutes"
        :active-thread="store.data.activeThread"
      />

      <AudioPlayer
        :title="store.data.audioTitle"
        :duration="store.data.audioDuration"
        :edition="store.data.date"
        :filesize="store.data.audioSize"
      />

      <!-- Fils réels (S2 /threads). Omis si vide/cold-start — jamais moqué en prod. -->
      <ThreadsStrip
        v-if="threadsStore.threads.length"
        :threads="threadsStore.threads"
        @select="threadsStore.openDetail"
      />

      <!-- Dossier du jour -->
      <div class="kicker">
        <span class="kicker-l">— Pourquoi ce sujet aujourd'hui —</span>
      </div>

      <div class="card-grid">
        <DossierCard :dossier="store.data.dossier" />
        <ArticleSecondCard
          v-for="article in store.data.alsoArticles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Brèves -->
      <div class="kicker">
        <span class="kicker-l">— Brèves —</span>
      </div>
      <BrevesSection :breves="store.data.breves" />

      <!-- Signaux faibles · à la frontière (sérendipité réelle, omise si vide) -->
      <template v-if="serendipityStore.items.length">
        <div class="kicker">
          <span class="kicker-l">— Détection précoce · signaux faibles —</span>
        </div>
        <FaiblesSection :faibles="serendipityStore.items" />
      </template>

      <!-- Briefings précédents -->
      <div class="kicker" style="margin-top: 64px">
        <span class="kicker-l">— Briefings précédents —</span>
      </div>
      <PrevBriefings :prev-briefings="store.data.prevBriefings" />

      <footer class="coda">
        <div>Fin d'édition · {{ store.data.date }} · {{ store.data.time }} · Prochaine édition demain 06:14</div>
        <div class="coda-title">
          Pour creuser un sujet, ouvrir
          <RouterLink to="/explorer/articles">l'Explorer</RouterLink>.
        </div>
      </footer>
    </div>

    <ThreadDetailDrawer
      :detail="threadsStore.detail"
      :loading="threadsStore.detailLoading"
      @close="threadsStore.closeDetail"
    />
  </div>
</template>

<style scoped>
.brief-page {
  position: relative;
  z-index: 1;
}

.brief-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-family: var(--font-mono);
  font-size: var(--type-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-4);
}

.brief {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px 120px;
}

.kicker {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 64px 0 24px;
}

.kicker::before,
.kicker::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}

.kicker-l {
  color: var(--color-indigo);
  font-weight: var(--weight-medium);
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.coda {
  margin-top: 80px;
  padding-top: 32px;
  border-top: 2px solid var(--color-ink);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}

.coda-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  color: var(--color-ink-2);
  letter-spacing: 0;
  text-transform: none;
}

.coda-title a {
  color: var(--color-indigo);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 0.5px;
}
</style>
