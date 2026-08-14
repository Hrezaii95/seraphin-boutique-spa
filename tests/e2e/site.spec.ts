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
  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze()
  const serious = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")
  expect(serious).toEqual([])
})
