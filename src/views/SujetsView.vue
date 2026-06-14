<script setup lang="ts">
import { onMounted } from 'vue'
import { useExplorerStore } from '../stores/useExplorerStore'
import TopicCard from '../components/explorer/TopicCard.vue'
import TopicRow from '../components/explorer/TopicRow.vue'

const store = useExplorerStore()
onMounted(() => store.loadTopics())
</script>

<template>
  <div class="sujets-page">
    <div v-if="store.topicsLoading" class="loading">
      <span>Chargement…</span>
    </div>

    <template v-else>
      <!-- Sujets actifs — cartes -->
      <section class="topics-section">
        <div class="section-h">
          <h2 class="section-title">Sujets <em>actifs</em></h2>
          <span class="section-meta">{{ store.featuredTopics.length }} sujets en veille</span>
        </div>
        <div class="topic-grid">
          <TopicCard
            v-for="topic in store.featuredTopics"
            :key="topic.id"
            :topic="topic"
          />
        </div>
      </section>

      <!-- Tableau complet -->
      <section class="topics-section topics-section--table">
        <div class="section-h">
          <h2 class="section-title">Tous les <em>sujets</em></h2>
          <span class="section-meta">{{ store.allTopics.length }} sujets</span>
        </div>
        <div class="topic-list">
          <div class="table-header">
            <span>N°</span>
            <span>Sujet</span>
            <span>Articles</span>
            <span>Δ 7j</span>
            <span>Maturité</span>
          </div>
          <TopicRow
            v-for="(topic, i) in store.allTopics"
            :key="topic.id"
            :topic="topic"
            :index="i"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.sujets-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px 80px;
}

.loading {
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

.topics-section {
  padding: 40px 0 32px;
  border-bottom: var(--border-rule);
}

.topics-section:last-of-type {
  border-bottom: 0;
}

.section-h {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.012em;
  color: var(--color-ink);
}

.section-title em {
  font-style: italic;
  color: var(--color-indigo);
  font-weight: 400;
}

.section-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.topic-list {
  display: flex;
  flex-direction: column;
  border-top: var(--border-rule);
}

.table-header {
  display: grid;
  grid-template-columns: 32px 1fr 80px 60px 60px;
  gap: 20px;
  padding: 10px 0 8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-rule-2);
  margin-bottom: 2px;
}
</style>
