<script setup lang="ts">
// Page détail article — lecture + capture + organisation (PRD docs/prd/active/
// PRD_detail_article_capture_organisation.md). Recréée en Vue depuis le handoff design.
// Consomme la Mémoire active (favori/pistes/notes) ; commentaires de sélection ancrés (§5).
import { onMounted, onBeforeUnmount, computed, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../stores/useArticleStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import { useMemoireStore } from '../stores/useMemoireStore'
import { useSelectionComments } from '../composables/useSelectionComments'
import { useOpenArticle } from '../composables/useOpenArticle'
import ArticleIcon from '../components/article/ArticleIcon.vue'
import ArticleCommentCard from '../components/article/ArticleCommentCard.vue'
import AssociatePopover from '../components/memoire/AssociatePopover.vue'
import MemNoteLine from '../components/memoire/MemNoteLine.vue'
import type { ArticleDetail } from '../api/articles'
import type { ArticleId, Note, NoteId, PisteId } from '../types'

const route = useRoute()
const router = useRouter()
const store = useArticleStore()
const feedback = useFeedbackStore()
const mem = useMemoireStore()
const openArticle = useOpenArticle()

const id = computed(() => decodeURIComponent(String(route.params.id ?? '')))
const article = computed(() => store.current)
const articleId = computed(() => (article.value ? (article.value.id as ArticleId) : null))

// ---- Lecture : mode résumé / intégral (états A/B, §7) -----------------------
const hasFull = computed(() => !!article.value?.fullText)
const mode = ref<'resume' | 'full'>('resume')

function paragraphsOf(text: string | null | undefined): string[] {
  if (!text) return []
  const blocks = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (blocks.length > 1) return blocks
  // Pas de séparation explicite : on regroupe par 3 phrases (lisibilité éditoriale).
  const sentences = (text ?? '').split(/(?<=[.!?])\s+/)
  const out: string[] = []
  for (let i = 0; i < sentences.length; i += 3) out.push(sentences.slice(i, i + 3).join(' '))
  return out
}

const paragraphs = computed(() =>
  mode.value === 'full' && article.value?.fullText
    ? paragraphsOf(article.value.fullText)
    : paragraphsOf(article.value?.summary),
)

// ---- Rail Organiser ---------------------------------------------------------
const railOpen = ref(true)

// ---- Favori / avis (cohérent multi-surfaces via useFeedbackStore) -----------
const isFavorite = computed(() => (articleId.value ? feedback.get(articleId.value).favorite : false))
const opinion = computed(() => (articleId.value ? feedback.get(articleId.value).opinion : null))

function ensureFavoriShell() {
  const a = article.value
  if (!a) return
  mem.ensureFavori({
    articleId: a.id as ArticleId,
    titre: a.title,
    source: a.source,
    date: a.date,
    lien: originalUrl(a),
    extrait: a.summary.slice(0, 220),
  })
}

function toggleFavorite() {
  if (!articleId.value) return
  ensureFavoriShell()
  feedback.toggleFavorite(articleId.value)
  mem.toast(isFavorite.value ? 'Ajouté à vos favoris' : 'Retiré des favoris')
}

function setOpinion(value: 'relevant' | 'not_relevant') {
  if (!articleId.value) return
  feedback.setOpinion(articleId.value, value)
}

// ---- Pistes associées (dérivées du favori) ----------------------------------
const currentFavori = computed(() => (articleId.value ? mem.favoriById(articleId.value) : undefined))
const associatedPistes = computed(() =>
  (currentFavori.value?.pisteIds ?? [])
    .map((pid) => mem.pisteById(pid))
    .filter((p): p is NonNullable<typeof p> => !!p),
)

const popoverOpen = ref(false)
function openAssociate() {
  ensureFavoriShell()
  popoverOpen.value = true
}
function togglePiste(pisteId: PisteId) {
  if (articleId.value) mem.toggleAssociation(articleId.value, pisteId)
}

// ---- Notes d'article (anchor nul) — réutilise MemNoteLine -------------------
const articleNotes = computed<Note[]>(() =>
  articleId.value ? mem.articleNotes(articleId.value) : [],
)
async function addArticleNote() {
  if (!articleId.value) return
  ensureFavoriShell()
  await mem.addNote('fav', articleId.value, '')
}
function updateNote(noteId: NoteId, texte: string) {
  if (texte.trim()) mem.updateNote(noteId, texte)
  else mem.deleteNote(noteId)
}

// ---- Commentaires de sélection ancrés (§5) ----------------------------------
const bodyEl = ref<HTMLElement | null>(null)
const sel = useSelectionComments(bodyEl, mode)
const activeCommentId = ref<NoteId | null>(null)

const comments = computed<Note[]>(() =>
  articleId.value ? mem.articleComments(articleId.value) : [],
)
const commentsInMode = computed(() => comments.value.filter((c) => c.anchor?.mode === mode.value))
const commentsOtherMode = computed(() => comments.value.filter((c) => c.anchor?.mode !== mode.value))

function commentsForPara(index: number): Note[] {
  return commentsInMode.value.filter((c) => c.anchor?.paragraphIndex === index)
}

// Surlignages d'un paragraphe : on recoupe le texte avec la `quote` (indexOf best-effort, §5).
interface Segment { text: string; commentId: NoteId | null; orphan: boolean }
function segmentsFor(index: number, text: string): Segment[] {
  const cs = commentsForPara(index)
  const ranges = cs
    .map((c) => ({ c, start: c.anchor ? text.indexOf(c.anchor.quote) : -1 }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start)
  if (!ranges.length) return [{ text, commentId: null, orphan: false }]
  const out: Segment[] = []
  let cur = 0
  for (const r of ranges) {
    if (r.start < cur) continue // chevauchement : on garde le premier
    if (r.start > cur) out.push({ text: text.slice(cur, r.start), commentId: null, orphan: false })
    const end = r.start + (r.c.anchor?.quote.length ?? 0)
    out.push({ text: text.slice(r.start, end), commentId: r.c.id, orphan: false })
    cur = end
  }
  if (cur < text.length) out.push({ text: text.slice(cur), commentId: null, orphan: false })
  return out
}

// Un commentaire est orphelin si sa quote n'est pas retrouvée dans son paragraphe (gate (c)).
function isOrphan(c: Note): boolean {
  if (!c.anchor) return false
  const paras = paragraphs.value
  const p = paras[c.anchor.paragraphIndex]
  if (p === undefined) return true
  return p.indexOf(c.anchor.quote) < 0
}

function focusComment(commentId: NoteId | null) {
  activeCommentId.value = commentId
}

async function commitComment() {
  const p = sel.pending.value
  if (!p || !articleId.value) return
  ensureFavoriShell()
  const created = await mem.addNote('fav', articleId.value, '', sel.toAnchor(p))
  activeCommentId.value = created.id
  sel.clearPending()
  window.getSelection()?.removeAllRanges()
  mem.toast('Passage commenté')
}

function onBodyPointerUp() {
  sel.onPointerUp()
}
function onBodyKeyUp(ev: KeyboardEvent) {
  sel.onKeyUp(ev)
}

// ---- Partager ---------------------------------------------------------------
async function copyLink() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    mem.toast('Lien copié')
  } catch {
    mem.toast('Copie impossible')
  }
}
function sendToColleague() {
  const a = article.value
  if (!a) return
  const subject = encodeURIComponent(a.title)
  const body = encodeURIComponent(`${a.title}\n${window.location.href}`)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

// ---- Chargement -------------------------------------------------------------
onMounted(() => load())
watch(id, () => load())
// Le mode revient à « résumé » si l'intégral n'est plus disponible (état B forcé, §7).
watch(hasFull, (v) => { if (!v) mode.value = 'resume' })

async function load() {
  mode.value = 'resume'
  activeCommentId.value = null
  await Promise.all([store.loadOne(id.value), mem.load()])
  if (route.query.related) {
    await nextTick()
    document.getElementById('related-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onBeforeUnmount(() => sel.clearPending())

// ---- Présentation -----------------------------------------------------------
const sourceDomain = computed(() => (article.value?.source ?? '').split('/')[0])

function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso.slice(0, 10)
  }
}

function scoreLabel(s: number) {
  if (s >= 0.8) return 'Essentiel'
  if (s >= 0.65) return 'Très pertinent'
  if (s >= 0.5) return 'Pertinent'
  return 'Signal faible'
}

const showThesis = computed(() => !!article.value?.thesisFr && article.value.isArgumentative !== false)

// URL de l'article original : link nettoyé, sinon dérivé de l'id (arXiv / http).
function originalUrl(a: ArticleDetail): string {
  if (a.link) return a.link
  const arxiv = a.id.match(/^oai:arXiv\.org:([\d.]+)/)
  if (arxiv) return `https://arxiv.org/abs/${arxiv[1]}`
  if (/^https?:\/\//.test(a.id)) { try { return decodeURIComponent(a.id) } catch { return a.id } }
  return ''
}

const relatedTitle = computed(() => store.subjectLabel ?? 'Même sujet')

function openRelated(relatedId: string) {
  if (article.value) feedback.markImplicit(article.value.id, 'related_clicked')
  openArticle(relatedId)
}

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/explorer/articles')
}

// Filtre du panneau relations — uniquement les deux filtres alimentés (gate (e)).
type RelFilter = 'all' | 'same' | 'contrepoint'
const relFilter = ref<RelFilter>('all')
const showSame = computed(() => relFilter.value === 'all' || relFilter.value === 'same')
const showContrepoint = computed(() => relFilter.value === 'all' || relFilter.value === 'contrepoint')
const hasContrepoint = computed(() => store.contradictions.length > 0)
</script>

<template>
  <div class="adv-root">
    <div v-if="store.loading && !article" class="adv-state">Chargement…</div>

    <div v-else-if="!article" class="adv-state">
      <h1 class="adv-empty-title">Article introuvable</h1>
      <p>Cet article n’est plus disponible.</p>
      <button class="adv-link" @click="router.push('/explorer/articles')">← Retour aux articles</button>
    </div>

    <div v-else class="adv-grid" :style="{ gridTemplateColumns: '1fr auto' }">
      <!-- ===================== Colonne de lecture ===================== -->
      <div class="adv-read">
        <div class="adv-readin">
          <button class="adv-back" @click="back">
            <ArticleIcon name="back" :size="14" /> Retour
          </button>

          <!-- Citation source (haut), toujours visible, cliquable -->
          <div class="adv-meta">
            <a
              v-if="originalUrl(article)"
              class="adv-src"
              :href="originalUrl(article)"
              target="_blank"
              rel="noopener"
              :title="`Ouvrir la source d’origine : ${article.source}`"
              @click="feedback.markImplicit(article.id, 'source_clicked')"
            >
              <span class="adv-src-mark"><ArticleIcon name="article" :size="12" /></span>
              {{ article.source }}
              <ArticleIcon name="ext" :size="11" />
            </a>
            <span v-else class="adv-src adv-src--static">
              <span class="adv-src-mark"><ArticleIcon name="article" :size="12" /></span>{{ article.source }}
            </span>
            <span class="adv-sep" />
            <span>{{ formatDate(article.published) }}</span>
            <span class="adv-sep" />
            <span>{{ article.type }}</span>
          </div>

          <h1 class="adv-title">{{ article.title }}</h1>

          <!-- Métriques : Pertinence · Contexte (FR) · Tendance -->
          <div class="adv-metrics">
            <div class="adv-metric">
              <div class="adv-ml">Pertinence</div>
              <div class="adv-mv">{{ scoreLabel(article.score) }}</div>
              <div class="adv-bar"><i :style="{ width: article.score * 100 + '%' }" /></div>
            </div>
            <div v-if="article.contextLabel" class="adv-metric">
              <div class="adv-ml">Contexte</div>
              <div class="adv-mv">{{ article.contextLabel }}</div>
            </div>
            <div class="adv-metric">
              <div class="adv-ml">Tendance</div>
              <div class="adv-mv">
                <span class="adv-tr">
                  <ArticleIcon :name="article.trending ? 'trend' : 'flat'" :size="13" />
                  {{ article.trending ? 'En hausse' : 'Stable' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Thèse -->
          <div v-if="showThesis" class="adv-thesis">
            <div class="adv-tl"><ArticleIcon name="thesis" :size="12" /> Ce que défend cet article</div>
            <div class="adv-tt">{{ article.thesisFr }}</div>
          </div>

          <!-- Switch lecture (états A/B) -->
          <div class="adv-switchrow">
            <span class="adv-bsl">Lecture</span>
            <div class="adv-switch">
              <button :class="{ on: mode === 'resume' }" @click="mode = 'resume'">
                <ArticleIcon name="article" :size="13" /> Résumé
              </button>
              <button
                class="adv-switch-full"
                :class="{ on: mode === 'full' && hasFull, 'is-off': !hasFull }"
                :aria-disabled="!hasFull"
                @click="hasFull && (mode = 'full')"
              >
                <ArticleIcon name="layers" :size="13" /> Texte intégral
                <ArticleIcon v-if="!hasFull" name="info" :size="12" />
                <span v-if="!hasFull" class="adv-bsw-tip">
                  Le texte intégral n’est pas disponible chez Le Veilleur — consultez-le dans la source originale.
                </span>
              </button>
            </div>
            <span class="adv-hint">{{ hasFull ? (mode === 'full' ? 'contenu original complet' : '') : 'résumé seul disponible ici' }}</span>
          </div>

          <!-- Indicateur hors-mode (gate (d)) -->
          <p v-if="commentsOtherMode.length" class="adv-othermode">
            {{ commentsOtherMode.length }}
            {{ commentsOtherMode.length > 1 ? 'commentaires' : 'commentaire' }}
            sur {{ mode === 'full' ? 'le résumé' : 'le texte intégral' }}.
          </p>

          <!-- Aide sélection -->
          <div class="adv-selhint">
            <ArticleIcon name="note" :size="13" />
            Sélectionnez un passage : le commentaire s’ancre dans la marge, en regard du texte.
          </div>
          <p v-if="sel.crossParaWarning.value" class="adv-crosspara" role="alert">
            {{ sel.crossParaWarning.value }}
          </p>

          <!-- Corps commentable -->
          <div
            ref="bodyEl"
            class="adv-cbody"
            @mouseup="onBodyPointerUp"
            @touchend="onBodyPointerUp"
            @keyup="onBodyKeyUp"
          >
            <div class="adv-cdoc">
              <div v-for="(p, i) in paragraphs" :key="mode + i" class="adv-cprow">
                <div class="adv-cpara">
                  <p :data-para="i">
                    <template v-for="(seg, si) in segmentsFor(i, p)" :key="si">
                      <mark
                        v-if="seg.commentId"
                        class="adv-cmark"
                        :class="{ active: seg.commentId === activeCommentId }"
                        role="button"
                        tabindex="0"
                        @click="focusComment(seg.commentId)"
                        @keydown.enter="focusComment(seg.commentId)"
                      >{{ seg.text }}</mark>
                      <template v-else>{{ seg.text }}</template>
                    </template>
                  </p>
                </div>
                <div class="adv-cmcol">
                  <ArticleCommentCard
                    v-for="c in commentsForPara(i)"
                    :key="c.id"
                    :note="c"
                    :active="c.id === activeCommentId"
                    :orphan="isOrphan(c)"
                    @update="updateNote(c.id, $event)"
                    @delete="mem.deleteNote(c.id)"
                    @focus="focusComment(c.id)"
                  />
                </div>
              </div>
            </div>

            <!-- Commentaires orphelins (ancrage perdu) — conservés, jamais surlignés (gate (c)) -->
            <div v-if="commentsInMode.some(isOrphan)" class="adv-orphans">
              <div class="adv-orphans-h">Commentaires sans ancrage</div>
              <ArticleCommentCard
                v-for="c in commentsInMode.filter(isOrphan)"
                :key="c.id"
                :note="c"
                :active="c.id === activeCommentId"
                :orphan="true"
                @update="updateNote(c.id, $event)"
                @delete="mem.deleteNote(c.id)"
                @focus="focusComment(c.id)"
              />
            </div>

            <!-- Bulle « Commenter » -->
            <div
              v-if="sel.pending.value"
              class="adv-cbubble"
              :style="{ left: sel.pending.value.x + 'px', top: sel.pending.value.y + 'px' }"
            >
              <button type="button" @mousedown.prevent @click="commitComment">
                <ArticleIcon name="note" :size="13" /> Commenter
              </button>
            </div>
          </div>

          <div class="adv-divider" />

          <!-- Entités -->
          <div v-if="store.entities.length" class="adv-entities">
            <div class="adv-ent-h"><ArticleIcon name="entity" :size="12" /> Acteurs &amp; notions</div>
            <div class="adv-ent-row">
              <span v-for="e in store.entities" :key="e.id" class="adv-ent">
                <span class="adv-ed" />{{ e.label }}
              </span>
            </div>
          </div>

          <!-- Bouton source (contour, toujours présent) -->
          <div class="adv-srcbtn-wrap">
            <a
              class="adv-srcbtn"
              :href="originalUrl(article) || undefined"
              :target="originalUrl(article) ? '_blank' : undefined"
              rel="noopener"
              @click="originalUrl(article) && feedback.markImplicit(article.id, 'source_clicked')"
            >
              <ArticleIcon name="ext" :size="15" />
              Lire l’article original sur {{ sourceDomain }}
            </a>
          </div>

          <!-- Panneau « Ce que cet article relie » -->
          <section id="related-section" class="adv-runi">
            <div class="adv-runi-h"><ArticleIcon name="link" :size="12" /> Ce que cet article relie</div>

            <div v-if="store.justification" class="adv-runi-lead">
              <div class="adv-rwl"><ArticleIcon name="light" :size="11" /> Pourquoi pour vous</div>
              <p>{{ store.justification }}</p>
            </div>

            <div class="adv-rfilter">
              <button class="adv-rfc" :class="{ on: relFilter === 'all' }" @click="relFilter = 'all'">Tous</button>
              <button class="adv-rfc" :class="{ on: relFilter === 'same' }" @click="relFilter = 'same'">
                <span class="adv-rd same" /> Même sujet
              </button>
              <button
                v-if="hasContrepoint"
                class="adv-rfc"
                :class="{ on: relFilter === 'contrepoint' }"
                @click="relFilter = 'contrepoint'"
              >
                <span class="adv-rd opp" /> Contrepoint
              </button>
            </div>

            <template v-if="showSame">
              <div
                v-for="r in store.related"
                :key="r.id"
                class="adv-runi-item"
                role="button"
                tabindex="0"
                @click="openRelated(r.id)"
                @keydown.enter="openRelated(r.id)"
              >
                <div class="adv-runi-ic"><ArticleIcon name="article" :size="15" /></div>
                <div class="adv-runi-main">
                  <div class="adv-rt">{{ r.title }}</div>
                  <div class="adv-runi-meta">
                    <span>{{ r.source }}</span><span class="adv-sep" />
                    <span>{{ formatDate(r.published) }}</span><span class="adv-sep" />
                    <span class="adv-rtag same"><span class="adv-rd same" /> {{ relatedTitle }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="showContrepoint">
              <div
                v-for="c in store.contradictions"
                :key="c.id"
                class="adv-runi-item"
                role="button"
                tabindex="0"
                @click="openRelated(c.id)"
                @keydown.enter="openRelated(c.id)"
              >
                <div class="adv-runi-ic acc-steel"><ArticleIcon name="swap" :size="15" /></div>
                <div class="adv-runi-main">
                  <div class="adv-rt">{{ c.title }}</div>
                  <div class="adv-runi-meta">
                    <span>{{ c.source }}</span><span class="adv-sep" />
                    <span>{{ formatDate(c.published) }}</span><span class="adv-sep" />
                    <span class="adv-rtag opp"><span class="adv-rd opp" /> Contrepoint</span>
                  </div>
                  <div class="adv-runi-why">
                    <ArticleIcon name="swap" :size="12" />
                    Défend la thèse inverse — à lire pour éprouver la solidité de votre lecture.
                  </div>
                </div>
              </div>
            </template>

            <div v-if="!store.related.length && !store.contradictions.length" class="adv-runi-empty">
              Aucun lien pour le moment.
            </div>
          </section>
        </div>
      </div>

      <!-- ===================== Rail Organiser ===================== -->
      <aside v-if="railOpen" class="adv-rail" :style="{ width: '320px' }">
        <div class="adv-railin">
          <div class="adv-rh">
            Organiser
            <button class="adv-collapse" type="button" aria-label="Rétracter le rail" @click="railOpen = false">
              <ArticleIcon name="chev" :size="15" />
            </button>
          </div>

          <button class="adv-favbtn" :class="{ on: isFavorite }" type="button" @click="toggleFavorite">
            <ArticleIcon name="star" :size="17" :fill="isFavorite" />
            {{ isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris' }}
          </button>

          <!-- Avis tri-état (en tête, sous le favori) -->
          <div class="adv-opin-head">
            <div class="adv-opin-q">Cet article vous est-il utile ?</div>
            <div class="adv-opin">
              <button :class="{ 'on-up': opinion === 'relevant' }" type="button" @click="setOpinion('relevant')">
                <ArticleIcon name="up" :size="14" /> Pertinent
              </button>
              <button :class="{ 'on-down': opinion === 'not_relevant' }" type="button" @click="setOpinion('not_relevant')">
                <ArticleIcon name="down" :size="14" /> Moins
              </button>
            </div>
          </div>

          <!-- Pistes -->
          <div class="adv-sect">
            <div class="adv-st">
              <ArticleIcon name="piste" :size="12" /> Pistes
              <span class="adv-n">{{ associatedPistes.length }}</span>
            </div>
            <div class="adv-pistes">
              <div v-for="p in associatedPistes" :key="p.id" class="adv-pchip">
                <span class="adv-cd" :style="{ background: `var(--color-${p.couleur})` }" />
                {{ p.nom }}
                <button class="adv-pchip-rm" type="button" aria-label="Dissocier" @click="togglePiste(p.id)">
                  <ArticleIcon name="x" :size="12" />
                </button>
              </div>
              <div class="adv-assoc-wrap">
                <button class="adv-pchip add" type="button" @click="openAssociate">
                  <ArticleIcon name="plus" :size="12" /> associer
                </button>
                <AssociatePopover
                  v-if="popoverOpen && currentFavori"
                  :favori="currentFavori"
                  :pistes="mem.pistes"
                  @toggle="togglePiste"
                  @new-piste="router.push('/memoire')"
                  @close="popoverOpen = false"
                />
              </div>
            </div>
          </div>

          <!-- Notes sur l'article -->
          <div class="adv-sect">
            <div class="adv-st">
              <ArticleIcon name="note" :size="12" /> Notes sur l’article
              <span class="adv-n">{{ articleNotes.length }}</span>
            </div>
            <div class="adv-notes">
              <MemNoteLine
                v-for="n in articleNotes"
                :key="n.id"
                :note="n"
                @update="updateNote(n.id, $event)"
                @delete="mem.deleteNote(n.id)"
              />
            </div>
            <button class="adv-addnote" type="button" @click="addArticleNote">
              <ArticleIcon name="plus" :size="12" /> ajouter une note
            </button>
          </div>

          <!-- Partager -->
          <div class="adv-sect">
            <div class="adv-st"><ArticleIcon name="share" :size="12" /> Partager</div>
            <div class="adv-share">
              <button class="adv-sharebtn" type="button" @click="copyLink">
                <ArticleIcon name="link" :size="14" /> Copier le lien
              </button>
              <button class="adv-sharebtn" type="button" @click="sendToColleague">
                <ArticleIcon name="share" :size="14" /> Envoyer à un collègue
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Rail rétracté (bande 64px) -->
      <aside v-else class="adv-rail collapsed" :style="{ width: '64px' }">
        <div class="adv-strip">
          <button class="adv-exp" type="button" aria-label="Déplier le rail" @click="railOpen = true">
            <ArticleIcon name="back" :size="16" />
          </button>
          <button class="adv-iconact fav" :class="{ on: isFavorite }" type="button" aria-label="Favori" @click="toggleFavorite">
            <ArticleIcon name="star" :size="17" :fill="isFavorite" />
          </button>
          <button class="adv-iconact up" :class="{ on: opinion === 'relevant' }" type="button" aria-label="Pertinent" @click="setOpinion('relevant')">
            <ArticleIcon name="up" :size="17" />
          </button>
          <button class="adv-iconact down" :class="{ on: opinion === 'not_relevant' }" type="button" aria-label="Moins" @click="setOpinion('not_relevant')">
            <ArticleIcon name="down" :size="17" />
          </button>
          <div class="adv-stripn"><ArticleIcon name="piste" :size="15" />{{ associatedPistes.length }}</div>
        </div>
      </aside>
    </div>

    <Transition name="adv-toast">
      <div v-if="mem.toastMessage" class="adv-toast" role="status">{{ mem.toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.adv-root {
  --adv-radius-md: 8px;
  --adv-radius-lg: 12px;
  position: relative;
  z-index: 1;
  min-height: 100%;
}
.adv-state { padding: 3rem 2rem; color: var(--color-ink-3); font-family: var(--font-sans); }
.adv-empty-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-ink); margin-bottom: 0.5rem; }
.adv-link { background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ink-3); padding: 0; }
.adv-link:hover { color: var(--color-indigo); }

/* Grille fluide : colonne lecture (1fr) + rail (auto, largeur explicite). Pas d'anim 1fr. */
.adv-grid { display: grid; min-height: 100%; }
.adv-read { min-width: 0; }
.adv-readin { max-width: 736px; margin: 0 auto; padding: 30px 44px 60px; width: 100%; }

.adv-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-ink-3); margin-bottom: 26px; padding: 0; transition: color 0.14s; }
.adv-back:hover { color: var(--color-ink); }

.adv-meta { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-4); margin-bottom: 18px; flex-wrap: wrap; }
.adv-src { display: inline-flex; align-items: center; gap: 8px; color: var(--color-ink-2); text-decoration: none; transition: color 0.14s; }
.adv-src--static { cursor: default; }
.adv-src:hover:not(.adv-src--static) { color: var(--color-indigo); }
.adv-src:hover:not(.adv-src--static) .adv-src-mark { background: var(--color-indigo); }
.adv-src-mark { width: 22px; height: 22px; border-radius: 6px; background: var(--color-ink); color: var(--color-paper); display: grid; place-items: center; flex: none; transition: background 0.14s; }
.adv-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--color-ink-5); flex: none; }

.adv-title { font-family: var(--font-serif); font-size: 40px; font-weight: 400; letter-spacing: -0.022em; line-height: 1.06; color: var(--color-ink); text-wrap: pretty; margin-bottom: 26px; }

.adv-metrics { display: flex; gap: 0; border-top: 1px solid var(--color-rule); border-bottom: 1px solid var(--color-rule); padding: 16px 0; margin-bottom: 26px; }
.adv-metric { flex: 1; padding-right: 18px; }
.adv-metric + .adv-metric { padding-left: 22px; border-left: 1px solid var(--color-rule-2); }
.adv-ml { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-ink-4); margin-bottom: 9px; }
.adv-mv { font-family: var(--font-serif); font-size: 16px; color: var(--color-ink); display: flex; align-items: center; gap: 9px; }
.adv-bar { height: 3px; border-radius: 2px; background: var(--color-rule); overflow: hidden; margin-top: 9px; }
.adv-bar i { display: block; height: 100%; background: var(--color-ink); border-radius: 2px; }
.adv-tr { display: inline-flex; align-items: center; gap: 6px; }
.adv-tr :deep(svg) { color: var(--color-moss); }

.adv-thesis { position: relative; padding: 2px 0 2px 22px; border-left: 2px solid var(--color-indigo); margin-bottom: 26px; }
.adv-tl { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-indigo); font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 7px; }
.adv-tt { font-family: var(--font-serif); font-size: 21px; line-height: 1.42; color: var(--color-ink); text-wrap: pretty; font-style: italic; }

.adv-switchrow { display: flex; align-items: center; gap: 12px; margin: 6px 0 18px; flex-wrap: wrap; }
.adv-bsl { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-ink-4); font-weight: 600; }
.adv-switch { display: inline-flex; background: var(--color-bg-2); border-radius: 8px; padding: 3px; gap: 2px; }
.adv-switch button { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-4); padding: 7px 13px; border-radius: 6px; transition: 0.14s; display: inline-flex; align-items: center; gap: 7px; border: none; background: none; cursor: pointer; position: relative; }
.adv-switch button:hover { color: var(--color-ink-2); }
.adv-switch button.on { background: var(--color-paper); color: var(--color-ink); box-shadow: var(--shadow-hover); }
.adv-switch-full.is-off { cursor: not-allowed; color: var(--color-ink-5); }
.adv-bsw-tip { position: absolute; bottom: calc(100% + 9px); left: 50%; transform: translateX(-50%); width: 230px; background: oklch(16% 0.012 250); color: #fff; font-family: var(--font-sans); font-size: 11px; line-height: 1.45; letter-spacing: 0; text-transform: none; font-weight: 400; padding: 10px 13px; border-radius: 8px; box-shadow: var(--shadow-popover); opacity: 0; pointer-events: none; transition: opacity 0.14s; z-index: 50; text-align: left; }
.adv-switch-full.is-off:hover .adv-bsw-tip { opacity: 1; }
.adv-bsw-tip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%) rotate(45deg); width: 9px; height: 9px; background: oklch(16% 0.012 250); margin-top: -5px; }
.adv-hint { font-family: var(--font-serif); font-style: italic; font-size: 12px; color: var(--color-ink-4); margin-left: auto; }

.adv-othermode { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em; color: var(--color-ink-4); margin-bottom: 14px; }
.adv-selhint { display: flex; align-items: center; gap: 9px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em; color: var(--color-ink-4); background: var(--color-bg-2); border-radius: 7px; padding: 9px 12px; margin-bottom: 12px; }
.adv-selhint :deep(svg) { color: var(--color-amber); }
.adv-crosspara { font-family: var(--font-serif); font-style: italic; font-size: 12.5px; color: var(--color-rose); margin-bottom: 14px; }

/* Corps commentable — disposition Docs (texte 1fr + marge 270px) */
.adv-cbody { position: relative; }
.adv-cdoc { display: flex; flex-direction: column; gap: 16px; margin-bottom: 8px; }
.adv-cprow { display: grid; grid-template-columns: 1fr 270px; gap: 30px; align-items: start; }
.adv-cpara p { font-family: var(--font-serif); font-size: 17px; line-height: 1.68; color: var(--color-ink-2); margin: 0; text-wrap: pretty; }
.adv-cmcol { position: relative; padding-top: 1px; display: flex; flex-direction: column; gap: 9px; }
.adv-cmark { background: var(--color-amber-tint2); border-bottom: 1.5px solid var(--color-amber); cursor: pointer; border-radius: 2px; padding: 0 1px; transition: background 0.14s; }
.adv-cmark:hover, .adv-cmark.active { background: oklch(88% 0.07 78); }
.adv-cmark:focus-visible { outline: 2px solid var(--color-amber); outline-offset: 1px; }

.adv-orphans { margin: 18px 0 8px; padding-top: 14px; border-top: 1px dashed var(--color-rule); display: flex; flex-direction: column; gap: 9px; max-width: 360px; }
.adv-orphans-h { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-ink-4); }

.adv-cbubble { position: absolute; z-index: 50; transform: translateX(-50%); }
.adv-cbubble button { display: inline-flex; align-items: center; gap: 7px; background: var(--color-ink); color: var(--color-paper); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500; padding: 8px 13px; border-radius: 8px; box-shadow: var(--shadow-popover); white-space: nowrap; border: none; cursor: pointer; }
.adv-cbubble button:hover { background: var(--color-indigo); }
.adv-cbubble::before { content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 9px; height: 9px; background: var(--color-ink); }

.adv-divider { height: 1px; background: var(--color-rule-2); margin: 26px 0 22px; }

.adv-entities { margin: 6px 0 26px; }
.adv-ent-h { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-ink-4); margin-bottom: 11px; display: flex; align-items: center; gap: 7px; }
.adv-ent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.adv-ent { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-ink-2); border: 1px solid var(--color-rule); border-radius: 999px; padding: 5px 12px; background: var(--color-paper); transition: 0.14s; }
.adv-ent:hover { border-color: var(--color-indigo); color: var(--color-ink); }
.adv-ed { width: 6px; height: 6px; border-radius: 50%; background: var(--color-ink-4); }
.adv-ent:hover .adv-ed { background: var(--color-indigo); }

.adv-srcbtn-wrap { margin: 6px 0 26px; }
.adv-srcbtn { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500; color: var(--color-indigo); background: var(--color-paper); border: 1px solid var(--color-indigo-tint); padding: 13px 20px; border-radius: 8px; text-decoration: none; transition: 0.15s; }
.adv-srcbtn:hover { background: var(--color-indigo-tint); }

/* Panneau relations */
.adv-runi { border: 1px solid var(--color-rule); border-radius: var(--adv-radius-lg); background: var(--color-paper); box-shadow: var(--shadow-hover); overflow: hidden; margin-bottom: 8px; }
.adv-runi-h { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-ink-4); font-weight: 600; padding: 15px 18px 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--color-rule-2); }
.adv-runi-lead { padding: 15px 18px; border-bottom: 1px solid var(--color-rule-2); background: var(--color-bg); }
.adv-rwl { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-indigo); font-weight: 600; margin-bottom: 7px; display: flex; align-items: center; gap: 7px; }
.adv-runi-lead p { font-family: var(--font-serif); font-style: italic; font-size: 14px; line-height: 1.55; color: var(--color-ink-2); text-wrap: pretty; }
.adv-rfilter { display: flex; align-items: center; gap: 7px; padding: 12px 18px; border-bottom: 1px solid var(--color-rule-2); background: var(--color-bg); flex-wrap: wrap; }
.adv-rfc { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-4); border: 1px solid var(--color-rule); border-radius: 999px; padding: 5px 11px; cursor: pointer; transition: 0.14s; display: inline-flex; align-items: center; gap: 6px; background: none; }
.adv-rfc:hover { border-color: var(--color-ink-4); color: var(--color-ink-2); }
.adv-rfc.on { background: var(--color-bg-2); border-color: transparent; color: var(--color-ink); }
.adv-rd { width: 6px; height: 6px; border-radius: 50%; flex: none; }
.adv-rd.same { background: var(--color-moss); }
.adv-rd.opp { background: var(--color-steel); }
.adv-runi-item { display: flex; align-items: flex-start; gap: 13px; padding: 13px 18px; border-bottom: 1px solid var(--color-rule-3); cursor: pointer; transition: 0.14s; }
.adv-runi-item:last-child { border-bottom: 0; }
.adv-runi-item:hover { background: var(--color-bg); }
.adv-runi-item:hover .adv-rt { color: var(--color-indigo); }
.adv-runi-ic { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; flex: none; border: 1px solid var(--color-rule); background: var(--color-bg); }
.adv-runi-ic :deep(svg) { color: var(--color-ink-3); }
.adv-runi-ic.acc-steel { border-color: var(--color-steel-tint); background: var(--color-steel-tint); }
.adv-runi-ic.acc-steel :deep(svg) { color: var(--color-steel); }
.adv-runi-main { flex: 1; min-width: 0; }
.adv-rt { font-family: var(--font-serif); font-size: 15px; line-height: 1.28; color: var(--color-ink); letter-spacing: -0.01em; margin-bottom: 5px; transition: color 0.14s; text-wrap: pretty; }
.adv-runi-meta { display: flex; align-items: center; gap: 9px; font-family: var(--font-mono); font-size: 9px; color: var(--color-ink-4); flex-wrap: wrap; }
.adv-rtag { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.05em; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; color: var(--color-ink-4); }
.adv-rtag.same { color: var(--color-moss); }
.adv-rtag.opp { color: var(--color-steel); }
.adv-runi-why { display: flex; gap: 8px; align-items: flex-start; margin-top: 9px; font-family: var(--font-serif); font-style: italic; font-size: 12.5px; line-height: 1.45; text-wrap: pretty; border-radius: 6px; padding: 8px 11px; background: var(--color-bg-2); color: var(--color-ink-2); }
.adv-runi-why :deep(svg) { color: var(--color-steel); flex: none; margin-top: 2px; }
.adv-runi-empty { padding: 16px 18px; font-family: var(--font-serif); font-style: italic; color: var(--color-ink-4); }

/* Rail Organiser */
.adv-rail { border-left: 1px solid var(--color-rule); background: var(--color-bg); min-width: 0; }
.adv-railin { position: sticky; top: 0; padding: 26px 22px; }
.adv-rh { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-ink-4); font-weight: 600; display: flex; align-items: center; margin-bottom: 14px; }
.adv-collapse { margin-left: auto; width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; color: var(--color-ink-4); transition: 0.14s; border: none; background: none; cursor: pointer; }
.adv-collapse:hover { background: var(--color-bg-2); color: var(--color-ink); }

.adv-favbtn { display: flex; align-items: center; gap: 11px; width: 100%; padding: 13px 15px; border-radius: var(--adv-radius-md); border: 1px solid var(--color-rule); background: var(--color-paper); font-family: var(--font-sans); font-size: 13.5px; font-weight: 500; color: var(--color-ink-2); transition: 0.14s; cursor: pointer; }
.adv-favbtn:hover { border-color: var(--color-ink-4); }
.adv-favbtn :deep(svg) { color: var(--color-ink-4); }
.adv-favbtn.on { background: var(--color-amber-tint); border-color: var(--color-amber-tint2); color: oklch(45% 0.12 60); }
.adv-favbtn.on :deep(svg) { color: var(--color-amber); }

.adv-opin-head { margin-top: 16px; background: var(--color-paper); border: 1px solid var(--color-rule); border-radius: var(--adv-radius-md); padding: 12px 13px; }
.adv-opin-q { font-family: var(--font-serif); font-size: 13.5px; color: var(--color-ink-2); margin-bottom: 10px; }
.adv-opin { display: inline-flex; width: 100%; border: 1px solid var(--color-rule); border-radius: 8px; overflow: hidden; background: var(--color-paper); }
.adv-opin button { flex: 1; justify-content: center; display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; color: var(--color-ink-3); padding: 9px 13px; transition: 0.14s; border: none; background: none; cursor: pointer; }
.adv-opin button + button { border-left: 1px solid var(--color-rule); }
.adv-opin button:hover { background: var(--color-bg-2); color: var(--color-ink); }
.adv-opin button.on-up { background: var(--color-moss-tint); color: var(--color-moss); }
.adv-opin button.on-down { background: var(--color-rose-tint); color: var(--color-rose); }

.adv-sect { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--color-rule-2); }
.adv-st { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-ink-4); font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 11px; }
.adv-st :deep(svg) { color: var(--color-ink-4); }
.adv-n { margin-left: auto; color: var(--color-ink-5); }
.adv-pistes { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.adv-pchip { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-ink-2); background: var(--color-paper); border: 1px solid var(--color-rule); border-radius: 7px; padding: 7px 10px; width: 100%; }
.adv-cd { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.adv-pchip-rm { margin-left: auto; color: var(--color-ink-5); cursor: pointer; display: flex; border: none; background: none; padding: 0; }
.adv-pchip-rm:hover { color: var(--color-rose); }
.adv-pchip.add { border-style: dashed; color: var(--color-ink-4); cursor: pointer; width: auto; }
.adv-pchip.add:hover { border-color: var(--color-ink-4); color: var(--color-ink); }
.adv-assoc-wrap { position: relative; }

.adv-notes { display: flex; flex-direction: column; }
.adv-addnote { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-4); cursor: pointer; transition: 0.14s; padding: 8px 0 0; border: none; background: none; }
.adv-addnote:hover { color: var(--color-amber); }

.adv-share { display: flex; flex-direction: column; gap: 7px; }
.adv-sharebtn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 13px; border-radius: var(--adv-radius-md); border: 1px solid var(--color-rule); background: var(--color-paper); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-3); transition: 0.14s; cursor: pointer; }
.adv-sharebtn:hover { border-color: var(--color-ink-4); color: var(--color-ink); }
.adv-sharebtn :deep(svg) { color: var(--color-ink-4); }

/* Rail rétracté */
.adv-strip { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 24px 0; position: sticky; top: 0; }
.adv-exp { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: var(--color-ink-3); border: 1px solid var(--color-rule); background: var(--color-paper); transition: 0.14s; margin-bottom: 6px; cursor: pointer; }
.adv-exp:hover { color: var(--color-ink); border-color: var(--color-ink-4); }
.adv-iconact { width: 38px; height: 38px; border-radius: 9px; display: grid; place-items: center; color: var(--color-ink-3); border: 1px solid var(--color-rule); background: var(--color-paper); transition: 0.14s; cursor: pointer; }
.adv-iconact:hover { color: var(--color-ink); border-color: var(--color-ink-4); }
.adv-iconact.fav.on { background: var(--color-amber-tint); border-color: transparent; color: var(--color-amber); }
.adv-iconact.up.on { background: var(--color-moss-tint); border-color: transparent; color: var(--color-moss); }
.adv-iconact.down.on { background: var(--color-rose-tint); border-color: transparent; color: var(--color-rose); }
.adv-stripn { font-family: var(--font-mono); font-size: 9px; color: var(--color-ink-4); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 0; }

/* Toast */
.adv-toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60; background: var(--color-ink); color: var(--color-paper); font-family: var(--font-sans); font-size: 12.5px; padding: 10px 18px; border-radius: var(--adv-radius-lg); box-shadow: var(--shadow-popover); }
.adv-toast-enter-active, .adv-toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.adv-toast-enter-from, .adv-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

@media (max-width: 980px) {
  .adv-grid { grid-template-columns: 1fr !important; }
  .adv-rail { border-left: none; border-top: 1px solid var(--color-rule); width: auto !important; }
  .adv-railin { position: static; }
  .adv-cprow { grid-template-columns: 1fr; }
  .adv-cmcol { padding-left: 0; }
}
</style>
