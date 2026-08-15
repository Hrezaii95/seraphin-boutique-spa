export type Locale = "en" | "hy" | "ru"
export type ServiceGroup = "massage" | "couples" | "enhancements"
export type Localized = Record<Locale, string>

export type ServiceOption = {
  minutes?: number
  price: number
  note?: Localized
}

export type Service = {
  id: string
  group: ServiceGroup
  name: Localized
  description: Localized
  options: ServiceOption[]
  featured?: boolean
}

export const localeMeta: Record<Locale, { label: string; intl: string }> = {
  en: { label: "EN", intl: "en-US" },
  hy: { label: "ՀԱՅ", intl: "hy-AM" },
  ru: { label: "РУС", intl: "ru-RU" },
}

export const business = {
  name: "Seraphin Boutique Spa",
  phone: "+374 55 587000",
  phoneHref: "tel:+37455587000",
  whatsapp: "https://wa.me/37455587000",
  booking: "https://emly.am/b/seraphin",
  instagram: "https://www.instagram.com/seraphin.spa/",
  maps: "https://www.google.com/maps/search/?api=1&query=40.2094191,44.5181624",
  email: "spa@seraphin.am",
}

export const copy = {
  en: {
    nav: { treatments: "Treatments", finder: "Ritual finder", space: "The space", visit: "Visit", book: "Book a ritual", menu: "Open menu", close: "Close menu" },
    hero: {
      eyebrow: "Boutique Thai spa · Yerevan",
      thresholdEyebrow: "Private Thai healing · Arabkir",
      thresholdTitle: "Enter the quiet.",
      thresholdBody: "A private ritual shaped around your pace.",
      title: "Come back to your body.",
      body: "Private Thai treatments, warm materials and an unhurried pace—shaped around what you need today.",
      primary: "Choose your treatment",
      secondary: "Find my ritual",
      note: "Open daily · 11:00–22:00",
      scroll: "Scroll to enter",
      discover: "Discover",
      art: "A floating carved Seraphin stone wrapped in moving golden silk above water",
    },
    trust: ["Private treatment rooms", "Thai-inspired techniques", "Couples suites", "Book online in minutes"],
    intro: { eyebrow: "Quiet care, precisely held", title: "A calmer kind of luxury.", body: "Not louder, not more complicated. Seraphin brings considered Thai techniques, attentive therapists and private rooms together in one restorative experience." },
    finder: {
      eyebrow: "Ritual finder", title: "What does your body need today?", body: "Choose the feeling you want to leave with. We’ll suggest a treatment and you can still adjust pressure, duration and aroma with your therapist.",
      choices: [
        { id: "release", label: "Release deep tension", hint: "Firm, focused care", result: "deep-tissue" },
        { id: "slow", label: "Slow everything down", hint: "Warm, flowing ritual", result: "aroma-oil" },
        { id: "ground", label: "Feel grounded", hint: "Heat and steady pressure", result: "hot-stone" },
        { id: "together", label: "Share the pause", hint: "A private suite for two", result: "couples-oil" },
        { id: "quick", label: "Reset in under an hour", hint: "Head, neck and shoulders", result: "head-neck-shoulder" },
      ],
      suggestion: "Your suggested ritual", restart: "Choose again", book: "Book this ritual",
    },
    menu: { eyebrow: "Treatment menu", title: "Choose your pace.", body: "Every treatment begins with a brief preference check. Select a duration now; pressure and focus can be confirmed when you arrive.", groups: { massage: "Massage", couples: "For two", enhancements: "Enhancements" }, from: "from", minutes: "min", book: "Book", source: "Prices transcribed from Seraphin’s current Emly booking menu on 14 August 2026. Final availability and price are confirmed during booking." },
    space: { eyebrow: "The space", title: "Designed to lower the volume.", body: "Low light, warm timber, private rooms and thoughtful preparation create a clear threshold between the city and your treatment.", captions: ["Private treatment room", "Warm oils, prepared slowly", "Traditional herbal compress", "A considered arrival"] },
    couples: { eyebrow: "For two", title: "Share the quiet, keep your own pace.", body: "Two therapists work side by side in a private double suite. Choose Thai, oil, aroma or hot stone treatments from 60 to 120 minutes.", cta: "Explore couples rituals" },
    standards: { eyebrow: "Your comfort", title: "Clear choices before treatment begins.", items: [{ title: "Pressure", body: "Choose gentle, medium or firm and change your mind at any time." }, { title: "Privacy", body: "Private rooms, clear draping and a brief consultation are part of every visit." }, { title: "Preference", body: "Tell us about focus areas, sensitivities and aromas you would rather avoid." }, { title: "Aftercare", body: "Take a moment in the lounge with a complimentary drink before returning to your day." }] },
    visit: { eyebrow: "Visit Seraphin", title: "Your quiet room in Arabkir.", address: "44/2 Mamikonyants Street, Yerevan", hours: "Daily, 11:00–22:00", call: "Call", whatsapp: "WhatsApp", directions: "Get directions", note: "Advance booking is recommended, especially for couples treatments." },
    footer: { line: "Private Thai healing, shaped around your pace.", rights: "All rights reserved.", data: "Business details and prices should be reconfirmed by the owner before commercial launch." },
    common: { opensNew: "Opens in a new tab", previous: "Previous image", next: "Next image" },
  },
  hy: {
    nav: { treatments: "Ծառայություններ", finder: "Ընտրել մերսում", space: "Մեր սրահը", visit: "Այցելել", book: "Ամրագրել", menu: "Բացել ցանկը", close: "Փակել ցանկը" },
    hero: {
      eyebrow: "Թաիլանդական բուտիկ սպա · Երևան",
      thresholdEyebrow: "Անհատական թաիլանդական խնամք · Արաբկիր",
      thresholdTitle: "Մուտք գործեք հանգստության աշխարհ։",
      thresholdBody: "Անհատական արարողություն՝ ձեր ռիթմին համահունչ։",
      title: "Վերադարձեք ձեր մարմնին։",
      body: "Մասնավոր թաիլանդական մերսումներ, ջերմ միջավայր և հանգիստ ընթացք՝ հարմարեցված այսօրվա ձեր կարիքներին։",
      primary: "Ընտրել մերսումը",
      secondary: "Գտնել իմ տարբերակը",
      note: "Բաց է ամեն օր · 11:00–22:00",
      scroll: "Սահեցրեք՝ մուտք գործելու համար",
      discover: "Բացահայտել",
      art: "Ջրի վերևում լողացող Seraphin-ի փորագրված քարը՝ շարժվող ոսկեգույն մետաքսով",
    },
    trust: ["Մասնավոր սենյակներ", "Թաիլանդական տեխնիկաներ", "Սենյակներ զույգերի համար", "Արագ առցանց ամրագրում"],
    intro: { eyebrow: "Հանգիստ և ճշգրիտ հոգատարություն", title: "Շքեղություն՝ առանց աղմուկի։", body: "Seraphin-ը միավորում է թաիլանդական խնամքի տեխնիկաները, ուշադիր մասնագետներին և մասնավոր սենյակները՝ լիարժեք հանգստի համար։" },
    finder: {
      eyebrow: "Ընտրության ուղեցույց", title: "Ի՞նչ է պետք ձեր մարմնին այսօր։", body: "Ընտրեք այն զգացողությունը, որով ցանկանում եք հեռանալ։ Ճնշումը, տևողությունը և բույրը կարող եք հարմարեցնել մասնագետի հետ։",
      choices: [
        { id: "release", label: "Թուլացնել խորը լարվածությունը", hint: "Ուժեղ և նպատակային", result: "deep-tissue" },
        { id: "slow", label: "Դանդաղեցնել ռիթմը", hint: "Ջերմ և սահուն", result: "aroma-oil" },
        { id: "ground", label: "Վերականգնել հավասարակշռությունը", hint: "Ջերմություն և կայուն ճնշում", result: "hot-stone" },
        { id: "together", label: "Կիսել հանգիստը", hint: "Մասնավոր սենյակ երկուսի համար", result: "couples-oil" },
        { id: "quick", label: "Արագ վերականգնվել", hint: "Գլուխ, պարանոց և ուսեր", result: "head-neck-shoulder" },
      ],
      suggestion: "Ձեզ առաջարկվող մերսումը", restart: "Ընտրել նորից", book: "Ամրագրել այս մերսումը",
    },
    menu: { eyebrow: "Ծառայությունների ցանկ", title: "Ընտրեք ձեր ընթացքը։", body: "Յուրաքանչյուր մերսում սկսվում է կարճ խորհրդակցությամբ։ Այժմ ընտրեք տևողությունը, իսկ ճնշումն ու շեշտադրումը կհստակեցնեք այցի ժամանակ։", groups: { massage: "Մերսում", couples: "Զույգերի համար", enhancements: "Լրացուցիչ" }, from: "սկսած", minutes: "րոպե", book: "Ամրագրել", source: "Գները վերցված են Seraphin-ի Emly ամրագրման ընթացիկ ցանկից՝ 2026 թ. օգոստոսի 14-ին։ Վերջնական հասանելիությունն ու գինը հաստատվում են ամրագրման ժամանակ։" },
    space: { eyebrow: "Մեր սրահը", title: "Միջավայր, որտեղ աղմուկը նվազում է։", body: "Մեղմ լույսը, տաք փայտը, մասնավոր սենյակներն ու խնամքով պատրաստված մանրամասները սահման են ստեղծում քաղաքի և ձեր հանգստի միջև։", captions: ["Մասնավոր մերսման սենյակ", "Դանդաղ պատրաստված տաք յուղեր", "Ավանդական բուսական կոմպրես", "Հանգիստ ընդունելություն"] },
    couples: { eyebrow: "Երկուսի համար", title: "Կիսեք հանգիստը՝ պահպանելով ձեր ընթացքը։", body: "Երկու մասնագետ միաժամանակ աշխատում են մասնավոր երկտեղանոց սենյակում։ Ընտրեք թաիլանդական, յուղային, արոմա կամ տաք քարերով մերսում՝ 60–120 րոպե։", cta: "Տեսնել զույգերի մերսումները" },
    standards: { eyebrow: "Ձեր հարմարավետությունը", title: "Հստակ ընտրություն՝ մինչև մերսումը։", items: [{ title: "Ճնշում", body: "Ընտրեք մեղմ, միջին կամ ուժեղ ճնշում և փոխեք այն ցանկացած պահի։" }, { title: "Գաղտնիություն", body: "Մասնավոր սենյակը, պատշաճ ծածկույթը և կարճ խորհրդակցությունը յուրաքանչյուր այցի մասն են։" }, { title: "Նախընտրություն", body: "Նշեք զգայուն հատվածները, ցանկալի շեշտադրումները և այն բույրերը, որոնցից ցանկանում եք խուսափել։" }, { title: "Մերսումից հետո", body: "Մնացեք մի պահ հանգստի գոտում և վայելեք հյուրասիրությունը։" }] },
    visit: { eyebrow: "Այցելեք Seraphin", title: "Ձեր հանգիստ սենյակը Արաբկիրում։", address: "Մամիկոնյանց 44/2, Երևան", hours: "Ամեն օր՝ 11:00–22:00", call: "Զանգահարել", whatsapp: "WhatsApp", directions: "Բացել քարտեզը", note: "Խորհուրդ ենք տալիս նախապես ամրագրել, հատկապես զույգերի մերսումների համար։" },
    footer: { line: "Մասնավոր թաիլանդական խնամք՝ ձեր ընթացքով։", rights: "Բոլոր իրավունքները պաշտպանված են։", data: "Գործարար տվյալներն ու գները պետք է վերջնականապես հաստատվեն սեփականատիրոջ կողմից։" },
    common: { opensNew: "Բացվում է նոր ներդիրում", previous: "Նախորդ նկարը", next: "Հաջորդ նկարը" },
  },
  ru: {
    nav: { treatments: "Процедуры", finder: "Подобрать ритуал", space: "Пространство", visit: "Контакты", book: "Записаться", menu: "Открыть меню", close: "Закрыть меню" },
    hero: {
      eyebrow: "Бутик тайского массажа · Ереван",
      thresholdEyebrow: "Персональная тайская забота · Арабкир",
      thresholdTitle: "Войдите в тишину.",
      thresholdBody: "Личный ритуал в вашем собственном ритме.",
      title: "Вернитесь к своему телу.",
      body: "Приватные тайские процедуры, тёплые материалы и спокойный ритм — в соответствии с тем, что нужно вам сегодня.",
      primary: "Выбрать процедуру",
      secondary: "Подобрать ритуал",
      note: "Ежедневно · 11:00–22:00",
      scroll: "Прокрутите, чтобы войти",
      discover: "Открыть",
      art: "Парящий над водой резной камень Seraphin в движущемся золотом шёлке",
    },
    trust: ["Приватные кабинеты", "Тайские техники", "Кабинеты для двоих", "Быстрая онлайн-запись"],
    intro: { eyebrow: "Точная забота в спокойном ритме", title: "Роскошь без лишнего шума.", body: "Seraphin объединяет продуманные тайские техники, внимательных специалистов и приватные кабинеты в одном восстанавливающем опыте." },
    finder: {
      eyebrow: "Подбор ритуала", title: "Что сегодня нужно вашему телу?", body: "Выберите желаемое ощущение после сеанса. Силу воздействия, продолжительность и аромат можно уточнить со специалистом.",
      choices: [
        { id: "release", label: "Снять глубокое напряжение", hint: "Сильное направленное воздействие", result: "deep-tissue" },
        { id: "slow", label: "Замедлиться", hint: "Тёплый плавный ритуал", result: "aroma-oil" },
        { id: "ground", label: "Вернуть равновесие", hint: "Тепло и ровное давление", result: "hot-stone" },
        { id: "together", label: "Разделить паузу", hint: "Приватный кабинет для двоих", result: "couples-oil" },
        { id: "quick", label: "Восстановиться за час", hint: "Голова, шея и плечи", result: "head-neck-shoulder" },
      ],
      suggestion: "Рекомендуемая процедура", restart: "Выбрать снова", book: "Записаться на процедуру",
    },
    menu: { eyebrow: "Меню процедур", title: "Выберите свой ритм.", body: "Каждый сеанс начинается с короткого уточнения предпочтений. Сейчас выберите продолжительность, а силу и зоны воздействия обсудите при встрече.", groups: { massage: "Массаж", couples: "Для двоих", enhancements: "Дополнения" }, from: "от", minutes: "мин", book: "Записаться", source: "Цены перенесены из действующего меню записи Seraphin в Emly 14 августа 2026 года. Итоговая доступность и стоимость подтверждаются при записи." },
    space: { eyebrow: "Пространство", title: "Место, где становится тише.", body: "Мягкий свет, тёплое дерево, приватные кабинеты и продуманные детали создают границу между городом и вашим временем для себя.", captions: ["Приватный кабинет", "Тёплые масла", "Традиционный травяной компресс", "Продуманная встреча"] },
    couples: { eyebrow: "Для двоих", title: "Разделите тишину, сохраняя свой ритм.", body: "Два специалиста работают рядом в приватном кабинете. Выберите тайский, масляный, арома- или массаж горячими камнями длительностью 60–120 минут.", cta: "Смотреть процедуры для двоих" },
    standards: { eyebrow: "Ваш комфорт", title: "Понятный выбор до начала процедуры.", items: [{ title: "Сила", body: "Выберите мягкое, среднее или сильное воздействие и измените решение в любой момент." }, { title: "Приватность", body: "Отдельный кабинет, корректное укрытие и короткая консультация входят в каждый визит." }, { title: "Предпочтения", body: "Расскажите о чувствительных зонах, желаемых акцентах и ароматах, которых стоит избегать." }, { title: "После сеанса", body: "Останьтесь ненадолго в зоне отдыха с комплиментарным напитком." }] },
    visit: { eyebrow: "Посетите Seraphin", title: "Ваше тихое место в Арабкире.", address: "ул. Мами­конянц 44/2, Ереван", hours: "Ежедневно, 11:00–22:00", call: "Позвонить", whatsapp: "WhatsApp", directions: "Открыть карту", note: "Рекомендуем предварительную запись, особенно на процедуры для двоих." },
    footer: { line: "Приватная тайская забота в вашем ритме.", rights: "Все права защищены.", data: "Деловые данные и цены должны быть окончательно подтверждены владельцем перед коммерческим запуском." },
    common: { opensNew: "Откроется в новой вкладке", previous: "Предыдущее изображение", next: "Следующее изображение" },
  },
} as const

const L = (en: string, hy: string, ru: string): Localized => ({ en, hy, ru })

export const services: Service[] = [
  {
    id: "thai-traditional", group: "massage", featured: true,
    name: L("Traditional Thai Massage", "Թաիլանդական ավանդական մերսում", "Традиционный тайский массаж"),
    description: L("Rhythmic compression, acupressure and assisted stretches for a grounded full-body reset.", "Ռիթմիկ սեղմումներ, ակուպրեսուրա և օժանդակ ձգումներ՝ ամբողջ մարմնի հավասարակշռության համար։", "Ритмичные надавливания, акупрессура и мягкие растяжки для восстановления всего тела."),
    options: [{ minutes: 60, price: 15000 }, { minutes: 90, price: 21000 }, { minutes: 120, price: 27000 }],
  },
  {
    id: "oil", group: "massage", featured: true,
    name: L("Classic Oil Massage", "Դասական յուղային մերսում", "Классический масляный массаж"),
    description: L("Long, flowing strokes with warm oil to soften tension and settle the nervous system.", "Երկար և սահուն շարժումներ տաք յուղով՝ լարվածությունը մեղմելու և հանգստանալու համար։", "Длинные плавные движения с тёплым маслом помогают смягчить напряжение и успокоиться."),
    options: [{ minutes: 60, price: 15000 }, { minutes: 90, price: 21000 }, { minutes: 120, price: 27000 }],
  },
  {
    id: "aroma-oil", group: "massage", featured: true,
    name: L("Aroma Oil Massage", "Արոմայուղային մերսում", "Аромамасляный массаж"),
    description: L("A classic oil massage with a chosen blend of lavender, eucalyptus, jasmine or lemongrass.", "Դասական յուղային մերսում՝ նարդոսի, էվկալիպտի, հասմիկի կամ լիմոնախոտի ընտրված խառնուրդով։", "Классический масляный массаж с выбранной смесью лаванды, эвкалипта, жасмина или лемонграсса."),
    options: [{ minutes: 60, price: 17000 }, { minutes: 90, price: 23000 }, { minutes: 120, price: 29000 }],
  },
  {
    id: "hot-stone", group: "massage", featured: true,
    name: L("Hot Stone Massage", "Տաք քարերով մերսում", "Массаж горячими камнями"),
    description: L("Heated basalt stones and slow gliding pressure bring warmth to areas holding tension.", "Տաքացված բազալտե քարերն ու դանդաղ սահող ճնշումը ջերմացնում են լարված հատվածները։", "Нагретые базальтовые камни и медленные движения прогревают зоны напряжения."),
    options: [{ minutes: 60, price: 17000 }, { minutes: 90, price: 23000 }, { minutes: 120, price: 29000 }],
  },
  {
    id: "herbal-ball", group: "massage",
    name: L("Hot Herbal Ball Massage", "Տաք բուսական գնդիկներով մերսում", "Массаж горячими травяными мешочками"),
    description: L("Steamed Thai herb pouches with lemongrass, ginger and turmeric are pressed along the body.", "Լիմոնախոտով, կոճապղպեղով և քրքումով գոլորշիացված թաիլանդական խոտաբույսերի տաք պարկեր։", "Распаренные тайские травяные мешочки с лемонграссом, имбирём и куркумой мягко прижимаются к телу."),
    options: [{ minutes: 60, price: 19000 }, { minutes: 90, price: 26000 }],
  },
  {
    id: "cellulite", group: "massage",
    name: L("Targeted Body Massage", "Թիրախային մարմնի մերսում", "Целевой массаж тела"),
    description: L("Focused kneading and rolling across selected body areas with an energising rhythm.", "Նպատակային հունցման և գլորման տեխնիկա՝ ընտրված մարմնամասերի համար։", "Интенсивные разминания и прокатывания выбранных зон тела в энергичном ритме."),
    options: [{ minutes: 60, price: 16000 }, { minutes: 90, price: 22000 }],
  },
  {
    id: "cupping-vacuum", group: "massage",
    name: L("Vacuum Cupping Massage", "Վակուումային քափինգ մերսում", "Вакуумный баночный массаж"),
    description: L("Controlled suction applied to selected areas as a focused, more intense treatment.", "Վերահսկվող վակուումային ազդեցություն ընտրված հատվածների վրա՝ ավելի ինտենսիվ խնամքի համար։", "Контролируемое вакуумное воздействие на выбранные зоны для более интенсивной работы."),
    options: [{ minutes: 40, price: 15000 }],
  },
  {
    id: "cupping-fire", group: "massage",
    name: L("Traditional Fire Cupping", "Ավանդական կրակով քափինգ", "Традиционные огневые банки"),
    description: L("Traditional flame-heated cupping for guests who prefer a deeper, concentrated sensation.", "Ավանդական կրակով տաքացվող բաժակներ՝ ավելի խորը և կենտրոնացված ազդեցության համար։", "Традиционные прогретые огнём банки для более глубокого и локального воздействия."),
    options: [{ minutes: 40, price: 17000 }],
  },
  {
    id: "deep-tissue", group: "massage", featured: true,
    name: L("Deep Tissue Massage", "Խորը հյուսվածքների մերսում", "Глубокий массаж тканей"),
    description: L("Firm, targeted pressure for persistent tension, stiffness and post-training recovery.", "Կայուն և նպատակային ճնշում՝ երկարատև լարվածության, կարկամության և մարզումից հետո վերականգնման համար։", "Сильное направленное воздействие при стойком напряжении, скованности и после тренировок."),
    options: [{ minutes: 60, price: 16000 }, { minutes: 90, price: 22000 }, { minutes: 120, price: 28000 }],
  },
  {
    id: "foot-reflexology", group: "massage",
    name: L("Thai Foot Reflexology", "Թաիլանդական ոտնաթաթի ռեֆլեքսոլոգիա", "Тайская рефлексология стоп"),
    description: L("Pressure-point work across the feet and lower legs for a light, grounded finish.", "Ճնշման կետային աշխատանք ոտնաթաթերի և սրունքների վրա՝ թեթևության զգացողության համար։", "Работа с точками стоп и голеней для ощущения лёгкости и устойчивости."),
    options: [{ minutes: 45, price: 10000 }, { minutes: 60, price: 13000 }],
  },
  {
    id: "head-neck-shoulder", group: "massage", featured: true,
    name: L("Head, Neck & Shoulder Ritual", "Գլխի, պարանոցի և ուսերի մերսում", "Массаж головы, шеи и плеч"),
    description: L("Focused care for the places that often carry a long day.", "Կենտրոնացված խնամք այն հատվածների համար, որտեղ հաճախ կուտակվում է օրվա լարվածությունը։", "Сфокусированная работа с зонами, в которых чаще всего накапливается напряжение дня."),
    options: [{ minutes: 30, price: 8000 }, { minutes: 45, price: 11000 }],
  },
  {
    id: "face", group: "massage",
    name: L("Face Massage", "Դեմքի մերսում", "Массаж лица"),
    description: L("Gentle lymphatic-style movements for the face, neck and décolleté.", "Նուրբ լիմֆատիկ շարժումներ դեմքի, պարանոցի և դեկոլտեի համար։", "Мягкие лимфодренажные движения для лица, шеи и зоны декольте."),
    options: [{ minutes: 30, price: 9000 }, { minutes: 45, price: 12000 }],
  },
  {
    id: "scrub-oil", group: "massage",
    name: L("Body Scrub & Oil Massage", "Մարմնի սկրաբ և յուղային մերսում", "Скраб и масляный массаж"),
    description: L("A full-body exfoliating scrub followed by a slow, relaxing oil massage.", "Ամբողջ մարմնի սկրաբ, որին հաջորդում է դանդաղ և հանգստացնող յուղային մերսում։", "Скраб для всего тела, за которым следует медленный расслабляющий масляный массаж."),
    options: [{ minutes: 60, price: 18000 }],
  },
  {
    id: "couples-thai", group: "couples",
    name: L("Couples Thai Massage", "Թաիլանդական մերսում զույգերի համար", "Тайский массаж для двоих"),
    description: L("Two therapists working in rhythm with traditional Thai techniques in a private double suite.", "Երկու մասնագետ միաժամանակ կիրառում են ավանդական թաիլանդական տեխնիկաներ մասնավոր երկտեղանոց սենյակում։", "Два специалиста одновременно выполняют традиционный тайский массаж в приватном кабинете."),
    options: [{ minutes: 60, price: 27000 }, { minutes: 90, price: 40000 }, { minutes: 120, price: 52000 }],
  },
  {
    id: "couples-oil", group: "couples", featured: true,
    name: L("Couples Oil Massage", "Յուղային մերսում զույգերի համար", "Масляный массаж для двоих"),
    description: L("A synchronised classic oil massage, side by side in a private suite.", "Համաժամանակյա դասական յուղային մերսում՝ կողք կողքի մասնավոր սենյակում։", "Синхронный классический масляный массаж вдвоём в приватном кабинете."),
    options: [{ minutes: 60, price: 27000 }, { minutes: 90, price: 40000 }, { minutes: 120, price: 52000 }],
  },
  {
    id: "couples-aroma", group: "couples",
    name: L("Couples Aroma Oil Massage", "Արոմայուղային մերսում զույգերի համար", "Аромамассаж для двоих"),
    description: L("Matching essential oil blends chosen together for a shared, aromatic ritual.", "Միասին ընտրված եթերայուղերի համադրված խառնուրդներ՝ համատեղ բուրավետ մերսման համար։", "Подобранные вместе смеси эфирных масел для общего ароматного ритуала."),
    options: [{ minutes: 60, price: 31000 }, { minutes: 90, price: 41000 }, { minutes: 120, price: 54000 }],
  },
  {
    id: "couples-hot-stone", group: "couples",
    name: L("Couples Hot Stone Massage", "Տաք քարերով մերսում զույգերի համար", "Массаж горячими камнями для двоих"),
    description: L("Synchronized warmth and slow stone work for two in the private double suite.", "Համաժամանակյա ջերմություն և տաք քարերով դանդաղ մերսում երկուսի համար։", "Синхронное тепло и медленная работа камнями для двоих в приватном кабинете."),
    options: [{ minutes: 60, price: 31000 }, { minutes: 90, price: 44000 }, { minutes: 120, price: 54000 }],
  },
  {
    id: "extra-head", group: "enhancements",
    name: L("Head Massage", "Գլխի մերսում", "Массаж головы"),
    description: L("Add focused scalp and temple work to any massage.", "Ավելացրեք գլխամաշկի և քունքերի խնամք ցանկացած մերսմանը։", "Добавьте работу с кожей головы и висками к любой процедуре."),
    options: [{ minutes: 15, price: 2500 }],
  },
  {
    id: "targeted-area", group: "enhancements",
    name: L("Targeted Area Massage", "Մարմնի ընտրված հատվածի մերսում", "Массаж выбранной зоны"),
    description: L("Extra time dedicated to one specific body area.", "Լրացուցիչ ժամանակ՝ մարմնի մեկ ընտրված հատվածի համար։", "Дополнительное время для одной выбранной зоны тела."),
    options: [{ minutes: 30, price: 9000 }, { minutes: 60, price: 13000 }, { minutes: 90, price: 16000 }],
  },
  {
    id: "body-scrub", group: "enhancements",
    name: L("Body Scrub", "Մարմնի սկրաբ", "Скраб для тела"),
    description: L("A tactile exfoliating step before or alongside your chosen ritual.", "Մարմնի նուրբ պիլինգ՝ ընտրված մերսումից առաջ կամ դրա հետ միասին։", "Мягкое отшелушивание перед выбранной процедурой или в дополнение к ней."),
    options: [{ minutes: 20, price: 5000 }],
  },
  {
    id: "premium-oil", group: "enhancements",
    name: L("Premium Essential Oil Blend", "Պրեմիում եթերայուղերի խառնուրդ", "Премиальная смесь эфирных масел"),
    description: L("Upgrade your oil treatment with a selected aromatic blend.", "Համալրեք յուղային մերսումը ընտրված բուրավետ խառնուրդով։", "Дополните масляный массаж выбранной ароматической смесью."),
    options: [{ price: 1500, note: L("add-on", "հավելում", "дополнение") }],
  },
  {
    id: "warm-compress", group: "enhancements",
    name: L("Warm Herbal Compress", "Տաք բուսական կոմպրես", "Тёплый травяной компресс"),
    description: L("Add warm steamed herbs to focused areas of the body.", "Ավելացրեք տաք գոլորշիացված խոտաբույսեր մարմնի ընտրված հատվածներին։", "Добавьте тёплые распаренные травы для выбранных зон тела."),
    options: [{ minutes: 20, price: 3000 }],
  },
  {
    id: "hot-towel", group: "enhancements",
    name: L("Hot Towel", "Տաք սրբիչ", "Горячее полотенце"),
    description: L("A brief warm-towel finish for hands, feet or a focus area.", "Տաք սրբիչով կարճ ավարտ՝ ձեռքերի, ոտքերի կամ ընտրված հատվածի համար։", "Короткое завершение тёплым полотенцем для рук, ног или выбранной зоны."),
    options: [{ minutes: 5, price: 1000 }],
  },
  {
    id: "extended-session", group: "enhancements",
    name: L("Extended Session", "Երկարացված մերսում", "Продление сеанса"),
    description: L("Add thirty unhurried minutes to your selected treatment.", "Ավելացրեք ևս երեսուն հանգիստ րոպե ընտրված մերսմանը։", "Добавьте тридцать спокойных минут к выбранной процедуре."),
    options: [{ minutes: 30, price: 7000 }],
  },
]

export const gallery = [
  { src: "images/room-green.jpg", key: 0 },
  { src: "images/warm-oil.jpg", key: 1 },
  { src: "images/herbal-compress.jpg", key: 2 },
  { src: "images/room-quiet.jpg", key: 3 },
] as const
