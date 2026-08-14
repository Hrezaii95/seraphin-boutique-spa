import { access, cp, mkdir, readdir, rm } from "node:fs/promises"
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
      const distDirectory = resolve(root, "dist")
      const outputDirectory = resolve(distDirectory, ".openai")
      const serverDirectory = resolve(distDirectory, "server")
      const emittedServerDirectory = resolve(distDirectory, "client", "server")
      const workerSource = resolve(root, "public", "server", "index.js")
      const hostingConfig = resolve(root, ".openai", "hosting.json")
      if (await exists(distDirectory)) {
        const entries = await readdir(distDirectory, { withFileTypes: true })
        await Promise.all(entries
          .filter((entry) => entry.name !== "client")
          .map((entry) => rm(resolve(distDirectory, entry.name), { recursive: true, force: true })))
      }
      await rm(emittedServerDirectory, { recursive: true, force: true })
      await mkdir(outputDirectory, { recursive: true })
      await mkdir(serverDirectory, { recursive: true })
      if (await exists(hostingConfig)) await cp(hostingConfig, resolve(outputDirectory, "hosting.json"))
      await cp(workerSource, resolve(serverDirectory, "index.js"))
    },
  }
}
