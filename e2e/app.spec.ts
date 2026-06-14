import { test, expect } from '@playwright/test'

// Flux front déterministes (mode mock). Le routage est en hash history (#/...).

test('la racine redirige vers la Mémoire active', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/#\/memoire$/)
})

test('le briefing affiche le bandeau de fils et les sections', async ({ page }) => {
  await page.goto('/#/briefing')
  // Bande de fils réelle (mock en dev) : « Ce que le système suit pour vous ».
  await expect(page.getByText('Ce que le système suit pour vous')).toBeVisible()
})

test('cliquer un fil ouvre le drawer de sources', async ({ page }) => {
  await page.goto('/#/briefing')
  await page.locator('.thread').first().click()
  await expect(page.getByRole('dialog', { name: 'Détail du fil' })).toBeVisible()
  await expect(page.getByText('Sources')).toBeVisible()
})

test('l’onboarding ouvre l’entretien avec une amorce', async ({ page }) => {
  await page.goto('/#/onboarding')
  await expect(page.getByText('Configuration de votre veille')).toBeVisible()
  // L'amorce (premier message assistant) apparaît après le tour initial.
  await expect(page.locator('.onb-msg--assistant').first()).toBeVisible()
})

test('le feedback « Pertinent » est un toggle réversible (état optimiste)', async ({ page }) => {
  await page.goto('/#/explorer/articles')
  const relevant = page.locator('.article').first().getByTitle('Pertinent')
  await expect(relevant).toHaveAttribute('aria-pressed', 'false')
  await relevant.click()
  await expect(relevant).toHaveAttribute('aria-pressed', 'true')
  await relevant.click()
  await expect(relevant).toHaveAttribute('aria-pressed', 'false')
})
