import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const bookingUrl = "https://emly.am/b/seraphin"

async function finishPortal(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto"
    const hero = document.querySelector<HTMLElement>(".native-portal-hero")
    if (hero) window.scrollTo(0, hero.offsetHeight - window.innerHeight)
  })
  await expect(page.locator(".native-portal-hero")).toHaveAttribute("data-portal-phase", "immersive")
  await expect(page.locator(".native-portal-hero__arrival")).toHaveCSS("opacity", "1")
}

test("renders the authentic brand threshold and verified booking path", async ({ page }) => {
  await page.goto("")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Enter the quiet")
  const logo = page.locator(".native-portal-hero__logo img")
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute("src", "images/seraphin-logo.jpg")
  await expect(page.getByRole("link", { name: /Book a ritual/ }).first()).toHaveAttribute("href", bookingUrl)
  await expect(page.getByText(/15,000/).first()).toBeVisible()
})

test("scroll drives a substantial portal transformation into the real room", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One motion proof is sufficient")
  await page.goto("")
  const portal = page.locator(".native-portal-hero__portal")
  const initialTransform = await portal.evaluate((element) => getComputedStyle(element).transform)
  const initialBox = await portal.boundingBox()

  await finishPortal(page)
  await page.waitForTimeout(450)

  const finalTransform = await portal.evaluate((element) => getComputedStyle(element).transform)
  const finalBox = await portal.boundingBox()
  expect(finalTransform).not.toBe(initialTransform)
  expect(finalBox?.width ?? 0).toBeGreaterThan((initialBox?.width ?? 1) * 5)
  expect(finalBox?.width ?? 0).toBeGreaterThan((page.viewportSize()?.width ?? 0) * 1.2)
  await expect(page.getByRole("heading", { name: /Come back to your body/ })).toBeVisible()
})

test("switches language and exposes the complete treatment navigation", async ({ page }) => {
  await page.goto("")
  await page.getByRole("button", { name: "ՀԱՅ" }).click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("հանգստության")
  await page.locator("#treatments").scrollIntoViewIfNeeded()
  await expect(page.getByRole("tab", { name: "Զույգերի համար" })).toBeVisible()
})

test("has no automatically detectable serious accessibility violations", async ({ page }) => {
  await page.goto("")
  let results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([])

  await finishPortal(page)
  results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([])
})

test("keeps the mobile layout and menu usable without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation only")
  await page.goto("")
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.locator(".brand-lockup")).toBeVisible()

  const toggle = page.getByRole("button", { name: "Open menu" })
  await toggle.focus()
  await toggle.press("Enter")
  await expect(page.getByRole("link", { name: "Treatments" })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(toggle).toBeFocused()
})

test("moves focus to the ritual recommendation", async ({ page }) => {
  await page.goto("")
  const finder = page.locator("#finder")
  await finder.scrollIntoViewIfNeeded()
  await finder.getByRole("button", { name: /Release deep tension/ }).click()
  await expect(finder.getByRole("heading", { name: "Deep Tissue Massage" })).toBeFocused()
})

test("reduced motion keeps the final scene and all actions available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("")
  await expect(page.locator(".native-portal-hero")).toHaveAttribute("data-portal-phase", "immersive")
  await expect(page.getByRole("heading", { name: /Come back to your body/ })).toBeVisible()
  await expect(page.getByRole("link", { name: /Book a ritual/ }).first()).toHaveAttribute("href", bookingUrl)
})
