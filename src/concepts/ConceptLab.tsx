import { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const ConceptScene = lazy(() => import("./ConceptScene").then((module) => ({ default: module.ConceptScene })))

function Scene(props: { kind: "lotus" | "threshold" | "oracle"; active?: boolean }) {
  return <Suspense fallback={<div className={`concept-scene concept-scene--${props.kind}`} aria-hidden="true" data-scene-ready="loading" />}><ConceptScene {...props} /></Suspense>
}

const bookingUrl = "https://emly.am/b/seraphin"

type ConceptId = "lotus" | "threshold" | "oracle"

const concepts: Array<{ id: ConceptId; number: string; name: string; thesis: string }> = [
  { id: "lotus", number: "01", name: "Living Lotus", thesis: "The brand symbol becomes a responsive object that opens for the visitor." },
  { id: "threshold", number: "02", name: "The Threshold", thesis: "Sell the emotional crossing from city noise into private ritual." },
  { id: "oracle", number: "03", name: "Ritual Oracle", thesis: "Turn the first screen into a personal, tactile treatment recommendation." },
]

function href(id: ConceptId) {
  return `?concept=${id}`
}

function BrandHeader({ current }: { current?: ConceptId }) {
  return (
    <header className="lab-header">
      <a className="lab-brand" href="./" aria-label="Seraphin concept lab home">
        <span className="lab-brand__mark" aria-hidden="true">S</span>
        <span className="lab-brand__word">Seraphin</span>
      </a>
      <nav className="lab-concept-nav" aria-label="Landing concepts">
        {concepts.map((concept) => <a key={concept.id} aria-label={`${concept.number} — ${concept.name}`} aria-current={current === concept.id ? "page" : undefined} href={href(concept.id)}><span>{concept.number}</span><em>{concept.name}</em></a>)}
      </nav>
      <a className="lab-book" href={bookingUrl} target="_blank" rel="noreferrer">Book now</a>
    </header>
  )
}

function Entrance({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : delay, duration: reduce ? 0.1 : 0.8, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function ConceptFooter({ current }: { current: ConceptId }) {
  const index = concepts.findIndex((item) => item.id === current)
  const next = concepts[(index + 1) % concepts.length]
  return <footer className="concept-footer"><span className="concept-footer__scroll">Seraphin exploration · not production</span><a href={href(next.id)}>Next: {next.name} <b>→</b></a></footer>
}

function LivingLotus() {
  const [open, setOpen] = useState(false)
  return (
    <div className={`concept concept--lotus ${open ? "is-awake" : ""}`}>
      <BrandHeader current="lotus" />
      <main className="concept-hero" id="main">
        <div className="concept-plate concept-plate--lotus" aria-hidden="true"></div>
        <div className="concept-vignette" aria-hidden="true"></div>
        <Scene kind="lotus" active={open} />
        <div className="lotus-halo" aria-hidden="true"><i></i><i></i><i></i></div>
        <div className="concept-copy concept-copy--left">
          <Entrance delay={0.1}><p className="concept-kicker">01 · The living symbol</p></Entrance>
          <Entrance delay={0.2}><h1>Stillness,<br /><em>opening.</em></h1></Entrance>
          <Entrance delay={0.4}><p className="concept-lede">A private Thai ritual begins before the first touch. Tap the lotus and let the brand welcome you in.</p></Entrance>
          <Entrance delay={0.58} className="concept-actions">
            <button className="concept-primary" type="button" onClick={() => setOpen((value) => !value)}>{open ? "The lotus is open" : "Open the lotus"}</button>
            <a className="concept-secondary" href={bookingUrl} target="_blank" rel="noreferrer">Reserve ritual ↗</a>
          </Entrance>
        </div>
        <div className="hook-proof hook-proof--lotus"><span>Why it hooks</span><p>The client owns a memorable object—not another spa photograph.</p></div>
      </main>
      <ConceptFooter current="lotus" />
    </div>
  )
}

function Threshold() {
  const [entered, setEntered] = useState(false)
  return (
    <div className={`concept concept--threshold ${entered ? "is-entered" : ""}`}>
      <BrandHeader current="threshold" />
      <main className="concept-hero" id="main">
        <div className="concept-plate concept-plate--threshold" aria-hidden="true"></div>
        <div className="concept-vignette" aria-hidden="true"></div>
        <Scene kind="threshold" />
        <div className="threshold-curtain threshold-curtain--left" aria-hidden="true"></div>
        <div className="threshold-curtain threshold-curtain--right" aria-hidden="true"></div>
        <div className="concept-copy concept-copy--threshold">
          <Entrance delay={0.1}><p className="concept-kicker">02 · The cinematic threshold</p></Entrance>
          <Entrance delay={0.22}><h1>Leave the city<br /><em>at the door.</em></h1></Entrance>
          <Entrance delay={0.44}><p className="concept-lede">One threshold. Low light. Your own room. A landing page that feels like arriving before the appointment begins.</p></Entrance>
          <Entrance delay={0.62} className="concept-actions concept-actions--center">
            <button className="concept-primary" type="button" onClick={() => setEntered(true)}>{entered ? "You are inside" : "Enter the quiet"}</button>
            <a className="concept-secondary" href={bookingUrl} target="_blank" rel="noreferrer">Book the room ↗</a>
          </Entrance>
        </div>
        <div className="threshold-depth" aria-hidden="true"><span></span><span></span><span></span></div>
      </main>
      <ConceptFooter current="threshold" />
    </div>
  )
}

const oracleChoices = {
  shoulders: { label: "Shoulders", result: "Head, Neck & Shoulder Ritual", detail: "30 min · 8,000 AMD", note: "Focused relief when the day sits high." },
  back: { label: "Lower back", result: "Deep Tissue Massage", detail: "60 min · 16,000 AMD", note: "Firm, deliberate work for held tension." },
  everywhere: { label: "Everywhere", result: "Aroma Oil Massage", detail: "60 min · 15,000 AMD", note: "Warm flowing care when you need to slow down." },
} as const

type OracleChoice = keyof typeof oracleChoices

function RitualOracle() {
  const [choice, setChoice] = useState<OracleChoice>("shoulders")
  const reduce = useReducedMotion()
  const selected = oracleChoices[choice]
  return (
    <div className={`concept concept--oracle oracle-focus--${choice}`}>
      <BrandHeader current="oracle" />
      <main className="concept-hero" id="main">
        <div className="concept-plate concept-plate--oracle" aria-hidden="true"></div>
        <div className="concept-vignette" aria-hidden="true"></div>
        <Scene kind="oracle" />
        <div className="oracle-pulse" aria-hidden="true"><i></i><i></i><i></i></div>
        <div className="concept-copy concept-copy--right">
          <Entrance delay={0.1}><p className="concept-kicker">03 · The ritual oracle</p></Entrance>
          <Entrance delay={0.22}><h1>Where does your body<br /><em>hold the day?</em></h1></Entrance>
          <Entrance delay={0.42}><p className="concept-lede">Touch a feeling. Seraphin turns it into a clear first recommendation—before the visitor ever opens a menu.</p></Entrance>
          <Entrance delay={0.56}>
            <div className="oracle-choices" role="group" aria-label="Choose where you feel tension">
              {(Object.keys(oracleChoices) as OracleChoice[]).map((id) => <button key={id} className="oracle-choice" type="button" aria-pressed={choice === id} onClick={() => setChoice(id)}>{oracleChoices[id].label}</button>)}
            </div>
            <motion.div className="oracle-result" key={choice} initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }} aria-live="polite">
              <div><small>Recommended now</small><strong>{selected.result}</strong><p>{selected.detail} · {selected.note}</p></div><a href={bookingUrl} target="_blank" rel="noreferrer" aria-label={`Book ${selected.result}`}>↗</a>
            </motion.div>
          </Entrance>
        </div>
      </main>
      <ConceptFooter current="oracle" />
    </div>
  )
}

function ConceptIndex() {
  const reduce = useReducedMotion()
  return (
    <div className="lab-index">
      <BrandHeader />
      <main id="main">
        <Entrance delay={0.08} className="lab-index__intro"><div><p className="concept-kicker">Seraphin · landing exploration</p><h1>Three hooks.<br />Three different contracts.</h1></div><p>The production site remains untouched. Open each direction full-screen and judge the first ten seconds.</p></Entrance>
        <div className="lab-index__grid">
          {concepts.map((concept, index) => <motion.a key={concept.id} href={href(concept.id)} className={`lab-card lab-card--${concept.id}`} initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.2 + index * 0.1, duration: reduce ? 0.1 : 0.7, ease: [0.22, 1, 0.36, 1] }}><span className="lab-card__number">{concept.number}</span><h2>{concept.name}</h2><p>{concept.thesis}</p><b className="lab-card__open">Open concept ↗</b></motion.a>)}
        </div>
      </main>
    </div>
  )
}

export function ConceptLab() {
  const concept = new URLSearchParams(window.location.search).get("concept") as ConceptId | null
  useEffect(() => {
    const label = concepts.find((item) => item.id === concept)?.name ?? "Landing Concept Lab"
    document.title = `${label} — Seraphin Boutique Spa`
  }, [concept])
  if (concept === "lotus") return <LivingLotus />
  if (concept === "threshold") return <Threshold />
  if (concept === "oracle") return <RitualOracle />
  return <ConceptIndex />
}
