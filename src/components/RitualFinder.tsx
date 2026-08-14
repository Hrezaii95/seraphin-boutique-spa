import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  business,
  localeMeta,
  services,
  type Locale,
} from "../content"
import { copy as siteCopy } from "../content"

export type RitualFinderCopy = {
  eyebrow: string
  title: string
  body: string
  choices: readonly {
    id: string
    label: string
    hint: string
    result: string
  }[]
  suggestion: string
  restart: string
  book: string
}

type RitualFinderProps = {
  locale: Locale
  copy?: RitualFinderCopy
}

const easing = [0.22, 1, 0.36, 1] as const

export function RitualFinder({ locale, copy: copyOverride }: RitualFinderProps) {
  const copy = copyOverride ?? siteCopy[locale].finder
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [restoreChoiceFocus, setRestoreChoiceFocus] = useState(false)
  const firstChoiceRef = useRef<HTMLButtonElement>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const reduceMotion = useReducedMotion()

  const selectedChoice = copy.choices.find((choice) => choice.id === selectedId)
  const suggestedService = selectedChoice
    ? services.find((service) => service.id === selectedChoice.result)
    : undefined

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(localeMeta[locale].intl, {
      style: "currency",
      currency: "AMD",
      maximumFractionDigits: 0,
    }).format(price)

  const restart = () => {
    setRestoreChoiceFocus(true)
    setSelectedId(null)
  }

  return (
    <section className="ritual-finder" id="ritual-finder" aria-labelledby="ritual-finder-title">
      <div className="ritual-finder__intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="ritual-finder-title">{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!suggestedService ? (
          <motion.div
            className="ritual-finder__choices"
            key="choices"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: easing }}
            onAnimationComplete={() => {
              if (restoreChoiceFocus) {
                firstChoiceRef.current?.focus()
                setRestoreChoiceFocus(false)
              }
            }}
          >
            <ul className="ritual-finder__choice-list" aria-label={copy.title}>
              {copy.choices.map((choice, index) => (
                <li key={choice.id}>
                  <button
                    className="ritual-choice ritual-finder__choice"
                    type="button"
                    ref={index === 0 ? firstChoiceRef : undefined}
                    onClick={() => setSelectedId(choice.id)}
                  >
                    <span className="ritual-finder__choice-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="ritual-finder__choice-copy">
                      <strong>{choice.label}</strong>
                      <small>{choice.hint}</small>
                    </span>
                    <span className="ritual-finder__choice-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.article
            className="ritual-result ritual-finder__result"
            key={suggestedService.id}
            aria-live="polite"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.38, ease: easing }}
            onAnimationComplete={() => resultHeadingRef.current?.focus()}
          >
            <p className="eyebrow">{copy.suggestion}</p>
            <h3 ref={resultHeadingRef} tabIndex={-1}>
              {suggestedService.name[locale]}
            </h3>
            <p className="ritual-finder__result-description">
              {suggestedService.description[locale]}
            </p>
            <ul className="ritual-finder__options" aria-label={suggestedService.name[locale]}>
              {suggestedService.options.map((option) => (
                <li key={`${option.minutes ?? "addon"}-${option.price}`}>
                  <span>
                    {option.minutes
                      ? `${option.minutes} ${siteCopy[locale].menu.minutes}`
                      : option.note?.[locale]}
                  </span>
                  <strong>{formatPrice(option.price)}</strong>
                </li>
              ))}
            </ul>
            <div className="ritual-result__actions ritual-finder__actions">
              <a
                className="button button--primary"
                href={business.booking}
                target="_blank"
                rel="noreferrer"
                aria-label={`${copy.book}: ${suggestedService.name[locale]}. ${siteCopy[locale].common.opensNew}`}
              >
                {copy.book}
                <span aria-hidden="true">↗</span>
              </a>
              <button className="button button--text" type="button" onClick={restart}>
                {copy.restart}
              </button>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  )
}
