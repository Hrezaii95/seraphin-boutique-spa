import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("renders the premium landing experience and real booking path", async ({ page }) => {
  await page.goto("")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Come back to your body")
  await expect(page.getByRole("link", { name: /Book a ritual/ }).first()).toHaveAttribute("href", "https://emly.am/b/seraphin")
  await expect(page.locator("canvas, .quiet-bloom-fallback").first()).toBeVisible()
  await expect(page.getByText("15,000").first()).toBeVisible()
})

test("switches language and exposes the complete treatment navigation", async ({ page }) => {
  await page.goto("")
  await page.getByRole("button", { name: "ՀԱՅ" }).click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Վերադարձեք")
  await page.locator("#treatments").scrollIntoViewIfNeeded()
  await expect(page.getByRole("tab", { name: "Զույգերի համար" })).toBeVisible()
})

test("has no automatically detectable serious accessibility violations", async ({ page }) => {
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
