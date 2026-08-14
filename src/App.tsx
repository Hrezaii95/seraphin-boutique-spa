import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { RitualFinder } from "./components/RitualFinder"
import { ServiceMenu } from "./components/ServiceMenu"
import { business, copy, gallery, localeMeta, type Locale } from "./content"

const QuietBloom = lazy(() => import("./components/QuietBloom").then((module) => ({ default: module.QuietBloom })))

const localeOrder: Locale[] = ["en", "hy", "ru"]

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem("seraphin-locale")
  if (stored === "en" || stored === "hy" || stored === "ru") return stored
  if (navigator.language.toLowerCase().startsWith("hy")) return "hy"
  if (navigator.language.toLowerCase().startsWith("ru")) return "ru"
  return "en"
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reduce ? 0.12 : 0.58, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ExternalLink({ href, children, className = "", label }: { href: string; children: ReactNode; className?: string; label?: string }) {
  return <a href={href} className={className} target="_blank" rel="noreferrer" aria-label={label}>{children}<span aria-hidden="true" className="link-arrow">↗</span></a>
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const t = copy[locale]

  useEffect(() => {
    document.documentElement.lang = locale === "hy" ? "hy" : locale
    window.localStorage.setItem("seraphin-locale", locale)
  }, [locale])

  useEffect(() => {
    if (!menuOpen) return
    const nav = navRef.current
    const firstLink = nav?.querySelector<HTMLAnchorElement>("a")
    const focusFrame = window.requestAnimationFrame(() => firstLink?.focus())
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== "Tab" || !nav) return
      const links = [...nav.querySelectorAll<HTMLAnchorElement>("a")]
      const first = links[0]
      const last = links.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        menuButtonRef.current?.focus()
      } else if (!event.shiftKey && document.activeElement === menuButtonRef.current) {
        event.preventDefault()
        first?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={`site locale-${locale}`}>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Seraphin Boutique Spa — home">
          <img src="images/seraphin-logo.jpg" alt="" width="48" height="48" />
          <span><b>SERAPHIN</b><small>boutique spa</small></span>
        </a>

        <nav ref={navRef} id="primary-menu" className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          <a href="#treatments" onClick={closeMenu}>{t.nav.treatments}</a>
          <a href="#finder" onClick={closeMenu}>{t.nav.finder}</a>
          <a href="#space" onClick={closeMenu}>{t.nav.space}</a>
          <a href="#visit" onClick={closeMenu}>{t.nav.visit}</a>
        </nav>

        <div className="header-actions">
          <div className="locale-switch" aria-label="Language">
            {localeOrder.map((item) => (
              <button key={item} className={locale === item ? "is-active" : ""} aria-pressed={locale === item} onClick={() => setLocale(item)}>
                {localeMeta[item].label}
              </button>
            ))}
          </div>
          <ExternalLink href={business.booking} className="header-book" label={`${t.nav.book}. ${t.common.opensNew}`}>{t.nav.book}</ExternalLink>
          <button ref={menuButtonRef} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-menu" onClick={() => setMenuOpen((open) => !open)}>
            <span className="sr-only">{menuOpen ? t.nav.close : t.nav.menu}</span>
            <span aria-hidden="true"></span><span aria-hidden="true"></span>
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="hero-body">{t.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#treatments">{t.hero.primary}<span aria-hidden="true">↓</span></a>
              <a className="button button-quiet" href="#finder">{t.hero.secondary}<span aria-hidden="true">→</span></a>
            </div>
            <p className="hero-note"><span aria-hidden="true"></span>{t.hero.note}</p>
          </div>
          <div className="hero-art">
            <div className="quiet-bloom">
              <Suspense fallback={<div className="quiet-bloom-loading" aria-hidden="true"></div>}>
                <QuietBloom ariaLabel={t.hero.art} />
              </Suspense>
            </div>
            <span className="hero-art-label">The Quiet Bloom <i>01</i></span>
          </div>
          <div className="hero-rail" aria-label="Highlights">
            {t.trust.map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}
          </div>
        </section>

        <section className="intro-section section-shell">
          <Reveal className="intro-grid">
            <div><p className="eyebrow">{t.intro.eyebrow}</p><h2>{t.intro.title}</h2></div>
            <p className="section-lead">{t.intro.body}</p>
          </Reveal>
          <div className="principle-line" aria-hidden="true"><span></span><i></i><span></span></div>
        </section>

        <section className="finder-section" id="finder">
          <RitualFinder locale={locale} />
        </section>

        <section className="menu-section section-shell" id="treatments">
          <ServiceMenu locale={locale} />
        </section>

        <section className="space-section" id="space">
          <div className="section-shell space-heading">
            <Reveal>
              <p className="eyebrow">{t.space.eyebrow}</p>
              <div className="space-title-row"><h2>{t.space.title}</h2><p>{t.space.body}</p></div>
            </Reveal>
          </div>
          <div className="gallery-grid">
            {gallery.map((image, index) => (
              <motion.figure key={image.src} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.06, duration: 0.5 }}>
                <img src={image.src} alt={t.space.captions[image.key]} loading="lazy" />
                <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{t.space.captions[image.key]}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        <section className="couples-section">
          <div className="couples-image" role="img" aria-label={t.space.captions[2]}></div>
          <Reveal className="couples-copy">
            <p className="eyebrow">{t.couples.eyebrow}</p>
            <h2>{t.couples.title}</h2>
            <p>{t.couples.body}</p>
            <a href="#treatments" className="text-link">{t.couples.cta}<span aria-hidden="true">→</span></a>
          </Reveal>
        </section>

        <section className="standards-section section-shell">
          <Reveal>
            <p className="eyebrow">{t.standards.eyebrow}</p>
            <h2>{t.standards.title}</h2>
          </Reveal>
          <div className="standards-list">
            {t.standards.items.map((item, index) => (
              <Reveal className="standard-item" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="visit-section" id="visit">
          <div className="visit-orbit" aria-hidden="true"><span></span><span></span><i></i></div>
          <Reveal className="visit-card">
            <p className="eyebrow">{t.visit.eyebrow}</p>
            <h2>{t.visit.title}</h2>
            <address>
              <a href={business.maps} target="_blank" rel="noreferrer">{t.visit.address}</a>
              <span>{t.visit.hours}</span>
            </address>
            <div className="visit-actions">
              <a href={business.phoneHref}>{t.visit.call}</a>
              <ExternalLink href={business.whatsapp}>{t.visit.whatsapp}</ExternalLink>
              <ExternalLink href={business.maps}>{t.visit.directions}</ExternalLink>
            </div>
            <p className="visit-note">{t.visit.note}</p>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><img src="images/seraphin-logo.jpg" alt="" width="72" height="72" /><p>{t.footer.line}</p></div>
        <div className="footer-links">
          <ExternalLink href={business.booking}>{t.nav.book}</ExternalLink>
          <ExternalLink href={business.instagram}>Instagram</ExternalLink>
          <a href={business.phoneHref}>{business.phone}</a>
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </div>
        <div className="footer-meta"><span>© 2026 Seraphin Boutique Spa. {t.footer.rights}</span><small>{t.footer.data}</small></div>
      </footer>

      <ExternalLink href={business.booking} className="mobile-book" label={`${t.nav.book}. ${t.common.opensNew}`}>{t.nav.book}</ExternalLink>
    </div>
  )
}
