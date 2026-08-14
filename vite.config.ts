import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { sites } from "./build/sites-vite-plugin.ts"

export default defineConfig({
  base: "./",
  plugins: [react(), sites()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: true,
  },
})
