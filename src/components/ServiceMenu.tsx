import { useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  business,
  localeMeta,
  services,
  type Locale,
  type ServiceGroup,
} from "../content"
import { copy as siteCopy } from "../content"

export type ServiceMenuCopy = {
  eyebrow: string
  title: string
  body: string
  groups: Record<ServiceGroup, string>
  from: string
  minutes: string
  book: string
  source: string
}

type ServiceMenuProps = {
  locale: Locale
  copy?: ServiceMenuCopy
}

const groups: ServiceGroup[] = ["massage", "couples", "enhancements"]
const easing = [0.22, 1, 0.36, 1] as const

export function ServiceMenu({ locale, copy: copyOverride }: ServiceMenuProps) {
  const copy = copyOverride ?? siteCopy[locale].menu
  const [activeGroup, setActiveGroup] = useState<ServiceGroup>("massage")
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduceMotion = useReducedMotion()
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(localeMeta[locale].intl, {
      style: "currency",
      currency: "AMD",
      maximumFractionDigits: 0,
    }).format(price)

  const selectTab = (index: number) => {
    const normalizedIndex = (index + groups.length) % groups.length
    setActiveGroup(groups[normalizedIndex])
    tabRefs.current[normalizedIndex]?.focus()
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault()
        selectTab(index + 1)
        break
      case "ArrowLeft":
        event.preventDefault()
        selectTab(index - 1)
        break
      case "Home":
        event.preventDefault()
        selectTab(0)
        break
      case "End":
        event.preventDefault()
        selectTab(groups.length - 1)
        break
    }
  }

  return (
    <section className="service-menu" id="service-menu" aria-labelledby="service-menu-title">
      <div className="service-menu__heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="service-menu-title">{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      <div className="service-tabs service-menu__tabs" role="tablist" aria-label={copy.eyebrow}>
        {groups.map((group, index) => (
          <button
            className="service-menu__tab"
            id={`service-tab-${group}`}
            key={group}
            type="button"
            role="tab"
            aria-selected={activeGroup === group}
            aria-controls={`service-panel-${group}`}
            tabIndex={activeGroup === group ? 0 : -1}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            onClick={() => setActiveGroup(group)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {copy.groups[group]}
            <span aria-hidden="true">
              {services.filter((service) => service.group === group).length.toString().padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      <div className="service-menu__panels">
        {groups.map((group) => (
          <div
            className="service-menu__panel"
            id={`service-panel-${group}`}
            key={group}
            role="tabpanel"
            aria-labelledby={`service-tab-${group}`}
            hidden={activeGroup !== group}
          >
            <AnimatePresence mode="wait" initial={false}>
              {activeGroup === group && (
                <motion.ol
                  className="service-list service-menu__list"
                  key={group}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.3, ease: easing }}
                >
                  {services.filter((service) => service.group === group).map((service, serviceIndex) => (
                    <li key={service.id}>
                      <article className="service-item service-menu__item" aria-labelledby={`service-${service.id}`}>
                        <header className="service-menu__service-heading">
                          <span aria-hidden="true">{String(serviceIndex + 1).padStart(2, "0")}</span>
                          <h3 id={`service-${service.id}`}>{service.name[locale]}</h3>
                        </header>
                        <p className="service-item__description">{service.description[locale]}</p>
                        <ul className="service-options service-menu__options" aria-label={service.name[locale]}>
                          {service.options.map((option) => {
                            const duration = option.minutes
                              ? `${option.minutes} ${copy.minutes}`
                              : option.note?.[locale]

                            return (
                              <li className="service-option" key={`${option.minutes ?? "addon"}-${option.price}`}>
                                <span className="service-menu__duration">{duration}</span>
                                <span className="service-menu__price">{formatPrice(option.price)}</span>
                                <a
                                  href={business.booking}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`${copy.book}: ${service.name[locale]}, ${duration}, ${formatPrice(option.price)}. ${siteCopy[locale].common.opensNew}`}
                                >
                                  {copy.book}
                                  <span aria-hidden="true">↗</span>
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      </article>
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="service-source service-menu__source">{copy.source}</p>
    </section>
  )
}
