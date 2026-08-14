import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  reporter: [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173/seraphin-boutique-spa/",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: process.platform === "win32"
      ? { executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" }
      : undefined,
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "mobile", use: { ...devices["Pixel 5"] } }],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/seraphin-boutique-spa/",
    reuseExistingServer: true,
    timeout: 120000,
  },
})
