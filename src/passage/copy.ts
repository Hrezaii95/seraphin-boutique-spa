import type { Locale } from "../content"

export type PassageCopy = {
  eyebrow: string
  title: string
  body: string
  begin: string
  viewTreatments: string
  skip: string
  soundOn: string
  soundOff: string
  scroll: string
  loading: string
  chapters: readonly [string, string, string, string]
  arrivalEyebrow: string
  arrivalTitle: string
  arrivalBody: string
  book: string
  sceneLabel: string
}

export const passageCopy: Record<Locale, PassageCopy> = {
  en: {
    eyebrow: "Seraphin · private Thai healing",
    title: "Enter the quiet.",
    body: "Cross the threshold into warm stone, botanical oil and a private ritual shaped around your pace.",
    begin: "Begin the passage",
    viewTreatments: "View treatments",
    skip: "Skip the 3D passage",
    soundOn: "Sound on",
    soundOff: "Sound off",
    scroll: "Scroll to travel",
    loading: "Preparing your passage",
    chapters: ["The threshold", "Warm stone", "Botanical oil", "The sanctuary"],
    arrivalEyebrow: "You have arrived",
    arrivalTitle: "Your ritual begins here.",
    arrivalBody: "Choose what your body needs today, then reserve your time in a private room.",
    book: "Book a ritual",
    sceneLabel: "An interactive three-dimensional passage through Seraphin's stone, oil, linen and private sanctuary",
  },
  hy: {
    eyebrow: "Seraphin · մասնավոր թաիլանդական խնամք",
    title: "Մտեք լռության մեջ։",
    body: "Անցեք ջերմ քարի, բուսական յուղի և ձեր ռիթմով ձևավորված մասնավոր խնամքի աշխարհ։",
    begin: "Սկսել ուղին",
    viewTreatments: "Տեսնել ծառայությունները",
    skip: "Բաց թողնել 3D ուղին",
    soundOn: "Միացնել ձայնը",
    soundOff: "Անջատել ձայնը",
    scroll: "Սահեցրեք՝ առաջ շարժվելու համար",
    loading: "Պատրաստում ենք ձեր ուղին",
    chapters: ["Մուտքը", "Ջերմ քար", "Բուսական յուղ", "Հանգստի սենյակ"],
    arrivalEyebrow: "Դուք հասել եք",
    arrivalTitle: "Ձեր խնամքը սկսվում է այստեղ։",
    arrivalBody: "Ընտրեք այն, ինչ այսօր անհրաժեշտ է ձեր մարմնին, ապա ամրագրեք ձեր ժամանակը մասնավոր սենյակում։",
    book: "Ամրագրել",
    sceneLabel: "Seraphin-ի քարի, յուղի, կտորի և մասնավոր հանգստի սենյակի միջով անցնող ինտերակտիվ եռաչափ ուղի",
  },
  ru: {
    eyebrow: "Seraphin · приватная тайская забота",
    title: "Войдите в тишину.",
    body: "Пройдите через тепло камня, растительные масла и приватный ритуал, созданный в вашем ритме.",
    begin: "Начать путь",
    viewTreatments: "Смотреть процедуры",
    skip: "Пропустить 3D-путешествие",
    soundOn: "Включить звук",
    soundOff: "Выключить звук",
    scroll: "Листайте, чтобы двигаться",
    loading: "Готовим пространство",
    chapters: ["Порог", "Тёплый камень", "Растительное масло", "Приватное пространство"],
    arrivalEyebrow: "Вы на месте",
    arrivalTitle: "Ваш ритуал начинается здесь.",
    arrivalBody: "Выберите то, что сегодня нужно вашему телу, и забронируйте время в приватном кабинете.",
    book: "Записаться",
    sceneLabel: "Интерактивное трёхмерное путешествие через камень, масло, ткань и приватное пространство Seraphin",
  },
}
