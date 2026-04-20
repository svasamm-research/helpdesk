import { test, expect } from '@playwright/test'

const TEST_USER = process.env.TEST_USER || 'Administrator'
const TEST_PWD = process.env.TEST_USER_PWD || 'admin'

// Helper: open the UserMenu dropdown in the desktop Sidebar, then click
// the "About Svasamm Helpdesk" option. The UserMenu renders a <button>
// inside the sidebar containing the brand name text and username; this
// locator targets that button by its visible brand-name label.
async function openAboutModal(page) {
  // Sidebar UserMenu trigger — button that contains the brand-name text
  // (config.brandName, which the Svasamm backend-config override sets to
  // "Svasamm Helpdesk").
  const trigger = page
    .locator('button')
    .filter({ hasText: /Svasamm Helpdesk|Helpdesk/ })
    .first()
  await trigger.click()
  // Dropdown renders "About Svasamm Helpdesk" as a menu item.
  await page
    .getByText(/About Svasamm Helpdesk/i)
    .first()
    .click()
}

test.describe('Svasamm Helpdesk SPA branding', () => {
  test.beforeEach(async ({ page }) => {
    // Unauthenticated /helpdesk hits Desk login. Authenticate there,
    // then subsequent page.goto calls in each test land on /helpdesk.
    await page.goto('/login')
    await page.fill('input[name="usr"]', TEST_USER)
    await page.fill('input[name="pwd"]', TEST_PWD)
    await page.click('button[type="submit"]')
    // Wait for Desk or Helpdesk to load — either is fine post-login.
    await page.waitForURL(/\/app|\/helpdesk/, { timeout: 10_000 })
  })

  test('document title is Svasamm Helpdesk', async ({ page }) => {
    await page.goto('/helpdesk')
    await expect(page).toHaveTitle(/Svasamm Helpdesk/, { timeout: 10_000 })
  })

  test('AGPL source-offer link in About modal', async ({ page }) => {
    await page.goto('/helpdesk')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await openAboutModal(page)
    const sourceLink = page.getByRole('link', { name: /Source available/i })
    await expect(sourceLink).toBeVisible({ timeout: 10_000 })
    await expect(sourceLink).toHaveAttribute(
      'href',
      /github\.com\/svasamm-research\/helpdesk\/releases/
    )
  })

  test('AGPL attribution preserved in About modal', async ({ page }) => {
    await page.goto('/helpdesk')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await openAboutModal(page)
    // Svasamm copyright
    await expect(
      page.getByText(/©\s*Svasamm Research Pvt\. Ltd\./i)
    ).toBeVisible({ timeout: 10_000 })
    // Upstream attribution (AGPL compliance — must not be stripped)
    await expect(page.getByText(/Built on Frappe Helpdesk/i)).toBeVisible({
      timeout: 10_000,
    })
  })

  test('HelpModal does NOT render Help centre link', async ({ page }) => {
    await page.goto('/helpdesk')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    // The Help sidebar link is only rendered when onboarding has been
    // completed. Using the sidebar label guarantees we click the right
    // control if it's present. If it's not rendered (onboarding banner
    // still showing), the test is effectively a no-op for the
    // Help-centre assertion — but the Svasamm shadow can only render
    // through this path so that's acceptable.
    const helpLink = page.getByText(/^Help$/).first()
    const helpLinkCount = await helpLink.count()
    if (helpLinkCount > 0) {
      await helpLink.click()
      await expect(
        page.getByRole('heading', { name: /Getting started/i })
      ).toBeVisible({ timeout: 10_000 })
    }
    // Whether or not the modal is open, the Svasamm shadow must not
    // introduce a "Help centre" / "Help center" footer anywhere on the
    // page.
    await expect(page.getByText(/help cent(er|re)/i)).toHaveCount(0)
  })

  test('snapshot: helpdesk dashboard after login', async ({ page }) => {
    await page.goto('/helpdesk')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await expect(page).toHaveScreenshot('helpdesk-dashboard.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('snapshot: tickets list empty state', async ({ page }) => {
    await page.goto('/helpdesk/tickets')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await expect(page).toHaveScreenshot('helpdesk-tickets-empty.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    })
  })
})
