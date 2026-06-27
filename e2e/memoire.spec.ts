import { test, expect, type Page } from '@playwright/test'

// E2E de la Mémoire active (mode mock, hash routing). Couvre les tests de réussite §10.

async function gotoMemoire(page: Page) {
  await page.goto('/#/memoire')
  await expect(page.locator('.mem-tabs')).toBeVisible()
}

test('les 3 onglets affichent leurs compteurs au chargement', async ({ page }) => {
  await gotoMemoire(page)
  const tabs = page.locator('.mem-tab')
  await expect(tabs).toHaveCount(3)
  // Onglet Favoris actif par défaut, pastille compteur non vide.
  await expect(page.locator('.mem-tab.on')).toContainText('Favoris')
  for (const label of ['Favoris', 'Pistes', 'Notes']) {
    const tab = page.locator('.mem-tab', { hasText: label })
    await expect(tab.locator('.mem-pill')).not.toHaveText('0')
  }
})

test('associer en 2 gestes depuis une carte favori (pastille + toast), puis dissocier', async ({ page }) => {
  await gotoMemoire(page)
  // Carte « Revue de code… » : favori non associé.
  const card = page.locator('.fav', { hasText: 'Revue de code à l’ère des copilotes' })
  await expect(card.locator('.pchip')).toHaveCount(0)
  // Geste 1 : ouvrir le popover d'association.
  await card.getByRole('button', { name: /associer à une piste/i }).click()
  // Geste 2 : cocher une piste.
  await page.getByRole('dialog', { name: /Associer à une ou plusieurs pistes/i })
    .getByRole('checkbox', { name: 'Remplacer Foundry' })
    .click()
  await expect(page.locator('.mem-toast')).toContainText('Associé à')
  // Fermer le popover et vérifier la pastille.
  await page.keyboard.press('Escape')
  await expect(card.locator('.pchip', { hasText: 'Remplacer Foundry' })).toBeVisible()

  // Décocher → dissocier.
  await card.getByRole('button', { name: /^associer$/i }).click()
  await page.getByRole('checkbox', { name: 'Remplacer Foundry' }).click()
  await expect(page.locator('.mem-toast')).toContainText('Dissocié de')
})

test('le filtre « Non associés » ne montre que les favoris sans piste', async ({ page }) => {
  await gotoMemoire(page)
  await page.getByRole('button', { name: /Non associés/i }).click()
  const cards = page.locator('.fav')
  await expect(cards.first()).toBeVisible()
  // Aucune carte affichée ne doit porter de pastille de piste.
  await expect(page.locator('.fav .pchip')).toHaveCount(0)
})

test('fiche piste : aperçu listé, associer un favori (recherche accent-insensible), dissocier', async ({ page }) => {
  await gotoMemoire(page)
  await page.getByRole('button', { name: 'Pistes', exact: false }).click()
  await page.locator('.pl-card', { hasText: 'Remplacer Foundry' }).click()
  // Aperçu présent (au moins un résultat).
  await expect(page.locator('.b-apercu .ap-row').first()).toBeVisible()

  // Associer un favori via recherche accent-insensible ("revue" → "Revue de code").
  await page.getByRole('button', { name: /associer un favori/i }).click()
  const pop = page.getByRole('dialog', { name: /Associer un favori/i })
  await pop.getByLabel('Chercher un favori').fill('revue')
  await pop.getByRole('checkbox', { name: /Revue de code/i }).click()
  await expect(page.locator('.mem-toast')).toContainText('Associé à')
  await page.keyboard.press('Escape')
  await expect(page.locator('.b-fav', { hasText: 'Revue de code' })).toBeVisible()

  // Dissocier au hover (croix).
  const row = page.locator('.b-fav', { hasText: 'Revue de code' })
  await row.hover()
  await row.getByRole('button', { name: /Dissocier/i }).click()
  await expect(page.locator('.mem-toast')).toContainText('Dissocié de')
})

test('composeur : l’aperçu se recompose, SIGNAL_NET vs AUCUNE_SOURCE, nudge multi-thème', async ({ page }) => {
  await gotoMemoire(page)
  await page.getByRole('button', { name: 'Pistes', exact: false }).click()
  await page.getByRole('button', { name: /Nouvelle piste/i }).first().click()

  const ta = page.getByLabel('Axe de recherche')

  // Descriptif précis et ciblé → SIGNAL_NET + aperçu resserré.
  await ta.fill('Je veux remplacer Palantir Foundry : alternatives open-source et retours de migration de pipelines data')
  await expect(page.locator('.qmeter.is-net')).toBeVisible()
  await expect(page.locator('.e-side .ap-row').first()).toBeVisible()

  // Descriptif hors-corpus → AUCUNE_SOURCE + empty-state.
  await ta.fill('xyz')
  await expect(page.locator('.qmeter.is-aucune')).toBeVisible()
  await expect(page.locator('.e-side .ap-empty')).toBeVisible()

  // Descriptif multi-thème → nudge « un seul axe ».
  await ta.fill('Remplacer Foundry par une alternative open-source et obligations CSRD pour les ETI et registre AI Act déployeur')
  await expect(page.locator('.nudge')).toBeVisible()
  await expect(page.locator('.nudge')).toContainText('Plusieurs axes')
})

test('onglet Notes : segmented control, aucune création, note d’article sous 2 pistes, édition/suppression', async ({ page }) => {
  await gotoMemoire(page)
  await page.getByRole('button', { name: 'Notes', exact: false }).click()

  // Segmented control présent, 0 affordance de création de note.
  await expect(page.locator('.nl-seg button')).toHaveCount(3)
  await expect(page.getByRole('button', { name: /ajouter une note/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /nouvelle note/i })).toHaveCount(0)

  // « Par piste » : la note de l'article Dagster (associé à 2 pistes) apparaît
  // sous Remplacer Foundry ET Code généré par LLM.
  await page.getByRole('tab', { name: 'Par piste' }).click()
  const dagsterNote = page.locator('.ncard', { hasText: 'modèle d’assets de Dagster' })
  await expect(dagsterNote).toHaveCount(2)

  // Retour « Toutes » : édition d'une note + suppression.
  await page.getByRole('tab', { name: 'Toutes' }).click()
  const card = page.locator('.ncard').first()
  const ta = card.getByLabel('Note')
  await ta.click()
  await ta.fill('Note éditée par le test E2E')
  await ta.blur()
  await expect(card.getByLabel('Note')).toHaveValue('Note éditée par le test E2E')

  const before = await page.locator('.ncard').count()
  await card.hover()
  await card.getByRole('button', { name: /Supprimer la note/i }).click()
  await expect(page.locator('.ncard')).toHaveCount(before - 1)
})

test('vocabulaire : jamais « ranger / étagère / dossier / tag » dans l’UI', async ({ page }) => {
  await gotoMemoire(page)
  for (const nav of ['Favoris', 'Pistes', 'Notes']) {
    await page.locator('.mem-tab', { hasText: nav }).click()
    const body = (await page.locator('.mem-content').innerText()).toLowerCase()
    for (const banned of ['ranger', 'étagère', 'etagère', 'dossier', ' tag']) {
      expect(body).not.toContain(banned)
    }
  }
})
