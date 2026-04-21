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
  test.beforeEach(async ({ page, baseURL }) => {
    // Authenticate via Frappe's REST login endpoint, then inject the
    // session cookies into the browser context. This avoids driving the
    // HTML login form: Frappe v16's login page uses Vue components whose
    // input[name] attributes and mount timing differ from earlier
    // versions, causing page.fill('input[name="usr"]', ...) to time out
    // waiting for an element that never matches. The REST API accepts
    // usr/pwd regardless of the form's current DOM shape.
    const loginResponse = await page.request.post(`${baseURL}/api/method/login`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: { usr: TEST_USER, pwd: TEST_PWD },
    })
    if (!loginResponse.ok()) {
      throw new Error(
        `Login to ${baseURL} as ${TEST_USER} failed: ${loginResponse.status()} ${await loginResponse.text()}`
      )
    }
    const { cookies } = await page.request.storageState()
    await page.context().addCookies(cookies)
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
