import { access, cp, mkdir, rm } from "node:fs/promises"
import { resolve } from "node:path"
import type { Plugin } from "vite"

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false
    throw error
  }
}

// Mirrors the Sites starter packaging hook while preserving this static Vite app.
export function sites(): Plugin {
  let root = process.cwd()
  return {
    name: "sites",
    apply: "build",
    configResolved(config) { root = config.root },
    async closeBundle() {
      const buildDirectory = resolve(root, "dist")
      const outputDirectory = resolve(buildDirectory, ".openai")
      const clientDirectory = resolve(buildDirectory, "client")
      const hostingConfig = resolve(root, ".openai", "hosting.json")

      // Sites binds static files from dist/client while Vite emits this legacy
      // SPA at dist/. Mirror only the public build entries; keep the Worker at
      // dist/server/index.js for the hosting runtime.
      await rm(clientDirectory, { recursive: true, force: true })
      await mkdir(clientDirectory, { recursive: true })
      const staticEntries = [
        "assets",
        "images",
        "favicon.svg",
        "index.html",
        "og.jpg",
        "robots.txt",
        "site.webmanifest",
        "sitemap.xml",
      ]
      for (const entry of staticEntries) {
        const source = resolve(buildDirectory, entry)
        if (await exists(source)) await cp(source, resolve(clientDirectory, entry), { recursive: true })
      }

      await rm(outputDirectory, { recursive: true, force: true })
      await mkdir(outputDirectory, { recursive: true })
      if (await exists(hostingConfig)) await cp(hostingConfig, resolve(outputDirectory, "hosting.json"))
    },
  }
}
