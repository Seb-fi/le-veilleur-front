import { test, expect, type Page } from '@playwright/test'

// E2E de la page détail article (mode mock, hash routing). Couvre les tests §11 du PRD :
// favori, associer/dissocier + toast, note d'article, sélection → bulle → commentaire en
// marge → surlignage (+ clavier), switch Résumé/Intégral (états A/B, infobulle B, indicateur
// hors-mode), avis tri-état, contrepoint neutre (steel, pas rose), source haut + bas, filtres
// relations (seulement les 2 alimentés), vocabulaire.

const FULL = '/#/explorer/articles/a-icl' // état A — texte intégral disponible
const NOFULL = '/#/explorer/articles/a-amnesia' // état B — pas de texte intégral

async function gotoFull(page: Page) {
  await page.goto(FULL)
  await expect(page.locator('.adv-title')).toBeVisible()
}

// Sélectionne le texte d'un nœud `mark`/`p` via l'API DOM Selection (robuste, sans drag).
async function selectInParagraph(page: Page, paraIndex: number, quote: string) {
  await page.evaluate(
    ({ paraIndex, quote }) => {
      const p = document.querySelector(`[data-para="${paraIndex}"]`)
      if (!p) throw new Error('paragraphe introuvable')
      const full = p.textContent ?? ''
      const start = full.indexOf(quote)
      if (start < 0) throw new Error('quote introuvable dans le paragraphe')
      // Localise le nœud texte et les offsets (un seul nœud texte au rendu initial).
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT)
      let node: Text | null = null
      let acc = 0
      let startOffset = 0
      let endOffset = 0
      let n = walker.nextNode() as Text | null
      while (n) {
        const len = n.textContent?.length ?? 0
        if (acc <= start && start < acc + len) {
          node = n
          startOffset = start - acc
          endOffset = startOffset + quote.length
          break
        }
        acc += len
        n = walker.nextNode() as Text | null
      }
      if (!node) throw new Error('nœud texte introuvable')
      const range = document.createRange()
      range.setStart(node, startOffset)
      range.setEnd(node, Math.min(endOffset, node.textContent?.length ?? 0))
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      p.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    },
    { paraIndex, quote },
  )
}

test('source présente en haut (cliquable) et en bas (bouton contour)', async ({ page }) => {
  await gotoFull(page)
  await expect(page.locator('.adv-src')).toBeVisible()
  await expect(page.locator('.adv-srcbtn')).toContainText(/Lire l’article original/)
})

test('favori : toggle depuis le rail + toast', async ({ page }) => {
  await gotoFull(page)
  const fav = page.locator('.adv-favbtn')
  await expect(fav).toContainText('Ajouter aux favoris')
  await fav.click()
  await expect(fav).toHaveClass(/on/)
  await expect(fav).toContainText('Dans vos favoris')
  await expect(page.locator('.adv-toast')).toContainText(/favoris/)
})

test('avis tri-état : Pertinent puis annulation', async ({ page }) => {
  await gotoFull(page)
  const pertinent = page.getByRole('button', { name: 'Pertinent' })
  await pertinent.click()
  await expect(pertinent).toHaveClass(/on-up/)
  // Re-clic annule.
  await pertinent.click()
  await expect(pertinent).not.toHaveClass(/on-up/)
})

test('associer une piste via popover + toast, puis dissocier', async ({ page }) => {
  await gotoFull(page)
  await page.getByRole('button', { name: /^associer$/i }).click()
  const pop = page.getByRole('dialog', { name: /Associer à une ou plusieurs pistes/i })
  await pop.getByRole('checkbox', { name: 'Remplacer Foundry' }).click()
  await expect(page.locator('.adv-toast')).toContainText('Associé à')
  await page.keyboard.press('Escape')
  await expect(page.locator('.adv-pchip', { hasText: 'Remplacer Foundry' })).toBeVisible()
  // Dissocier via la croix de la pastille.
  await page.locator('.adv-pchip', { hasText: 'Remplacer Foundry' })
    .getByRole('button', { name: /Dissocier/i }).click()
  await expect(page.locator('.adv-toast')).toContainText('Dissocié de')
})

test('note d’article : ajouter et éditer', async ({ page }) => {
  await gotoFull(page)
  await page.getByRole('button', { name: /ajouter une note/i }).click()
  const ta = page.locator('.adv-notes').getByLabel('Note').first()
  await ta.click()
  await ta.fill('Note de test E2E')
  await ta.blur()
  await expect(page.locator('.adv-notes').getByLabel('Note').first()).toHaveValue('Note de test E2E')
})

test('sélection → bulle → commentaire en marge → surlignage', async ({ page }) => {
  await gotoFull(page)
  await selectInParagraph(page, 0, 'apprentissage continu')
  const bubble = page.locator('.adv-cbubble')
  await expect(bubble).toBeVisible()
  await bubble.getByRole('button', { name: /Commenter/i }).click()
  // Carte en marge créée + surlignage rendu.
  await expect(page.locator('.adv-cmcol .ccard').first()).toBeVisible()
  await expect(page.locator('mark.adv-cmark').first()).toBeVisible()
  // Édition du commentaire.
  const cta = page.locator('.ccard').getByLabel('Commentaire sur ce passage').first()
  await cta.fill('Mon commentaire ancré')
  await cta.blur()
  await expect(page.locator('.ccard').getByLabel('Commentaire sur ce passage').first())
    .toHaveValue('Mon commentaire ancré')
})

test('switch Résumé/Intégral en état A + indicateur hors-mode', async ({ page }) => {
  await gotoFull(page)
  // Commenter en mode résumé.
  await selectInParagraph(page, 0, 'apprentissage continu')
  await page.locator('.adv-cbubble').getByRole('button', { name: /Commenter/i }).click()
  await expect(page.locator('mark.adv-cmark')).toHaveCount(1)
  // Bascule vers le texte intégral : le bouton est actif (pas is-off).
  const full = page.locator('.adv-switch-full')
  await expect(full).not.toHaveClass(/is-off/)
  await full.click()
  await expect(full).toHaveClass(/on/)
  // Indicateur hors-mode : 1 commentaire sur le résumé.
  await expect(page.locator('.adv-othermode')).toContainText(/sur le résumé/)
})

test('état B : bouton intégral aria-disabled + infobulle, mode forcé résumé', async ({ page }) => {
  await page.goto(NOFULL)
  await expect(page.locator('.adv-title')).toBeVisible()
  const full = page.locator('.adv-switch-full')
  await expect(full).toHaveClass(/is-off/)
  await expect(full).toHaveAttribute('aria-disabled', 'true')
  // L'infobulle existe (au survol). Le clic ne bascule pas en mode intégral.
  await expect(page.locator('.adv-bsw-tip')).toContainText(/n’est pas disponible/)
  await full.click()
  await expect(full).not.toHaveClass(/\bon\b/)
})

test('contrepoint rendu neutre (steel, jamais rose/alerte)', async ({ page }) => {
  await gotoFull(page)
  const contre = page.locator('.adv-runi-item', { hasText: 'Amnesia' })
  await expect(contre).toBeVisible()
  await expect(contre.locator('.adv-rtag.opp')).toContainText('Contrepoint')
  // Icône accent steel, pas de classe rose/alerte.
  await expect(contre.locator('.adv-runi-ic.acc-steel')).toBeVisible()
  await expect(contre.locator('.adv-rtag.opp')).toHaveCSS('color', /oklch/)
  await expect(page.locator('.adv-runi-why')).toContainText(/thèse inverse/)
})

test('filtres relations : seulement « Même sujet » et « Contrepoint » (pas « cite »/« voisin »)', async ({ page }) => {
  await gotoFull(page)
  const filters = page.locator('.adv-rfilter .adv-rfc')
  const labels = (await filters.allInnerTexts()).map((s) => s.trim().toLowerCase())
  expect(labels.some((l) => l.includes('même sujet'))).toBeTruthy()
  expect(labels.some((l) => l.includes('contrepoint'))).toBeTruthy()
  expect(labels.some((l) => l.includes('cite'))).toBeFalsy()
  expect(labels.some((l) => l.includes('voisin'))).toBeFalsy()
})

test('vocabulaire : « piste »/« associer », jamais « ranger/dossier/tag/étagère »', async ({ page }) => {
  await gotoFull(page)
  const body = (await page.locator('.adv-grid').innerText()).toLowerCase()
  expect(body).toContain('associer')
  expect(body).toContain('piste')
  for (const banned of ['ranger', 'étagère', 'etagère', 'dossier', ' tag']) {
    expect(body).not.toContain(banned)
  }
})
