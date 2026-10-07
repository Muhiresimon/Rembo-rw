export type Lang = "EN" | "KN" | "FR";

export const LANGS: readonly Lang[] = ["EN", "KN", "FR"];

export type ServiceId = "passport" | "birth" | "criminal" | "name";
export type SectionId = "services" | "roadmaps" | "verify" | "diaspora" | "track" | "admin";

const en = {
  langName: "English",
  header: {
    tagline: "Your independent guide to government services",
    openNav: "Open navigation",
    language: "Language",
    nav: {
      services: "Services",
      roadmaps: "Roadmaps",
      verify: "Verify documents",
      diaspora: "Diaspora",
      track: "Track application",
      admin: "Admin",
    },
    mbaza: "Mbaza AI",
    admin: "Admin",
  },
  hero: {
    badge: "Rembo Rw · Rwanda",
    title: "Get your government service done —",
    titleAccent: "without the queue.",
    subtitle:
      "Find a service, understand exactly what you need, verify your documents and let our concierge complete the process for you.",
    search: "Search for a service…",
    cta: "Check my documents",
  },
  features: {
    prepare: {
      title: "Prepare with confidence",
      body: "Clear requirements and AI-assisted pre-checks before you submit.",
    },
    human: {
      title: "A person when you need one",
      body: "Our Admin can apply on Irembo and keep you updated at every step.",
    },
    data: {
      title: "Your data, handled with care",
      body: "Your documents stay on your device and are never uploaded.",
    },
  },
  services: {
    eyebrow: "Popular services",
    title: "Start with what you need",
    noResults: "No service matches your search. Try a different word.",
    explore: "Explore roadmaps",
    sourceLabel: "Source:",
    checked: "updated 6 Oct 2026",
    commonRequirements: "Common requirements",
    viewRequirements: "View requirements",
    askAdmin: "Ask an Admin to handle it",
    time: "Estimated time",
    fee: "Fee",
    confirmFee: "Confirm on Irembo",
    live: {
      heading: "Live from Irembo",
      loading: "Searching Irembo…",
      error: "Irembo is unreachable right now — try again shortly.",
      empty: "No Irembo service matches your search.",
      open: "Open on Irembo",
      requirements: "Requirements",
      details: "Good to know",
      show: "Show requirements",
      loadingDetail: "Fetching live details from Irembo…",
      detailError: "This service could not be loaded right now — tap again to retry.",
      processing: "Processing time",
      price: "Price",
      providedBy: "Provided by",
      applicants: "Who are you applying for?",
      other: "Other attachments",
      optional: "Optional attachments",
      notes: "Notes",
    },
    items: {
      passport: {
        title: "Child Passport",
        category: "Immigration",
        description: "Prepare the right documents for a minor passport application.",
        requirements: [
          "Child birth certificate",
          "Parent or guardian national ID",
          "Recent passport photo",
        ],
      },
      birth: {
        title: "Birth Certificate",
        category: "Civil status",
        description: "Request a birth certificate and understand the next steps.",
        requirements: [
          "Applicant identification",
          "Civil registration details",
          "Supporting record where requested",
        ],
      },
      criminal: {
        title: "Criminal Record Certificate",
        category: "Justice",
        description: "Get your police clearance certificate without the guesswork.",
        requirements: [
          "National ID or passport",
          "Applicant contact details",
          "Biometric or in-person step if requested",
        ],
      },
      name: {
        title: "Change of Name",
        category: "Civil status",
        description: "See the supporting documents and the approval journey.",
        requirements: [
          "National ID",
          "Birth certificate",
          "Legal supporting document for the change",
        ],
      },
    } as Record<
      ServiceId,
      { title: string; category: string; description: string; requirements: string[] }
    >,
  },
  diasporaBanner: {
    title: "Need a Rwanda document while abroad?",
    body: "Our Rwanda-based concierge can guide you through every eligible service.",
    cta: "Explore Diaspora",
  },
  pages: {
    roadmaps: {
      eyebrow: "Roadmaps",
      title: "See the whole journey before you start",
      description:
        "Every service is broken into clear steps, dependencies and next actions. Indicative requirements must be verified with the official provider.",
    },
    verify: {
      eyebrow: "Smart document pre-check",
      title: "Know what needs attention before you submit",
      description:
        "Upload a document for a fast, AI-assisted review of file quality and common requirements. This is not official government verification.",
    },
    diaspora: {
      eyebrow: "Diaspora concierge",
      title: "Need a Rwanda document while abroad?",
      description:
        "Let our Rwanda-based concierge guide you through document preparation, follow-up and delivery where the service legally allows representative assistance.",
    },
    track: {
      eyebrow: "Track application",
      title: "Stay close to your application",
      description:
        "Enter your application number or phone number to see the latest concierge and official processing status.",
    },
    admin: {
      eyebrow: "Admin workspace",
      title: "Keep every application moving",
      description:
        "A focused workspace for concierge operators. Requests sent by clients appear here instantly.",
    },
  },
  roadmaps: {
    active: "Active roadmap",
    goal: "Child Passport",
    meta: "5 steps · about 10–15 days",
    progress: "2 of 5 complete",
    current: "Current",
    continue: "Continue roadmap",
    steps: [
      { label: "Your goal", title: "Child Passport", detail: "What you want to achieve" },
      { label: "Step 1", title: "Birth certificate", detail: "Required document" },
      { label: "Step 2", title: "Parent national ID", detail: "Required document" },
      { label: "Step 3", title: "Passport photo", detail: "White background · clear face" },
      { label: "Final result", title: "Passport ready", detail: "Download or collect" },
    ],
    decoder: "Plain-language decoder",
    listen: "Listen",
    kinyarwanda: "Kinyarwanda",
    francais: "French",
    terms: [
      {
        term: "Power of Attorney",
        short: "A document that lets another person legally act for you.",
        kn: "Ni inyandiko iha undi muntu uburenganzira bwo gukora ibikorwa ku muryango wawe.",
        fr: "Un document permettant à une personne d’agir légalement en votre nom.",
      },
      {
        term: "Tax Clearance",
        short: "Proof that your tax obligations are up to date.",
        kn: "Ni icyemezo kerekana ko imisoro yawe byose byishyuwe.",
        fr: "Une preuve que vos obligations fiscales sont à jour.",
      },
      {
        term: "Notarized document",
        short: "A document confirmed by an authorized notary.",
        kn: "Ni inyandiko yemejwe na noteri ufite uburenganzira bwo kuyemera.",
        fr: "Un document certifié par un notaire autorisé.",
      },
    ],
  },
  documents: [
    { name: "Birth certificate", detail: "Civil registration", category: "Civil status" },
    { name: "Criminal record certificate", detail: "Police clearance", category: "Justice" },
    { name: "Nationality certificate", detail: "Proof of nationality", category: "Civil status" },
    {
      name: "Certificate of celibacy",
      detail: "Proof of marital status",
      category: "Civil status",
    },
  ],
  verify: {
    heading: "AI document check",
    sub: "File validation · quality · required fields",
    findLabel: "First, find your document",
    search: "Search, e.g. birth certificate…",
    noMatch: "No matching document yet. Try another name or search in English.",
    drop: "Drop your document here or click to choose",
    dropAlt: "JPEG, PNG or PDF · max 2 MB",
    run: "Run pre-check",
    checks: ["File format accepted", "File size acceptable", "Image appears readable"],
    humanReview: "Signature and completeness need a human review",
    disclaimer:
      "This review is a helpful pre-check only. It does not confirm acceptance by Irembo or any government institution.",
    whatWeCheck: "What we check",
    checkList: [
      "File type and size",
      "Image sharpness",
      "Readable text",
      "Dates and expiry",
      "Service-specific requirements",
    ],
    helpTitle: "Need help understanding a warning?",
    helpBody: "Mbaza can explain document terms in English, Kinyarwanda or French.",
    askMbaza: "Ask Mbaza",
  },
  diaspora: {
    heading: "A trusted bridge back home",
    body: "Choose your service, tell us where you live, upload your documents and we will help you understand the Rwanda-side process.",
    steps: [
      "Choose a service",
      "Tell us where you live",
      "Pre-check documents",
      "Follow-up from Rwanda",
    ],
    cta: "Start diaspora request",
    delivery: "Delivery options",
    options: [
      { title: "Digital delivery", detail: "Secure digital result when available" },
      { title: "Local pickup", detail: "Collect from a Rwanda partner" },
      { title: "International courier", detail: "Delivery address and tracking" },
    ],
    important:
      "Availability depends on the specific service, government requirements and authorization. Not every service can be completed remotely.",
  },
  track: {
    heading: "Find your application",
    sub: "Your information stays on your device.",
    placeholder: "Application number or phone number",
    search: "Search",
    timelineLabel: "Application timeline",
    current: "Current",
    timeline: [
      "Request received",
      "Documents checked",
      "Concierge processing",
      "Submitted to Irembo",
      "Government review",
      "Ready for delivery",
    ],
  },
  admin: {
    stats: ["Total requests", "New this week", "Distinct services", "Distinct clients"],
    recent: "Recent requests",
    recentSub: "Requests sent by clients from the service cards.",
    export: "Export CSV",
    columns: ["Client", "Service", "AI status", "Irembo status", "Action"],
    newRequest: "New request",
    adminToApply: "Admin to apply",
    call: "Call →",
    open: "Open →",
    empty: "No requests yet. Requests sent from a service card appear here.",
  },
  footer: {
    left: "© 2026 Concierge Rwanda · Independent service concierge",
    right:
      "Not affiliated with Irembo or the Government of Rwanda. Always confirm fees and requirements with the official provider.",
  },
  floating: {
    askMbaza: "Ask Mbaza",
    whatsapp: "WhatsApp",
    whatsappLabel: "Chat on WhatsApp",
  },
  mbaza: {
    title: "Mbaza AI",
    subtitle: "Your service assistant",
    greeting: "Muraho! I am Mbaza. Ask me about a service, a roadmap step or a document warning.",
    thinking: "Mbaza is thinking…",
    input: "Ask about a service…",
    close: "Close",
    suggestions: [
      "What do I need for a child passport?",
      "What is a Power of Attorney?",
      "How do I get a criminal record certificate?",
    ],
    errors: {
      credits: "AI credits are used up for now.",
      rate: "Too many questions — please wait a moment.",
      generic: "Mbaza could not answer.",
      empty: "Mbaza returned no answer. Please try again.",
    },
  },
  dialog: {
    eyebrow: "Ask an Admin to handle it",
    noTime:
      "No time to queue? Let our Admin apply for you. Leave your details and we will take care of it.",
    name: "Full name",
    phone: "Phone (07…)",
    note: "Anything we should know? (optional)",
    submit: "Ask an Admin to handle it",
    success: "Thank you! Your request was sent. An Admin will call you on",
    successTail: "to finish the application on Irembo.",
    close: "Close",
    ariaClose: "Close dialog",
  },
};

export type Dict = typeof en;

const kn: Dict = {
  langName: "Kinyarwanda",
  header: {
    tagline: "Umuyobori wawe wigenga ku serivisi za Leta",
    openNav: "Fungura menyu",
    language: "Ururimi",
    nav: {
      services: "Serivisi",
      roadmaps: "Inzira",
      verify: "Kugenzura ibyangombwa",
      diaspora: "Abanyarwanda mu mahanga",
      track: "Kurikirana icungwa",
      admin: "Umuyobozi",
    },
    mbaza: "Mbaza AI",
    admin: "Umuyobozi",
  },
  hero: {
    badge: "Rembo Rw · Rwanda",
    title: "Kora ibikorwa bya Leta —",
    titleAccent: "utabanje kwinjira mu rutonde.",
    subtitle:
      "Shakisha serivisi, umenye neza icyo ukeneye, ugenzure ibyangombwa byawe, noneho reka Umufasha wacu arangize ibikorwa byose.",
    search: "Shakisha serivisi…",
    cta: "Genzura ibyangombwa byanjye",
  },
  features: {
    prepare: {
      title: "Tegura neza mbere yo gutanga",
      body: "Ibyangombwa bisobanutse n’isuzuma rya AI mbere yo gutanga ibyawawe.",
    },
    human: {
      title: "Umuntu iyo ukeneye",
      body: "Umuyobozi wacu ashobora gutanga icungwa kuri Irembo kandi akumenyesha kuri buri ntambwe.",
    },
    data: {
      title: "Amakuru yawe abikwa neza",
      body: "Ibyangombwa byawe biguma kuri mudasobwa yawe gusa, kandi ntibutumwa ku mubuga.",
    },
  },
  services: {
    eyebrow: "Serivisi zikenewe",
    title: "Tangira n’icyo ukeneye",
    noResults: "Nta serivisi ihuye n’ibyo washatse. Gerageza ukundi.",
    explore: "Reba inzira",
    sourceLabel: "Inkomoko:",
    checked: "byavuguruwe ku 6 Ugushyingo 2026",
    commonRequirements: "Ibyangombwa bisanzwe",
    viewRequirements: "Reba ibyangombwa",
    askAdmin: "Saba umuyobozi agukorere",
    time: "Igihe bihagarike",
    fee: "Amafaranga",
    confirmFee: "Emeza kuri Irembo",
    live: {
      heading: "Biva mu buryo bwo kuri Irembo",
      loading: "Turashakisha kuri Irembo…",
      error: "Irembo ntirahagarika ubu — ongera ugerageze vuba.",
      empty: "Nta serivisi y’Irembo ihuye n’igice ushatse.",
      open: "Fungura kuri Irembo",
      requirements: "Ibyifuza",
      details: "Ibyo akeneye kumenya",
      show: "Reba ibyifuza",
      loadingDetail: "Turakira amakuru yo mu buryo bwo kuri Irembo…",
      detailError: "Iyi serivisi ntirakuriyeho vuba — ongera ugerageze.",
      processing: "Igihe dosiye imara",
      price: "Igiciro",
      providedBy: "Yatanzwe na",
      applicants: "Urasabira nde?",
      other: "Imigereka yindi",
      optional: "Imigereka y’ubushake",
      notes: "Ibyingenzi",
    },
    items: {
      passport: {
        title: "Pasiporo y’umwana",
        category: "Imyobozi y’urugendo",
        description: "Tegura ibyangombwa byihariye gusaba pasiporo y’umwana.",
        requirements: [
          "Icyemezo cy’amavuko cy’umwana",
          "Indangamuntu y’umubyeyi cyangwa y’umwunganizi",
          "Ifoto ya pasiporo ya vuba",
        ],
      },
      birth: {
        title: "Icyemezo cy’amavuko",
        category: "Serivisi z’amavuko",
        description: "Saba icyemezo cy’amavuko maze ubone ibikurikira.",
        requirements: [
          "Indangamuntu y’uwisaba",
          "Amakuru y’aho yavutse n’itariiki y’amavuko",
          "Inyandiko yongerwaho iyo isabwa",
        ],
      },
      criminal: {
        title: "Icyemezo cy’uko utakatiwe",
        category: "Ubusaranganya",
        description: "Fata icyemezo cy’ubwisungane mu buryo busobanutse.",
        requirements: [
          "Indangamuntu cyangwa pasiporo",
          "Aderesi n’umubare wa telefone y’uwisaba",
          "Gupima udushyinge cyangwa kujya wiyerekana iyo bisabwa",
        ],
      },
      name: {
        title: "Guhindura izina",
        category: "Serivisi z’amavuko",
        description: "Reba ibyangombwa byongerwaho n’inzira yemewe yo guhindura izina.",
        requirements: [
          "Indangamuntu",
          "Icyemezo cy’amavuko",
          "Inyandiko yemewe igaragaza impamvu yo guhindura",
        ],
      },
    },
  },
  diasporaBanner: {
    title: "Ukeneye inyandiko ya Leta uri hanze y’igihugu?",
    body: "Umufasha wacu uri mu Rwanda akugira inama mu buryo bwose bushoboka.",
    cta: "Reba serivisi z’abanyarwanda mu mahanga",
  },
  pages: {
    roadmaps: {
      eyebrow: "Inzira",
      title: "Reba inzira yose mbere yo gutangira",
      description:
        "Buri serivisi igabanywa mu ntambwe zisobanutse, ibyo isaba n’igikorwa gikurikira. Ibyangombwa twerekana ni bya hafi, bigenzurwa na rubuga ruisanzwe.",
    },
    verify: {
      eyebrow: "Isuzuma rya hafi ry’ibyangombwa",
      title: "Menya ibikeneye gukemurwa mbere yo gutanga",
      description:
        "Shyiramo inyandiko kugirango duherekeze ubuziranenge bw’idosiye n’ibyangombwa bisabwa byihariye. Ibi si igenzuriro rya Leta.",
    },
    diaspora: {
      eyebrow: "Umufasha w’abanyarwanda mu mahanga",
      title: "Ukeneye inyandiko ya Leta uri hanze y’igihugu?",
      description:
        "Reka Umufasha wacu uri mu Rwanda akugira inama mu gutekateka ibyangombwa, gukurikirana no gutwara — aho serivisi yemerera umuntu gukora ibikorwa ku muryango.",
    },
    track: {
      eyebrow: "Kurikirana icungwa",
      title: "Kurikirana icungwa cyawe buri gihe",
      description:
        "Andika nomero y’icungwa cyawe cyangwa nomero ya telefone kugira ngo ubone uko bigenda.",
    },
    admin: {
      eyebrow: "Umwanya w’akazi w’umuyobozi",
      title: "Shyira ibicungwa byose mu nzira",
      description:
        "Umwanya ushyizeho w’abakora ubufasha. Ibisabwa abakiriya batumije bihita bigaragara hano.",
    },
  },
  roadmaps: {
    active: "Inzira ikora",
    goal: "Pasiporo y’umwana",
    meta: "Intambwe 5 · hafi iminsi 10–15",
    progress: "2 kuri 5 ziheze",
    current: "Ubu",
    continue: "Komeza inzira",
    steps: [
      { label: "Intego yawe", title: "Pasiporo y’umwana", detail: "Icyo wifuza kugera" },
      { label: "Intambwe 1", title: "Icyemezo cy’amavuko", detail: "Ibyangombwa bisabwa" },
      { label: "Intambwe 2", title: "Indangamuntu y’umubyeyi", detail: "Ibyangombwa bisabwa" },
      {
        label: "Intambwe 3",
        title: "Ifoto ya pasiporo",
        detail: "Mbuga umweru · isura isobanutse",
      },
      { label: "Igisubizo", title: "Pasiporo yawe ifatika", detail: "Kuramura cyangwa gufata" },
    ],
    decoder: "Isobanurirwa mu buryo busanzwe",
    listen: "Wumva",
    kinyarwanda: "Ikinyarwanda",
    francais: "Igifaransa",
    terms: [
      {
        term: "Power of Attorney",
        short: "Ni inyandiko iha undi muntu uburenganzira bwo gukora ibikorwa ku muryango wawe.",
        kn: "Ni inyandiko iha undi muntu uburenganzira bwo gukora ibikorwa ku muryango wawe.",
        fr: "Un document permettant à une personne d’agir légalement en votre nom.",
      },
      {
        term: "Tax Clearance",
        short: "Ni icyemezo kerekana ko imisoro yawe byose byishyuwe.",
        kn: "Ni icyemezo kerekana ko imisoro yawe byose byishyuwe.",
        fr: "Une preuve que vos obligations fiscales sont à jour.",
      },
      {
        term: "Notarized document",
        short: "Ni inyandiko yemejwe na noteri ufite uburenganzira bwo kuyemera.",
        kn: "Ni inyandiko yemejwe na noteri ufite uburenganzira bwo kuyemera.",
        fr: "Un document certifié par un notaire autorisé.",
      },
    ],
  },
  documents: [
    {
      name: "Icyemezo cy’amavuko",
      detail: "Kwiyandikisha amavuko",
      category: "Serivisi z’amavuko",
    },
    { name: "Icyemezo cy’uko utakatiwe", detail: "Ubwisungane", category: "Ubusaranganya" },
    {
      name: "Icyemezo cy’ubwenegihugu",
      detail: "Kugaragaza ubwenegihugu",
      category: "Serivisi z’amavuko",
    },
    {
      name: "Icyemezo cy’uko uri ingaragu",
      detail: "Kugaragaza uburyo bwawe bw’umuryango",
      category: "Serivisi z’amavuko",
    },
  ],
  verify: {
    heading: "Isuzuma ry’ibyangombwa na AI",
    sub: "Kwemerera idosiye · ubuziranenge · ibisabwa",
    findLabel: "Tangira ushakiye inyandiko yawe",
    search: "Shakisha, urugero: icyemezo cy’amavuko…",
    noMatch: "Nta nyandiko ihuye. Gerageza izina kindi cyangwa ushake mu Icyongereza.",
    drop: "Shyiramo inyandiko yawe hano cyangwa ikande kugirango uhitemo",
    dropAlt: "JPEG, PNG cyangwa PDF · ntarenga 2 MB",
    run: "Tangira isuzuma",
    checks: ["Ubwoko bw’idosiye bwemewe", "Ingano y’idosiye yemewe", "Ifoto isobanutse"],
    humanReview: "Umugenyi n’ubuziranenge bingenzurwa n’umuntu",
    disclaimer: "Iri ni isuzuma rya hafi gusa. Ntirumenya ko Irembo cyangwa leta izayemera.",
    whatWeCheck: "Ibyo dusuzuma",
    checkList: [
      "Ubwoko n’ingano y’idosiye",
      "Uburyo ifoto imeze",
      "Amagambo asobanutse",
      "Amatariki n’igihe ikurikira",
      "Ibyangombwa byihariye buri serivisi",
    ],
    helpTitle: "Urashaka ubufasha mu kumenya uruburunguzo?",
    helpBody:
      "Mbaza asobanura amazina y’inyandiko mu Kinyarwanda, mu Icyongereza cyangwa mu Igifaransa.",
    askMbaza: "Baza Mbaza",
  },
  diaspora: {
    heading: "Ihuriro ry’izera ryagana iharo",
    body: "Hitamo serivisi yawe, tubwire aho uharura, shyiramo ibyangombwa byawe, noneho tukakugira inama ku buryo bukorerwa mu Rwanda.",
    steps: [
      "Hitamo serivisi",
      "Tubwire aho uharura",
      "Isuzuma rya hafi ry’ibyangombwa",
      "Kurikirana uva mu Rwanda",
    ],
    cta: "Tangira icungwa cyawe",
    delivery: "Uburyo bwo gutwara",
    options: [
      {
        title: "Gutanga kuri mudasobwa",
        detail: "Igisubizo kigezwe kuri mudasobwa igihe kiboneka",
      },
      { title: "Kujya gufata", detail: "Fata ku muduganda wacu uri mu Rwanda" },
      { title: "Gutwara mu mahanga", detail: "Aderesi yo gutwara n’ikurikirana" },
    ],
    important:
      "Ibyo biboneka bigaterwa na serivisi yihariye, ibisabwa bya Leta n’ubwemerero. Si byose bishobora gukorwa hanze y’igihugu.",
  },
  track: {
    heading: "Shakisha icungwa cyawe",
    sub: "Amakuru yawe aguma kuri mudasobwa yawe.",
    placeholder: "Nomero y’icungwa cyangwa nomero ya telefone",
    search: "Shakisha",
    timelineLabel: "Ukurikirane kw’icungwa cyawe",
    current: "Ubu",
    timeline: [
      "Isaba ryakiriwe",
      "Ibyangombwa byasuzumwe",
      "Umufasha aracyakora",
      "Byatanzwe kuri Irembo",
      "Leta ikagenzura",
      "Igisubizo cyagihe kugera",
    ],
  },
  admin: {
    stats: [
      "Ibisabwa byose",
      "Ibyavuye muri iki gihe",
      "Serivisi zitandukanye",
      "Abakiriya batandukanye",
    ],
    recent: "Ibisabwa bya vuba",
    recentSub: "Ibisabwa abakiriya batumije biva ku karutonde ka serivisi.",
    export: "Kuramo dosiye CSV",
    columns: ["Umukiriya", "Serivisi", "Imimerere ya AI", "Irembo", "Igikorwa"],
    newRequest: "Isaba rishya",
    adminToApply: "Umuyobozi azatanga",
    call: "Hamagara →",
    open: "Fungura →",
    empty: "Nta bicungwa byatanzwe. Ibisabwa batumije bihita bigaragara hano.",
  },
  footer: {
    left: "© 2026 Concierge Rwanda · Umufasha wigenga ku serivisi",
    right:
      "Ntituguyemo na Irembo cyangwa na Leta y’u Rwanda. Emeza amafaranga n’ibyangombwa kuri rubuga ruisanzwe.",
  },
  floating: {
    askMbaza: "Baza Mbaza",
    whatsapp: "WhatsApp",
    whatsappLabel: "Gukora kuri WhatsApp",
  },
  mbaza: {
    title: "Mbaza AI",
    subtitle: "Umufasha wawe ku serivisi",
    greeting:
      "Muraho! Ndi Mbaza. Baza ku buryo, ku ntambwe y’inzira cyangwa ku ruburunguzo rw’inyandiko.",
    thinking: "Mbaza iracyibera…",
    input: "Baza ku buryo…",
    close: "Funga",
    suggestions: [
      "Nkeneye iki kuri pasiporo y’umwana?",
      "Power of Attorney ni iki?",
      "Nakora iki kugira ntabone icyemezo cy’uko utakatiwe?",
    ],
    errors: {
      credits: "Amakarita ya AI yarangiye ubu.",
      rate: "Bibazo byinshi — tegereza gato.",
      generic: "Mbaza yatashoboye kugusubiza.",
      empty: "Mbaza yatashoboye kugusubiza. Gerageza nanone.",
    },
  },
  dialog: {
    eyebrow: "Saba umuyobozi agukorere",
    noTime:
      "Nta gihe ufite kugira urutonde? Reka Umuyobozi wacu agusabire. Andika amakuru yawe, tukagukorera.",
    name: "Amazina yawe",
    phone: "Telefoni (07…)",
    note: "Hari ikintu tugira inama? (si ngombwa)",
    submit: "Saba umuyobozi agukorere",
    success: "Murakoze! Isaba ryawe ryoherejwe. Umuyobozi azakugira telefone ku",
    successTail: "kugira ngo arangize icungwa kuri Irembo.",
    close: "Funga",
    ariaClose: "Funga agasanduku",
  },
};

const fr: Dict = {
  langName: "Français",
  header: {
    tagline: "Votre guide indépendant des services gouvernementaux",
    openNav: "Ouvrir la navigation",
    language: "Langue",
    nav: {
      services: "Services",
      roadmaps: "Parcours",
      verify: "Vérifier les documents",
      diaspora: "Diaspora",
      track: "Suivre ma demande",
      admin: "Admin",
    },
    mbaza: "Mbaza AI",
    admin: "Admin",
  },
  hero: {
    badge: "Rembo Rw · Rwanda",
    title: "Faites vos démarches gouvernementales —",
    titleAccent: "sans la queue.",
    subtitle:
      "Trouvez un service, comprenez exactement ce qu’il vous faut, vérifiez vos documents et laissez notre concierge terminer la démarche.",
    search: "Rechercher un service…",
    cta: "Vérifier mes documents",
  },
  features: {
    prepare: {
      title: "Préparez-vous en confiance",
      body: "Des exigences claires et des pré-contrôles assistés par IA avant de soumettre.",
    },
    human: {
      title: "Une personne quand il le faut",
      body: "Notre Admin peut déposer la demande sur Irembo et vous tenir informé à chaque étape.",
    },
    data: {
      title: "Vos données, traitées avec soin",
      body: "Vos documents restent sur votre appareil et ne sont jamais envoyés.",
    },
  },
  services: {
    eyebrow: "Services populaires",
    title: "Commencez par ce dont vous avez besoin",
    noResults: "Aucun service ne correspond à votre recherche. Essayez un autre mot.",
    explore: "Voir les parcours",
    sourceLabel: "Source :",
    checked: "mis à jour le 6 oct. 2026",
    commonRequirements: "Documents courants",
    viewRequirements: "Voir les exigences",
    askAdmin: "Demander à un Admin de s’en occuper",
    time: "Durée estimée",
    fee: "Frais",
    confirmFee: "À confirmer sur Irembo",
    live: {
      heading: "En direct d’Irembo",
      loading: "Recherche sur Irembo…",
      error: "Irembo est momentanément inaccessible — réessayez.",
      empty: "Aucun service d’Irembo ne correspond à votre recherche.",
      open: "Ouvrir sur Irembo",
      requirements: "Exigences",
      details: "Bon à savoir",
      show: "Voir les exigences",
      loadingDetail: "Récupération des détails en direct d’Irembo…",
      detailError: "Ce service n’a pas pu être chargé — réessayez.",
      processing: "Délai de traitement",
      price: "Montant à payer",
      providedBy: "Fourni par",
      applicants: "Pour qui postulez-vous ?",
      other: "Autres pièces jointes",
      optional: "Pièces jointes facultatives",
      notes: "Remarques",
    },
    items: {
      passport: {
        title: "Passeport enfant",
        category: "Immigration",
        description: "Préparez les documents requis pour une demande de passeport pour mineur.",
        requirements: [
          "Acte de naissance de l’enfant",
          "Carte d’identité du parent ou tuteur",
          "Photo d’identité récente",
        ],
      },
      birth: {
        title: "Acte de naissance",
        category: "État civil",
        description: "Demandez un acte de naissance et comprenez les étapes suivantes.",
        requirements: [
          "Pièce d’identité du demandeur",
          "Informations d’enregistrement civil",
          "Justificatif si demandé",
        ],
      },
      criminal: {
        title: "Casier judiciaire",
        category: "Justice",
        description: "Obtenez votre bulletin de casier judiciaire sans mauvaise surprise.",
        requirements: [
          "Carte d’identité ou passeport",
          "Coordonnées du demandeur",
          "Démarche biométrique ou en présence si demandée",
        ],
      },
      name: {
        title: "Changement de nom",
        category: "État civil",
        description: "Découvrez les pièces justificatives et la procédure d’approbation.",
        requirements: ["Carte d’identité", "Acte de naissance", "Justificatif légal du changement"],
      },
    },
  },
  diasporaBanner: {
    title: "Un document rwandais à l’étranger ?",
    body: "Notre concierge basé au Rwanda peut vous guider dans tous les services éligibles.",
    cta: "Découvrir la diaspora",
  },
  pages: {
    roadmaps: {
      eyebrow: "Parcours",
      title: "Voyez tout le chemin avant de commencer",
      description:
        "Chaque service est découpé en étapes claires, dépendances et prochaines actions. Les exigences indicatives doivent être vérifiées auprès du fournisseur officiel.",
    },
    verify: {
      eyebrow: "Pré-contrôle des documents",
      title: "Sachez ce qui doit être corrigé avant de soumettre",
      description:
        "Téléversez un document pour un examen rapide, assisté par IA, de la qualité du fichier et des exigences courantes. Ceci n’est pas une vérification officielle.",
    },
    diaspora: {
      eyebrow: "Concierge diaspora",
      title: "Un document rwandais à l’étranger ?",
      description:
        "Laissez notre concierge basé au Rwanda vous guider pour la préparation, le suivi et la livraison lorsque le service autorise légalement une assistance par représentant.",
    },
    track: {
      eyebrow: "Suivi de demande",
      title: "Restez proche de votre demande",
      description:
        "Saisissez votre numéro de demande ou votre numéro de téléphone pour voir l’état concierge et officiel du traitement.",
    },
    admin: {
      eyebrow: "Espace admin",
      title: "Faites avancer chaque demande",
      description:
        "Un espace concentré pour les opérateurs concierge. Les demandes envoyées par les clients apparaissent ici instantanément.",
    },
  },
  roadmaps: {
    active: "Parcours actif",
    goal: "Passeport enfant",
    meta: "5 étapes · environ 10 à 15 jours",
    progress: "2 sur 5 terminées",
    current: "Actuel",
    continue: "Continuer le parcours",
    steps: [
      { label: "Votre objectif", title: "Passeport enfant", detail: "Ce que vous voulez obtenir" },
      { label: "Étape 1", title: "Acte de naissance", detail: "Document requis" },
      { label: "Étape 2", title: "Carte d’identité du parent", detail: "Document requis" },
      { label: "Étape 3", title: "Photo d’identité", detail: "Fond blanc · visage net" },
      { label: "Résultat final", title: "Passeport prêt", detail: "Télécharger ou retirer" },
    ],
    decoder: "Décodeur en langage clair",
    listen: "Écouter",
    kinyarwanda: "Kinyarwanda",
    francais: "Français",
    terms: [
      {
        term: "Power of Attorney",
        short: "Un document qui permet à une autre personne d’agir légalement en votre nom.",
        kn: "Ni inyandiko iha undi muntu uburenganzira bwo gukora ibikorwa ku muryango wawe.",
        fr: "Un document permettant à une personne d’agir légalement en votre nom.",
      },
      {
        term: "Tax Clearance",
        short: "Une preuve que vos obligations fiscales sont à jour.",
        kn: "Ni icyemezo kerekana ko imisoro yawe byose byishyuwe.",
        fr: "Une preuve que vos obligations fiscales sont à jour.",
      },
      {
        term: "Notarized document",
        short: "Un document certifié par un notaire autorisé.",
        kn: "Ni inyandiko yemejwe na noteri ufite uburenganzira bwo kuyemera.",
        fr: "Un document certifié par un notaire autorisé.",
      },
    ],
  },
  documents: [
    { name: "Acte de naissance", detail: "Enregistrement civil", category: "État civil" },
    { name: "Casier judiciaire", detail: "Bulletin de police", category: "Justice" },
    { name: "Certificat de nationalité", detail: "Preuve de nationalité", category: "État civil" },
    {
      name: "Certificat de célibat",
      detail: "Preuve de situation matrimoniale",
      category: "État civil",
    },
  ],
  verify: {
    heading: "Contrôle IA du document",
    sub: "Validation du fichier · qualité · champs requis",
    findLabel: "Commencez par trouver votre document",
    search: "Rechercher, ex. acte de naissance…",
    noMatch: "Aucun document correspondant. Essayez un autre nom ou cherchez en anglais.",
    drop: "Déposez votre document ici ou cliquez pour choisir",
    dropAlt: "JPEG, PNG ou PDF · 2 Mo max",
    run: "Lancer le pré-contrôle",
    checks: ["Format de fichier accepté", "Taille du fichier acceptable", "Image semble lisible"],
    humanReview: "La signature et l’exhaustivité nécessitent un examen humain",
    disclaimer:
      "Cet examen n’est qu’un pré-contrôle utile. Il ne confirme pas l’acceptation par Irembo ni par une institution gouvernementale.",
    whatWeCheck: "Ce que nous vérifions",
    checkList: [
      "Type et taille du fichier",
      "Netteté de l’image",
      "Texte lisible",
      "Dates et expiration",
      "Exigences propres au service",
    ],
    helpTitle: "Besoin d’aide pour comprendre un avertissement ?",
    helpBody: "Mbaza peut expliquer les termes des documents en anglais, kinyarwanda ou français.",
    askMbaza: "Demander à Mbaza",
  },
  diaspora: {
    heading: "Un pont de confiance vers la maison",
    body: "Choisissez votre service, dites-nous où vous vivez, téléversez vos documents et nous vous expliquerons la procédure côté Rwanda.",
    steps: [
      "Choisir un service",
      "Indiquer votre lieu de vie",
      "Pré-contrôler les documents",
      "Suivi depuis le Rwanda",
    ],
    cta: "Démarrer une demande diaspora",
    delivery: "Options de livraison",
    options: [
      { title: "Livraison numérique", detail: "Résultat numérique sécurisé si disponible" },
      { title: "Retrait local", detail: "Retrait auprès d’un partenaire au Rwanda" },
      { title: "Coursier international", detail: "Adresse de livraison et suivi" },
    ],
    important:
      "La disponibilité dépend du service, des exigences gouvernementales et des autorisations. Tous les services ne peuvent pas être réalisés à distance.",
  },
  track: {
    heading: "Trouvez votre demande",
    sub: "Vos informations restent sur votre appareil.",
    placeholder: "Numéro de demande ou numéro de téléphone",
    search: "Rechercher",
    timelineLabel: "Chronologie de la demande",
    current: "Actuel",
    timeline: [
      "Demande reçue",
      "Documents vérifiés",
      "Traitement par le concierge",
      "Soumis à Irembo",
      "Examen gouvernemental",
      "Prêt pour la livraison",
    ],
  },
  admin: {
    stats: [
      "Demandes totales",
      "Nouvelles cette semaine",
      "Services distincts",
      "Clients distincts",
    ],
    recent: "Demandes récentes",
    recentSub: "Demandes envoyées par les clients depuis les fiches de service.",
    export: "Exporter en CSV",
    columns: ["Client", "Service", "Statut IA", "Statut Irembo", "Action"],
    newRequest: "Nouvelle demande",
    adminToApply: "Admin va déposer",
    call: "Appeler →",
    open: "Ouvrir →",
    empty:
      "Aucune demande pour le moment. Les demandes envoyées depuis une fiche apparaissent ici.",
  },
  footer: {
    left: "© 2026 Concierge Rwanda · Concierge de service indépendant",
    right:
      "Non affilié à Irembo ni au Gouvernement du Rwanda. Vérifiez toujours les frais et les exigences auprès du fournisseur officiel.",
  },
  floating: {
    askMbaza: "Demander à Mbaza",
    whatsapp: "WhatsApp",
    whatsappLabel: "Discuter sur WhatsApp",
  },
  mbaza: {
    title: "Mbaza AI",
    subtitle: "Votre assistant service",
    greeting:
      "Muraho ! Je suis Mbaza. Posez-moi une question sur un service, une étape ou un document.",
    thinking: "Mbaza réfléchit…",
    input: "Posez une question sur un service…",
    close: "Fermer",
    suggestions: [
      "Que faut-il pour un passeport enfant ?",
      "Qu’est-ce qu’une procuration ?",
      "Comment obtenir un casier judiciaire ?",
    ],
    errors: {
      credits: "Les crédits IA sont épuisés pour le moment.",
      rate: "Trop de questions — veuillez patienter un instant.",
      generic: "Mbaza n’a pas pu répondre.",
      empty: "Mbaza n’a renvoyé aucune réponse. Veuillez réessayer.",
    },
  },
  dialog: {
    eyebrow: "Demander à un Admin de s’en occuper",
    noTime:
      "Pas le temps de faire la queue ? Laissez notre Admin faire la demande. Laissez vos coordonnées, nous nous en occupons.",
    name: "Nom complet",
    phone: "Téléphone (07…)",
    note: "Quelque chose à nous savoir ? (facultatif)",
    submit: "Demander à un Admin de s’en occuper",
    success: "Merci ! Votre demande a été envoyée. Un Admin vous appellera au",
    successTail: "pour finaliser la demande sur Irembo.",
    close: "Fermer",
    ariaClose: "Fermer la fenêtre",
  },
};

export const dict: Record<Lang, Dict> = { EN: en, KN: kn, FR: fr };

export function isLang(value: unknown): value is Lang {
  return value === "EN" || value === "KN" || value === "FR";
}

export const speechLocale: Record<Lang, string> = {
  EN: "en-US",
  KN: "rw-RW",
  FR: "fr-FR",
};
