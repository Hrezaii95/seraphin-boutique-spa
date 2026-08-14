import "@fontsource/noto-sans/latin-400.css"
import "@fontsource/noto-sans/latin-500.css"
import "@fontsource/noto-sans/latin-600.css"
import "@fontsource/noto-sans/cyrillic-400.css"
import "@fontsource/noto-sans/cyrillic-500.css"
import "@fontsource/noto-sans/cyrillic-600.css"
import "@fontsource/noto-serif/latin-400.css"
import "@fontsource/noto-serif/latin-500.css"
import "@fontsource/noto-serif/cyrillic-400.css"
import "@fontsource/noto-serif/cyrillic-500.css"
import "@fontsource/noto-sans-armenian/armenian-400.css"
import "@fontsource/noto-sans-armenian/armenian-500.css"
import "@fontsource/noto-sans-armenian/armenian-600.css"
import "@fontsource/noto-serif-armenian/armenian-400.css"
import "@fontsource/noto-serif-armenian/armenian-500.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
