import { cubicBezier, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

import { business, copy, type Locale } from "../content"

type NativePortalHeroProps = {
  locale: Locale
}

const ease = cubicBezier(0.65, 0, 0.35, 1)

export function NativePortalHero({ locale }: NativePortalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const t = copy[locale]
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const portalScale = useTransform(scrollYProgress, [0, 0.16, 0.72, 1], [0.78, 0.92, 7.95, 8.2], { ease })
  const portalRotate = useTransform(scrollYProgress, [0, 0.18, 0.72], [45, 45, 0], { ease })
  const portalX = useTransform(scrollYProgress, [0, 0.72], ["0vw", "-22.25vw"], { ease })
  const imageRotate = useTransform(scrollYProgress, [0, 0.18, 0.72], [-45, -45, 0], { ease })
  const imageScale = useTransform(scrollYProgress, [0, 0.72], [1.8, 1.04], { ease })
  const thresholdY = useTransform(scrollYProgress, [0.16, 0.44], [0, -32])
  const sceneY = useTransform(scrollYProgress, [0.58, 0.82], [42, 0])
  const imageX = useTransform(scrollYProgress, [0, 1], [-2, 2])
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const element = sectionRef.current
    if (!element) return
    element.dataset.portalPhase = value < 0.48 ? "threshold" : value < 0.78 ? "opening" : "immersive"
  })

  const portalStyle = reduceMotion ? { scale: 8.2, rotate: 0, x: "-22.25vw" } : { scale: portalScale, rotate: portalRotate, x: portalX }
  const photoStyle = reduceMotion ? { rotate: 0, scale: 1.04, x: 0 } : { rotate: imageRotate, scale: imageScale, x: imageX }
  const openingStyle = reduceMotion ? { y: -32 } : { y: thresholdY }
  const finalStyle = reduceMotion ? { y: 0 } : { y: sceneY }

  return (
    <section
      ref={sectionRef}
      className={`native-portal-hero${reduceMotion ? " is-static" : ""}`}
      id="top"
      data-portal-phase={reduceMotion ? "immersive" : "threshold"}
      aria-labelledby="portal-title"
    >
      <div className="native-portal-hero__stage">
        <div className="native-portal-hero__paper" aria-hidden="true" />

        <motion.div className="native-portal-hero__logo">
          <img src="images/seraphin-logo.jpg" alt="Seraphin Boutique Spa" width="640" height="640" />
        </motion.div>

        <motion.div className="native-portal-hero__intro" style={openingStyle}>
          <p className="eyebrow">{t.hero.thresholdEyebrow}</p>
          <h1 id="portal-title">{t.hero.thresholdTitle}</h1>
          <div className="native-portal-hero__intro-foot">
            <p>{t.hero.thresholdBody}</p>
            <span>{t.hero.scroll}<i aria-hidden="true">↓</i></span>
          </div>
        </motion.div>

        <motion.div className="native-portal-hero__portal" style={portalStyle} aria-hidden="true">
          <motion.div className="native-portal-hero__photo" style={photoStyle}>
            <img src="images/room-green.jpg" alt="" fetchPriority="high" />
            <span />
          </motion.div>
        </motion.div>

        <motion.div className="native-portal-hero__arrival" style={finalStyle}>
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h2>{t.hero.title}</h2>
          <p className="native-portal-hero__arrival-body">{t.hero.body}</p>
          <div className="native-portal-hero__arrival-actions">
            <a className="button button-primary" href="#finder">{t.hero.secondary}<span aria-hidden="true">↓</span></a>
            <a className="button button-light" href={business.booking} target="_blank" rel="noreferrer">{t.nav.book}<span aria-hidden="true">↗</span></a>
          </div>
          <div className="native-portal-hero__arrival-meta">
            <span>{t.hero.note}</span>
            <a href="#treatments">{t.hero.discover}<i aria-hidden="true">↓</i></a>
          </div>
        </motion.div>

        <div className="native-portal-hero__rail" aria-hidden="true">
          <motion.span style={{ scaleY: reduceMotion ? 1 : progressScale }} />
        </div>
      </div>
    </section>
  )
}
