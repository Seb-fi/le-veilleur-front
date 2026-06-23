<script setup lang="ts">
import { onMounted } from 'vue'
import { useBriefingStore } from '../stores/useBriefingStore'
import { useThreadsStore } from '../stores/useThreadsStore'
import { useSerendipityStore } from '../stores/useSerendipityStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import BriefingMasthead from '../components/briefing/BriefingMasthead.vue'
import BriefingGreeting from '../components/briefing/BriefingGreeting.vue'
import AudioPlayer from '../components/common/AudioPlayer.vue'
import ThreadsStrip from '../components/briefing/ThreadsStrip.vue'
import ThreadDetailDrawer from '../components/briefing/ThreadDetailDrawer.vue'
import BriefingLeadCard from '../components/briefing/BriefingLeadCard.vue'
import ArticleSecondCard from '../components/briefing/ArticleSecondCard.vue'
import BrevesSection from '../components/briefing/BrevesSection.vue'
import FrontieresVeille from '../components/briefing/FrontieresVeille.vue'
import PrevBriefings from '../components/briefing/PrevBriefings.vue'

const store = useBriefingStore()
const threadsStore = useThreadsStore()
const serendipityStore = useSerendipityStore()
const feedback = useFeedbackStore()
onMounted(() => {
  store.load()
  threadsStore.load()
  serendipityStore.load()
})

// % d'écoute audio → /briefings/{date}/listen (date ISO ; ISO-gardé dans le store).
function onListen(percent: number) {
  if (store.data?.briefingDate) feedback.markListen(store.data.briefingDate, percent)
}
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

      <!-- Lecture audio réelle (audio_url) si dispo ; sinon player simulé (mock/design). -->
      <AudioPlayer
        v-if="store.data.hasAudio || store.data.audioTitle"
        :title="store.data.audioTitle"
        :duration="store.data.audioDuration"
        :edition="store.data.date"
        :filesize="store.data.audioSize"
        :src="store.data.audioUrl"
        @listen="onListen"
      />

      <!-- Fils CARVÉS gatés (Phase 2 : scoping A + gate de cohésion). État vide honnête
           (isolation domaine §4.C : rien dans le champ ≠ dump global) plutôt que disparition. -->
      <ThreadsStrip
        v-if="threadsStore.threads.length"
        :threads="threadsStore.threads"
        @select="threadsStore.openDetail"
      />
      <div v-else-if="threadsStore.loaded" class="empty-block">
        <div class="kicker"><span class="kicker-l">— Ce que le système suit pour vous —</span></div>
        <p class="empty-note">Rien n'émerge dans votre champ pour l'instant.</p>
      </div>

      <!-- Dossier du jour — carte omise tant que l'endpoint éditorial S1 n'existe pas. -->
      <div v-if="store.data.dossier" class="kicker">
        <span class="kicker-l">— Pourquoi ce sujet aujourd'hui —</span>
      </div>
      <!-- Sinon, en-tête propre pour la sélection : sépare les articles du bandeau au-dessus
           (sans dossier ni bandeau plein, le bloc paraissait fusionné). -->
      <div v-else-if="store.data.alsoArticles.length" class="kicker">
        <span class="kicker-l">— Sélectionnés pour vous —</span>
      </div>

      <div class="card-grid">
        <BriefingLeadCard v-if="store.data.dossier" :dossier="store.data.dossier" />
        <ArticleSecondCard
          v-for="article in store.data.alsoArticles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Brèves — omises si pas de source (pas de fabrication en prod). -->
      <template v-if="store.data.breves.length">
        <div class="kicker">
          <span class="kicker-l">— Brèves —</span>
        </div>
        <BrevesSection :breves="store.data.breves" />
      </template>

      <!-- Découverte : aux frontières de votre veille. État vide honnête si rien n'est ponté
           à votre champ (sérendipité ∉ champ) plutôt que disparition silencieuse. -->
      <template v-if="serendipityStore.items.length">
        <div class="kicker">
          <span class="kicker-l">— Aux frontières de votre veille —</span>
        </div>
        <FrontieresVeille :faibles="serendipityStore.items" />
      </template>
      <div v-else-if="serendipityStore.loaded" class="empty-block">
        <div class="kicker"><span class="kicker-l">— Aux frontières de votre veille —</span></div>
        <p class="empty-note">Rien de neuf ponté à votre champ aujourd'hui.</p>
      </div>

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

.empty-note {
  text-align: center;
  color: var(--color-ink-3);
  font-size: 13px;
  font-style: italic;
  margin: -12px 0 0;
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
