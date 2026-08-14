import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { business, type Locale } from "../content"
import { passageCopy } from "./copy"
import { useAmbientSound } from "./useAmbientSound"
import type { QualityTier } from "./PassageScene"

const PassageScene = lazy(() => import("./PassageScene"))

type DeviceNavigator = Navigator & { deviceMemory?: number }

function getInitialQuality(): QualityTier {
  if (typeof window === "undefined") return "balanced"
  const probe = document.createElement("canvas")
  const context = probe.getContext("webgl2") || probe.getContext("webgl")
  const supported = Boolean(context)
  context?.getExtension("WEBGL_lose_context")?.loseContext()
  if (!supported) return "fallback"
  const device = navigator as DeviceNavigator
  if ((device.deviceMemory ?? 4) <= 2 || navigator.hardwareConcurrency <= 4) return "low"
  if (window.innerWidth < 820 || (device.deviceMemory ?? 8) <= 4) return "balanced"
  return "high"
}

function phaseFromProgress(progress: number) {
  if (progress < 0.15) return 0
  if (progress < 0.39) return 1
  if (progress < 0.67) return 2
  return 3
}

export function PassageHero({ locale, trust }: { locale: Locale; trust: readonly string[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [begun, setBegun] = useState(false)
  const [ready, setReady] = useState(false)
  const [quality, setQuality] = useState<QualityTier>(getInitialQuality)
  const reduceMotion = Boolean(useReducedMotion())
  const { enabled: soundEnabled, toggle: toggleSound } = useAmbientSound()
  const t = passageCopy[locale]
  const phase = phaseFromProgress(progress)
  const handleReady = useCallback(() => setReady(true), [])
  const handleFallback = useCallback(() => setQuality("fallback"), [])

  const updateProgress = useCallback(() => {
    frameRef.current = 0
    const section = sectionRef.current
    if (!section) return
    const rect = section.getBoundingClientRect()
    const travel = Math.max(1, section.offsetHeight - window.innerHeight)
    const next = Math.min(1, Math.max(0, -rect.top / travel))
    progressRef.current = next
    setProgress((current) => Math.abs(current - next) > 0.004 ? next : current)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(updateProgress)
    }
    updateProgress()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [updateProgress])

  const begin = () => {
    setBegun(true)
    if (reduceMotion) {
      document.querySelector("#treatments")?.scrollIntoView({ behavior: "auto" })
      return
    }
    const section = sectionRef.current
    if (!section) return
    const top = window.scrollY + section.getBoundingClientRect().top
    window.scrollTo({ top: top + window.innerHeight * 0.5, behavior: "smooth" })
  }

  const skip = () => document.querySelector<HTMLElement>("#treatments")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = stickyRef.current?.getBoundingClientRect()
    if (!rect) return
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    }
  }

  return (
    <section ref={sectionRef} className={`passage ${begun ? "is-begun" : ""} phase-${phase}`} id="top" data-phase={phase} data-progress={progress.toFixed(3)}>
      <div ref={stickyRef} className="passage__sticky" onPointerMove={onPointerMove} onPointerLeave={() => { pointerRef.current = { x: 0, y: 0 } }}>
        <div className="passage__fallback" aria-hidden="true"></div>
        {quality !== "fallback" && (
          <Suspense fallback={null}>
            <PassageScene
              progressRef={progressRef}
              pointerRef={pointerRef}
              reducedMotion={reduceMotion}
              quality={quality}
              onQualityChange={setQuality}
              onReady={handleReady}
              onFallback={handleFallback}
              ariaLabel={t.sceneLabel}
            />
          </Suspense>
        )}
        <div className="passage__veil" aria-hidden="true"></div>
        <div className="passage__grain" aria-hidden="true"></div>

        <div className="passage__tools">
          <button type="button" onClick={toggleSound} aria-pressed={soundEnabled} className="passage-tool">
            <span aria-hidden="true">{soundEnabled ? "◉" : "○"}</span>{soundEnabled ? t.soundOff : t.soundOn}
          </button>
          <button type="button" onClick={skip} className="passage-tool">{t.skip}<span aria-hidden="true">↓</span></button>
        </div>

        <div className={`passage__loader ${ready || quality === "fallback" ? "is-complete" : ""}`} role="status" aria-live="polite">
          <span></span><p>{ready || quality === "fallback" ? "" : t.loading}</p>
        </div>

        <motion.div
          className="passage__opening"
          animate={{ opacity: progress > 0.16 ? 0 : 1, y: progress > 0.16 ? -34 : 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={progress > 0.2}
          inert={progress > 0.2 ? true : undefined}
        >
          <p className="passage__eyebrow"><span></span>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="passage__body">{t.body}</p>
          <div className="passage__actions">
            <button className="passage__primary" type="button" onClick={begin}>{t.begin}<span aria-hidden="true">↘</span></button>
            <a className="passage__secondary" href="#treatments">{t.viewTreatments}</a>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {progress > 0.13 && progress < 0.87 && (
            <motion.div
              key={phase}
              className="passage__chapter"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>0{phase + 1}</span><p>{t.chapters[phase]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="passage__arrival"
          animate={{ opacity: progress > 0.82 ? 1 : 0, y: progress > 0.82 ? 0 : 28, pointerEvents: progress > 0.82 ? "auto" : "none" }}
          transition={{ duration: reduceMotion ? 0.1 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={progress <= 0.82}
          inert={progress <= 0.82 ? true : undefined}
        >
          <p className="passage__eyebrow"><span></span>{t.arrivalEyebrow}</p>
          <h2>{t.arrivalTitle}</h2>
          <p>{t.arrivalBody}</p>
          <div className="passage__actions">
            <a className="passage__primary" href={business.booking} target="_blank" rel="noreferrer">{t.book}<span aria-hidden="true">↗</span></a>
            <a className="passage__secondary" href="#finder">{t.viewTreatments}</a>
          </div>
        </motion.div>

        <div className="passage__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }}></span>
          <ol>{t.chapters.map((chapter, index) => <li className={index <= phase ? "is-active" : ""} key={chapter}>{String(index + 1).padStart(2, "0")}</li>)}</ol>
        </div>

        <div className={`passage__scroll ${progress > 0.1 ? "is-hidden" : ""}`} aria-hidden="true"><i></i><span>{t.scroll}</span></div>
        <div className="passage__trust" aria-label="Highlights">{trust.slice(0, 3).map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}</div>
      </div>
    </section>
  )
}

export default PassageHero
