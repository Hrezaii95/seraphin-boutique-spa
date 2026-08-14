import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function scrollPassageTo(page: Page, progress: number) {
  const travel = await page.locator(".passage").evaluate((element) => element.offsetHeight - innerHeight)
  await page.evaluate((target) => window.scrollTo(0, target), travel * progress)
  await expect.poll(async () => Number(await page.locator(".passage").getAttribute("data-progress"))).toBeGreaterThan(progress - 0.03)
}

test("renders the complete flagship and real booking path", async ({ page }) => {
  await page.goto("")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Enter the quiet")
  await expect(page.getByRole("link", { name: /Book a ritual/ }).first()).toHaveAttribute("href", "https://emly.am/b/seraphin")
  await expect(page.locator(".passage-scene")).toBeVisible()
  await expect(page.locator(".passage-scene")).toHaveAttribute("data-quality", /high|balanced|low/)
  await expect(page.getByText("15,000").first()).toBeVisible()
})

test("scroll drives a visibly different three-dimensional scene", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One deterministic WebGL sample is sufficient")
  await page.goto("")
  const canvas = page.locator(".passage-scene canvas")
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(1200)
  const threshold = await canvas.screenshot({ animations: "allow" })
  await scrollPassageTo(page, 0.58)
  await page.waitForTimeout(700)
  const oil = await canvas.screenshot({ animations: "allow" })
  const changedBytes = threshold.reduce((total, byte, index) => total + Number(byte !== oil[index]), 0)
  expect(changedBytes).toBeGreaterThan(10_000)
  await expect(page.getByText("Botanical oil", { exact: true })).toBeVisible()
})

test("primary action begins the passage", async ({ page }) => {
  await page.goto("")
  await page.getByRole("button", { name: "Begin the passage" }).click()
  await expect(page.locator(".passage")).toHaveClass(/is-begun/)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100)
})

test("skip control reaches the treatment catalogue", async ({ page }) => {
  await page.goto("")
  await page.getByRole("button", { name: "Skip the 3D passage" }).click()
  await expect(page.locator("#treatments")).toBeInViewport()
})

test("switches language and localizes the immersive opening", async ({ page }) => {
  await page.goto("")
  await page.getByRole("button", { name: "ՀԱՅ" }).click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Մտեք լռության մեջ")
  await expect(page.getByRole("button", { name: "Սկսել ուղին" })).toBeVisible()
  await page.locator("#treatments").scrollIntoViewIfNeeded()
  await expect(page.getByRole("tab", { name: "Զույգերի համար" })).toBeVisible()
})

test("has no critical or serious automated accessibility violations", async ({ page }) => {
  await page.goto("")
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")
  expect(serious).toEqual([])
})

test("keeps the mobile menu keyboard-operable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation only")
  await page.goto("")
  const toggle = page.getByRole("button", { name: "Open menu" })
  await toggle.focus()
  await toggle.press("Enter")
  await expect(page.getByRole("link", { name: "Treatments", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(toggle).toBeFocused()
})

test("has no horizontal overflow on Android size", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Android viewport only")
  await page.goto("")
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test("keeps all content usable when WebGL is unavailable", async ({ browser }) => {
  const context = await browser.newContext()
  await context.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  const page = await context.newPage()
  await page.goto("")
  await expect(page.locator(".passage-scene")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Enter the quiet." })).toBeVisible()
  await page.getByRole("link", { name: "View treatments" }).first().click()
  await expect(page.locator("#treatments")).toBeInViewport()
  await context.close()
})

test("moves focus to the ritual recommendation", async ({ page }) => {
  await page.goto("")
  const finder = page.locator("#finder")
  await finder.scrollIntoViewIfNeeded()
  await finder.getByRole("button", { name: /Release deep tension/ }).click()
  await expect(finder.getByRole("heading", { name: "Deep Tissue Massage" })).toBeFocused()
})
