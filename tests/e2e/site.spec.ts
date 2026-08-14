import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const concepts = [
  { id: "lotus", heading: "Stillness," },
  { id: "threshold", heading: "Leave the city" },
  { id: "oracle", heading: "Where does your body" },
] as const

test("concept index exposes all three independent directions", async ({ page }) => {
  await page.goto("")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Three hooks")
  await expect(page.locator(".lab-card")).toHaveCount(3)
})

for (const concept of concepts) {
  test(`${concept.id} renders its live scene without horizontal overflow`, async ({ page }) => {
    await page.goto(`?concept=${concept.id}`)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(concept.heading)
    await expect(page.locator(".concept-scene")).toHaveAttribute("data-scene-ready", /true|fallback/)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test(`${concept.id} has no serious automated accessibility violations`, async ({ page }) => {
    await page.goto(`?concept=${concept.id}`)
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter(({ impact }) => impact === "critical" || impact === "serious")
    expect(serious).toEqual([])
  })
}

test("living lotus changes state when opened", async ({ page }) => {
  await page.goto("?concept=lotus")
  await page.getByRole("button", { name: "Open the lotus" }).click()
  await expect(page.locator(".concept--lotus")).toHaveClass(/is-awake/)
})

test("threshold opens its curtains", async ({ page }) => {
  await page.goto("?concept=threshold")
  await page.getByRole("button", { name: "Enter the quiet" }).click()
  await expect(page.locator(".concept--threshold")).toHaveClass(/is-entered/)
})

test("oracle changes its real recommendation", async ({ page }) => {
  await page.goto("?concept=oracle")
  await page.getByRole("button", { name: "Lower back" }).click()
  await expect(page.getByText("Deep Tissue Massage")).toBeVisible()
  await expect(page.getByText(/16,000 AMD/)).toBeVisible()
})
