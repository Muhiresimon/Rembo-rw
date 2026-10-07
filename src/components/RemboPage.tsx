import birthCert from "@/assets/birth-certificate.jpg";
import changeOfName from "@/assets/change-of-name.jpg";
import childPassport from "@/assets/child-passport.jpg";
import criminalRecord from "@/assets/criminal-record.jpg";
import { AdminRequestDialog, useRequests } from "@/components/AdminRequest";
import { Mbaza } from "@/components/Mbaza";
import { RwandaFlag } from "@/components/RwandaFlag";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { dict, LANGS, speechLocale, type Lang, type SectionId, type ServiceId } from "@/lib/i18n";
import {
  toLiveLang,
  type LiveHit,
  type LiveSource,
  type ServiceDetail,
} from "@/lib/irembo-live-types";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Globe2,
  Headphones,
  LayoutDashboard,
  LockKeyhole,
  Map,
  Menu,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  X,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/250798892113";

const NAV: { id: SectionId; icon: typeof Map }[] = [
  { id: "services", icon: LayoutDashboard },
  { id: "roadmaps", icon: Map },
  { id: "verify", icon: ShieldCheck },
  { id: "diaspora", icon: Plane },
  { id: "track", icon: ClipboardCheck },
];

const SERVICE_META: { id: ServiceId; icon: string; image: string; sourceUrl: string }[] = [
  {
    id: "passport",
    icon: "◈",
    image: childPassport,
    sourceUrl: "https://irembo.gov.rw/home/citizen/all_services",
  },
  {
    id: "birth",
    icon: "◉",
    image: birthCert,
    sourceUrl: "https://irembo.gov.rw/home/citizen/all_services",
  },
  {
    id: "criminal",
    icon: "◇",
    image: criminalRecord,
    sourceUrl: "https://irembo.gov.rw/home/citizen/all_services",
  },
  {
    id: "name",
    icon: "✦",
    image: changeOfName,
    sourceUrl: "https://irembo.gov.rw/home/citizen/all_services",
  },
];

const ROADMAP_STATES = ["done", "done", "current", "next", "next"] as const;

const EMPTY_TERM = { term: "", short: "", kn: "", fr: "" };

const SOURCE = "Irembo";

type LiveState = "idle" | "loading" | "ready" | "error";

const card = "rounded-2xl border border-[#dce8df] bg-white shadow-[0_1px_2px_rgba(11,60,40,.04)]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a33] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-lg bg-[#007a33] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#00612a] active:bg-[#005324] ${focusRing}`;
const btnGold = `inline-flex items-center justify-center gap-2 rounded-lg bg-[#f2b705] px-4 py-2.5 text-xs font-extrabold text-[#173121] transition hover:bg-[#ffc400] active:bg-[#e0a900] ${focusRing}`;
const btnOutline = `inline-flex items-center justify-center gap-2 rounded-lg border border-[#8fc5a0] bg-white px-4 py-2.5 text-xs font-bold text-[#00662e] transition hover:border-[#007a33] hover:bg-[#effaf2] ${focusRing}`;
const linkGreen = `font-semibold text-[#00662e] underline underline-offset-2 transition hover:text-[#004d23] ${focusRing}`;
const inputBase = `rounded-lg border border-[#cfe2d6] bg-white px-3 py-2.5 text-sm text-[#14231c] outline-none transition placeholder:text-[#6b7a72] hover:border-[#a8cebb] focus:border-[#007a33] ${focusRing}`;

export function RemboPage() {
  const [active, setActive] = useState<SectionId>("services");
  const [language, setLanguage] = useState<Lang>("EN");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<LiveHit[]>([]);
  const [liveSource, setLiveSource] = useState<LiveSource | null>(null);
  const [liveState, setLiveState] = useState<LiveState>("idle");
  const [details, setDetails] = useState<Record<string, ServiceDetail>>({});
  const [detailStatus, setDetailStatus] = useState<Record<string, "loading" | "error">>({});
  const [optionChoice, setOptionChoice] = useState<Record<string, number>>({});
  const [documentQuery, setDocumentQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [mbazaOpen, setMbazaOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [checked, setChecked] = useState(false);
  const [requestFor, setRequestFor] = useState("");
  const [trackQuery, setTrackQuery] = useState("");
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [deliveryChoice, setDeliveryChoice] = useState(-1);
  const requests = useRequests();

  const t = dict[language];
  const activeTerm = t.roadmaps.terms[0] ?? EMPTY_TERM;

  const goTo = (section: SectionId) => {
    setActive(section);
    setMobileNav(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const adminStats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const services = new Set(requests.map((request) => request.service));
    const clients = new Set(requests.map((request) => request.name.trim().toLowerCase()));
    const values = [
      String(requests.length),
      String(requests.filter((request) => Date.parse(request.at) >= weekAgo).length),
      String(services.size),
      String(clients.size),
    ];
    return t.admin.stats.map((label, index) => ({ label, value: values[index] ?? "0" }));
  }, [requests, t.admin.stats]);

  const exportCsv = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = requests.map((request) =>
      [
        request.name,
        request.service,
        t.admin.newRequest,
        t.admin.adminToApply,
        request.phone,
        request.note,
        request.at,
      ]
        .map(escape)
        .join(","),
    );
    const csv = [[...t.admin.columns, "Phone", "Note", "Date"].map(escape).join(","), ...rows].join(
      "\n",
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rembo-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const runTrackSearch = () => {
    const value = trackQuery.trim();
    if (!value) {
      setTrackSearched(false);
      setTrackError(t.track.placeholder);
      return;
    }
    setTrackError("");
    setTrackSearched(true);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SERVICE_META;
    return SERVICE_META.filter((service) => {
      const text = t.services.items[service.id];
      return `${text.title} ${text.category}`.toLowerCase().includes(needle);
    });
  }, [query, t]);

  const filteredDocuments = useMemo(() => {
    const needle = documentQuery.trim().toLowerCase();
    if (!needle) return t.documents;
    return t.documents.filter((document) =>
      `${document.name} ${document.detail} ${document.category}`.toLowerCase().includes(needle),
    );
  }, [documentQuery, t]);

  useEffect(() => {
    const needle = query.trim();
    if (needle.length < 3) {
      setLive((current) => (current.length ? [] : current));
      setLiveSource(null);
      setLiveState((current) => (current === "idle" ? current : "idle"));
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLiveState("loading");
      const params = new URLSearchParams({ q: needle, lang: toLiveLang(language) });
      fetch(`/api/irembo/live/search?${params.toString()}`, { signal: controller.signal })
        .then((response) =>
          response.ok ? response.json() : Promise.reject(new Error("search failed")),
        )
        .then((data: { source?: LiveSource | null; results?: LiveHit[] }) => {
          setLive(Array.isArray(data.results) ? data.results : []);
          setLiveSource(data.source ?? null);
          setLiveState("ready");
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;
          setLive([]);
          setLiveSource(null);
          setLiveState("error");
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, language]);

  const liveLang = toLiveLang(language);

  const detailKey = (hit: LiveHit, option: number) => `${language}::${hit.id}::${option}`;

  const loadDetail = (hit: LiveHit, option = 0) => {
    const key = detailKey(hit, option);
    if (details[key] || detailStatus[key] === "loading") return;
    setDetailStatus((current) => ({ ...current, [key]: "loading" }));
    const params = new URLSearchParams({ id: hit.id, option: String(option), lang: liveLang });
    fetch(`/api/irembo/live/service?${params.toString()}`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("detail failed")),
      )
      .then((data: ServiceDetail) => {
        setDetails((current) => ({ ...current, [key]: data }));
        setDetailStatus((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      })
      .catch(() => {
        setDetailStatus((current) => ({ ...current, [key]: "error" }));
      });
  };

  const pickOption = (hit: LiveHit, option: number) => {
    setOptionChoice((current) => ({ ...current, [hit.id]: option }));
    loadDetail(hit, option);
  };

  const listBlock = (label: string, items: string[]) =>
    items.length ? (
      <div key={label} className="mt-3 rounded-xl border border-[#e5ece7] bg-[#f7faf8] p-3">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#5b6b62]">{label}</p>
        <ul className="mt-1.5 space-y-1 text-[12px] leading-5 text-[#42524a]">
          {items.map((entry) => (
            <li key={entry} className="flex gap-1.5">
              <Check size={13} className="mt-1 shrink-0 text-[#007a33]" aria-hidden="true" />
              <span>{entry}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const speak = (text: string, lang: Lang = language) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocale[lang];
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-[#14231c] antialiased">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#007a33] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <button
            onClick={() => goTo("services")}
            className={`flex items-center gap-3 rounded-lg text-left transition hover:opacity-90 ${focusRing}`}
          >
            <span className="flex items-center gap-2">
              <RwandaFlag className="h-9 w-[54px] shrink-0 rounded-md shadow-[0_1px_3px_rgba(0,0,0,.35)] ring-1 ring-white/40" />
              <span className="text-sm font-black tracking-tight">RW</span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-[15px] font-extrabold leading-tight tracking-tight">
                RemboRw
              </span>
              <span className="block text-[11px] leading-tight text-white/85">
                {t.header.tagline}
              </span>
            </span>
          </button>

          <button
            className={`rounded-lg p-2 md:hidden ${focusRing}`}
            onClick={() => setMobileNav(!mobileNav)}
            aria-label={t.header.openNav}
            aria-expanded={mobileNav}
          >
            {mobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav
            className={`${
              mobileNav ? "absolute left-0 right-0 top-full flex border-b" : "hidden"
            } flex-col gap-1 border-white/15 bg-[#00692d] p-3 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
          >
            {NAV.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${focusRing} ${
                  active === id
                    ? "bg-white text-[#07583a] shadow-sm"
                    : "text-white/85 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {t.header.nav[id]}
              </button>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-white/25 md:block" />
            <button
              onClick={() => setMbazaOpen(true)}
              className={`flex items-center gap-2 rounded-lg bg-[#f2b705] px-3 py-2 text-[12.5px] font-bold text-[#173121] transition hover:bg-[#ffc400] ${focusRing}`}
            >
              <Sparkles size={15} />
              {t.header.mbaza}
            </button>
            <button
              onClick={() => goTo("admin")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white/85 transition hover:bg-white/15 hover:text-white ${focusRing}`}
            >
              <UserRound size={15} />
              {t.header.admin}
            </button>
            <div className="flex gap-1 pt-2 md:pt-0" role="group" aria-label={t.header.language}>
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  aria-pressed={language === lang}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${focusRing} ${
                    language === lang
                      ? "bg-white text-[#07583a] shadow-sm"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1380px] px-5 py-7 lg:px-8">
        {active === "services" && (
          <>
            <section className="relative overflow-hidden rounded-[28px] bg-[#073d28] text-white shadow-xl">
              <img
                src={childPassport}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 size-full -scale-x-100 object-cover object-center opacity-30"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#073d28] via-[#073d28]/95 to-[#073d28]/65" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#073d28] to-transparent" />
              <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-[34px] border-[#f2b705]/15" />
              <div className="pointer-events-none absolute -bottom-36 right-20 size-80 rounded-full border-[34px] border-white/5" />

              <div className="relative px-6 py-9 lg:px-12 lg:py-12">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffe08a] ring-1 ring-white/15">
                  <RwandaFlag className="h-3.5 w-5 rounded-[2px] ring-1 ring-white/40" />
                  {t.hero.badge}
                </div>

                <p className="select-none text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] text-white [text-shadow:0_8px_30px_rgba(0,0,0,.45)]">
                  Rembo <span className="text-[#f2b705]">Rw</span>
                </p>
                <div
                  aria-hidden="true"
                  className="max-w-[560px] -translate-y-1 overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.55),transparent)]"
                >
                  <p className="block scale-y-[-1] text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] text-white/35">
                    Rembo Rw
                  </p>
                </div>

                <div className="mt-4 max-w-2xl">
                  <h1 className="max-w-xl text-2xl font-black leading-[1.15] tracking-[-0.03em] sm:text-4xl">
                    {t.hero.title} <span className="text-[#f2b705]">{t.hero.titleAccent}</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                    {t.hero.subtitle}
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <div
                    className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ${focusRing} focus-within:ring-2 focus-within:ring-[#f2b705]`}
                  >
                    <RwandaFlag className="h-5 w-7 shrink-0 rounded-[3px] ring-1 ring-black/15" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.hero.search}
                      aria-label={t.hero.search}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#14231c] outline-none placeholder:text-[#6b7a72]"
                    />
                    <Search size={17} className="shrink-0 text-[#007a33]" aria-hidden="true" />
                  </div>
                  <button onClick={() => goTo("verify")} className={btnGold}>
                    {t.hero.cta}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </section>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                {
                  item: t.features.prepare,
                  Icon: ShieldCheck,
                  tint: "bg-[#e6f4ea] text-[#007a33]",
                },
                { item: t.features.human, Icon: Headphones, tint: "bg-[#fff6d8] text-[#8a6500]" },
                { item: t.features.data, Icon: LockKeyhole, tint: "bg-[#e7f1ff] text-[#1b5fa8]" },
              ].map(({ item, Icon, tint }) => (
                <div
                  key={item.title}
                  className={`${card} p-5 transition hover:border-[#a8cebb] hover:shadow-md`}
                >
                  <div className={`mb-3 grid size-9 place-items-center rounded-xl ${tint}`}>
                    <Icon size={19} />
                  </div>
                  <p className="text-sm font-bold text-[#14231c]">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#5b6b62]">{item.body}</p>
                </div>
              ))}
            </div>

            <section className="mt-9">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007a33]">
                    {t.services.eyebrow}
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">{t.services.title}</h2>
                </div>
                <button
                  onClick={() => goTo("roadmaps")}
                  className={`hidden items-center gap-1 rounded-md text-xs font-bold text-[#00662e] transition hover:text-[#004d23] sm:flex ${focusRing}`}
                >
                  {t.services.explore}
                  <ChevronRight size={15} />
                </button>
              </div>

              {filtered.length === 0 && !(liveState === "ready" && live.length > 0) ? (
                <p className={`${card} p-6 text-sm text-[#5b6b62]`}>{t.services.noResults}</p>
              ) : (
                filtered.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {filtered.map((service) => {
                      const text = t.services.items[service.id];
                      return (
                        <article
                          key={service.id}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-[#dce8df] bg-white shadow-[0_8px_24px_rgba(11,60,40,.05)] transition duration-200 hover:-translate-y-1.5 hover:border-[#f0d36a] hover:shadow-[0_20px_44px_rgba(11,60,40,.16)]"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={service.image}
                              alt={text.title}
                              loading="lazy"
                              width={1024}
                              height={640}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#073d28]/85 via-[#073d28]/25 to-transparent" />
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#00662e] shadow-sm ring-1 ring-black/5">
                              {text.category}
                            </span>
                            <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-xl bg-[#f2b705] text-xl font-black text-[#173121] shadow-lg ring-2 ring-white/40">
                              {service.icon}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="text-[15.5px] font-extrabold leading-snug transition group-hover:text-[#00662e]">
                              {text.title}
                            </h3>
                            <p className="mt-2 text-[13px] leading-5 text-[#5b6b62]">
                              {text.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#edf1ee] pt-3 text-[11px] text-[#5b6b62]">
                              <span>{t.services.time}</span>
                              <span className="font-bold text-[#14231c]">
                                {t.services.confirmFee}
                              </span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-[#6b7a72]">
                              {t.services.sourceLabel}{" "}
                              <a
                                href={service.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={linkGreen}
                              >
                                {SOURCE}
                              </a>{" "}
                              · {t.services.checked}
                            </p>

                            <div className="mt-4 rounded-xl border border-[#e5ece7] bg-[#f7faf8] p-3 transition group-hover:border-[#cfe8d8] group-hover:bg-[#f2faf5]">
                              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#5b6b62]">
                                {t.services.commonRequirements}
                              </p>
                              <ul className="mt-1.5 space-y-1 text-[12px] leading-5 text-[#42524a]">
                                {text.requirements.map((requirement) => (
                                  <li key={requirement} className="flex gap-1.5">
                                    <Check
                                      size={13}
                                      className="mt-1 shrink-0 text-[#007a33]"
                                      aria-hidden="true"
                                    />
                                    <span>{requirement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-auto pt-4">
                              <button
                                onClick={() => goTo("roadmaps")}
                                className={`flex w-full items-center justify-center gap-2 rounded-lg border border-[#8fc5a0] py-2.5 text-xs font-bold text-[#00662e] transition group-hover:border-[#007a33] group-hover:bg-[#007a33] group-hover:text-white ${focusRing}`}
                              >
                                {t.services.viewRequirements}
                                <ArrowRight size={14} />
                              </button>
                              <button
                                onClick={() => setRequestFor(text.title)}
                                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2b705] py-2.5 text-xs font-extrabold text-[#173121] transition hover:bg-[#ffc400] active:bg-[#e0a900] ${focusRing}`}
                              >
                                <Headphones size={14} />
                                {t.services.askAdmin}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )
              )}

              {liveState !== "idle" && (
                <div className="mt-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007a33]">
                      {t.services.live.heading}
                    </p>
                    <span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-[10px] font-bold text-[#00662e] ring-1 ring-[#cfe8d8]">
                      {liveSource === "irembo" ? "irembo.gov.rw" : SOURCE}
                    </span>
                  </div>

                  {liveState === "loading" && (
                    <p className={`${card} p-6 text-sm text-[#5b6b62]`}>
                      {t.services.live.loading}
                    </p>
                  )}
                  {liveState === "error" && (
                    <p className={`${card} p-6 text-sm text-[#5b6b62]`}>{t.services.live.error}</p>
                  )}
                  {liveState === "ready" && live.length === 0 && (
                    <p className={`${card} p-6 text-sm text-[#5b6b62]`}>{t.services.live.empty}</p>
                  )}

                  {liveState === "ready" && live.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {live.map((item) => {
                        const option = optionChoice[item.id] ?? 0;
                        const key = detailKey(item, option);
                        const detail = details[key];
                        const status = detailStatus[key];
                        const article = item.article;
                        const requirements = article?.requirements ?? detail?.required ?? [];
                        const facts = article?.facts ?? [];
                        const summary = article?.summary ?? detail?.about ?? "";
                        const target = article?.url ?? detail?.url ?? detail?.listUrl ?? "";
                        const modified =
                          article?.modified ?? (detail ? detail.fetchedAt.slice(0, 10) : "");
                        const chips = detail
                          ? [
                              detail.duration
                                ? `${t.services.live.processing}: ${detail.duration}`
                                : "",
                              detail.fee ? `${t.services.live.price}: ${detail.fee}` : "",
                              detail.provider
                                ? `${t.services.live.providedBy}: ${detail.provider}`
                                : "",
                            ].filter((chip): chip is string => Boolean(chip))
                          : [];

                        return (
                          <article
                            key={`${item.source}:${item.id}`}
                            className="flex flex-col rounded-2xl border border-[#dce8df] bg-white p-5 shadow-[0_1px_2px_rgba(11,60,40,.04)] transition hover:-translate-y-0.5 hover:border-[#a8cebb] hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#007a33]">
                                  {item.category || SOURCE}
                                </p>
                                <h3 className="mt-1 text-[15px] font-extrabold leading-snug text-[#14231c]">
                                  {item.title}
                                </h3>
                              </div>
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e6f4ea] text-[#007a33]">
                                <FileText size={15} aria-hidden="true" />
                              </span>
                            </div>

                            {chips.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {chips.map((chip) => (
                                  <span
                                    key={chip}
                                    className="rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[10.5px] font-bold text-[#00662e] ring-1 ring-[#cfe8d8]"
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            )}

                            {summary && (
                              <p className="mt-2 text-[13px] leading-5 text-[#5b6b62]">{summary}</p>
                            )}

                            {status === "loading" && (
                              <p className="mt-3 text-[13px] leading-5 text-[#5b6b62]">
                                {t.services.live.loadingDetail}
                              </p>
                            )}
                            {status === "error" && (
                              <p className="mt-3 text-[13px] leading-5 text-[#b3261e]">
                                {t.services.live.detailError}
                              </p>
                            )}
                            {!detail && status !== "loading" && (
                              <button
                                type="button"
                                onClick={() => loadDetail(item)}
                                className={`${btnOutline} mt-3 self-start`}
                              >
                                {t.services.live.show}
                              </button>
                            )}

                            {detail && detail.options.length > 1 && (
                              <select
                                aria-label={item.title}
                                className={`${inputBase} mt-3 w-full`}
                                value={option}
                                onChange={(event) => pickOption(item, Number(event.target.value))}
                              >
                                {detail.options.map((choice, index) => (
                                  <option key={choice} value={index}>
                                    {choice}
                                  </option>
                                ))}
                              </select>
                            )}

                            {requirements.length > 0 && (
                              <div className="mt-3 rounded-xl border border-[#e5ece7] bg-[#f7faf8] p-3">
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#5b6b62]">
                                  {t.services.live.requirements}
                                </p>
                                <ul className="mt-1.5 space-y-1 text-[12px] leading-5 text-[#42524a]">
                                  {requirements.map((requirement) => (
                                    <li key={requirement} className="flex gap-1.5">
                                      <Check
                                        size={13}
                                        className="mt-1 shrink-0 text-[#007a33]"
                                        aria-hidden="true"
                                      />
                                      <span>{requirement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {facts.length > 0 && (
                              <div className="mt-3">
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#5b6b62]">
                                  {t.services.live.details}
                                </p>
                                <ul className="mt-1.5 space-y-1 text-[12px] leading-5 text-[#42524a]">
                                  {facts.map((fact) => (
                                    <li key={fact} className="flex gap-1.5">
                                      <Sparkles
                                        size={13}
                                        className="mt-1 shrink-0 text-[#f2b705]"
                                        aria-hidden="true"
                                      />
                                      <span>{fact}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {detail && listBlock(t.services.live.applicants, detail.applicants)}
                            {detail && listBlock(t.services.live.other, detail.other)}
                            {detail && listBlock(t.services.live.optional, detail.optional)}
                            {detail && listBlock(t.services.live.notes, detail.notes)}

                            {(modified || target) && (
                              <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#edf1ee] pt-3 text-[11px] text-[#6b7a72]">
                                <span className="truncate">{modified}</span>
                                {target && (
                                  <a
                                    href={target}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`${linkGreen} shrink-0`}
                                  >
                                    {t.services.live.open}
                                  </a>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#f0d36a] bg-[#fff9e5] p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-extrabold text-[#4a3d0e]">{t.diasporaBanner.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#6b5a1e]">{t.diasporaBanner.body}</p>
              </div>
              <button onClick={() => goTo("diaspora")} className={`${btnPrimary} shrink-0`}>
                {t.diasporaBanner.cta}
                <Plane size={14} />
              </button>
            </div>
          </>
        )}

        {active === "roadmaps" && (
          <PageFrame {...t.pages.roadmaps}>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
              <div className={`${card} p-5 sm:p-7`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#007a33]">
                      {t.roadmaps.active}
                    </p>
                    <h2 className="mt-1 text-xl font-black">{t.roadmaps.goal}</h2>
                    <p className="mt-1 text-[13px] text-[#5b6b62]">{t.roadmaps.meta}</p>
                  </div>
                  <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-bold text-[#00662e]">
                    {t.roadmaps.progress}
                  </span>
                </div>

                <ol className="mt-8 flex flex-col gap-3">
                  {t.roadmaps.steps.map((step, index) => {
                    const state = ROADMAP_STATES[index] ?? "next";
                    return (
                      <li key={step.title} className="flex items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-xs font-black ${
                            state === "done"
                              ? "border-[#1e9e4f] bg-[#e6f4ea] text-[#08703c]"
                              : state === "current"
                                ? "border-[#1b5fa8] bg-[#e7f1ff] text-[#1b5fa8]"
                                : "border-[#dce8df] bg-[#f7faf8] text-[#6b7a72]"
                          }`}
                        >
                          {state === "done" ? <Check size={16} /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1 rounded-xl border border-[#edf1ee] bg-white p-3 transition hover:border-[#a8cebb] hover:bg-[#f9fcfa]">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#6b7a72]">
                              {step.label}
                            </p>
                            {state === "current" && (
                              <span className="rounded-full bg-[#e7f1ff] px-2 py-0.5 text-[10px] font-bold text-[#1b5fa8]">
                                {t.roadmaps.current}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-bold">{step.title}</p>
                          <p className="mt-0.5 text-[13px] text-[#5b6b62]">{step.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <button onClick={() => goTo("verify")} className={`${btnPrimary} mt-6`}>
                  {t.roadmaps.continue}
                  <ArrowRight size={14} />
                </button>
              </div>

              <TermCard
                term={activeTerm}
                labels={t.roadmaps}
                onSpeak={() => speak(activeTerm.short)}
              />
            </div>
          </PageFrame>
        )}

        {active === "verify" && (
          <PageFrame {...t.pages.verify}>
            <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
              <div className="rounded-2xl border border-[#8fc5a0] bg-white p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#e6f4ea] text-[#007a33]">
                    <ShieldCheck size={23} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-extrabold">{t.verify.heading}</h2>
                    <p className="text-[13px] text-[#5b6b62]">{t.verify.sub}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="document-search" className="text-[13px] font-bold text-[#14231c]">
                    {t.verify.findLabel}
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border-2 border-[#dce8df] bg-[#f7fcf8] px-3 py-2.5 transition focus-within:border-[#007a33] focus-within:bg-white">
                    <RwandaFlag className="h-5 w-7 shrink-0 rounded-[3px] ring-1 ring-black/15" />
                    <input
                      id="document-search"
                      value={documentQuery}
                      onChange={(e) => setDocumentQuery(e.target.value)}
                      placeholder={t.verify.search}
                      className={`min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#6b7a72] ${focusRing}`}
                    />
                  </div>

                  {documentQuery && (
                    <div className="mt-2 grid gap-2">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((document) => (
                          <button
                            key={document.name}
                            onClick={() => setDocumentQuery(document.name)}
                            className={`rounded-lg border border-[#e5ece7] bg-white p-3 text-left transition hover:border-[#8fc5a0] hover:bg-[#f7fcf8] ${focusRing}`}
                          >
                            <p className="text-sm font-bold text-[#14231c]">{document.name}</p>
                            <p className="mt-0.5 text-[12px] text-[#5b6b62]">
                              {document.detail} · {document.category}
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="rounded-lg bg-[#fff8e1] p-3 text-[13px] text-[#6b5a1e]">
                          {t.verify.noMatch}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <label
                  className={`mt-7 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8fc5a0] bg-[#f7fcf8] px-5 text-center transition hover:border-[#007a33] hover:bg-[#eef9f1] ${focusRing}`}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      setFileName(e.target.files?.[0]?.name ?? "");
                      setChecked(false);
                    }}
                  />
                  <FileCheck2 className="text-[#007a33]" size={34} aria-hidden="true" />
                  <span className="mt-3 text-sm font-bold text-[#00662e]">
                    {fileName || t.verify.drop}
                  </span>
                  <span className="mt-1 text-[13px] text-[#5b6b62]">{t.verify.dropAlt}</span>
                </label>

                {fileName && (
                  <div className="mt-4 rounded-xl bg-[#f5f8f6] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText
                          size={17}
                          className="shrink-0 text-[#007a33]"
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-bold">{fileName}</span>
                      </span>
                      <button onClick={() => setChecked(true)} className={btnPrimary}>
                        {t.verify.run}
                      </button>
                    </div>
                    {checked && (
                      <div className="mt-4 grid gap-2 text-[13px]">
                        {t.verify.checks.map((text) => (
                          <CheckRow key={text} text={text} />
                        ))}
                        <div className="flex items-center gap-2 rounded-lg bg-[#fff8e1] p-2 text-[#6b5a1e]">
                          <CircleHelp size={14} className="shrink-0" aria-hidden="true" />
                          {t.verify.humanReview}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-5 text-[12px] leading-5 text-[#5b6b62]">{t.verify.disclaimer}</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-[#0a4f30] bg-[#073d28] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#f2b705]">
                    {t.verify.whatWeCheck}
                  </p>
                  <ul className="mt-4 grid gap-3 text-sm">
                    {t.verify.checkList.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/90">
                        <BadgeCheck
                          size={16}
                          className="shrink-0 text-[#6fda91]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${card} p-6 transition hover:shadow-md`}>
                  <p className="text-[15px] font-extrabold">{t.verify.helpTitle}</p>
                  <p className="mt-2 text-[13px] leading-5 text-[#5b6b62]">{t.verify.helpBody}</p>
                  <button
                    onClick={() => setMbazaOpen(true)}
                    className={`mt-4 inline-flex items-center gap-2 rounded-md text-xs font-bold text-[#00662e] transition hover:text-[#004d23] ${focusRing}`}
                  >
                    {t.verify.askMbaza}
                    <MessageCircle size={15} />
                  </button>
                </div>
              </div>
            </div>
          </PageFrame>
        )}

        {active === "diaspora" && (
          <PageFrame {...t.pages.diaspora}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-2xl bg-[#073d28] p-7 text-white shadow-lg">
                <Plane className="text-[#f2b705]" size={28} aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-black">{t.diaspora.heading}</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">{t.diaspora.body}</p>
                <ol className="mt-7 grid gap-3 sm:grid-cols-2">
                  {t.diaspora.steps.map((item, index) => (
                    <li key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f2b705] text-xs font-black text-[#173121]">
                        {index + 1}
                      </span>
                      <span className="text-[13px] font-semibold">{item}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setRequestFor(t.diaspora.cta)} className={`${btnGold} mt-7`}>
                  {t.diaspora.cta}
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className={`${card} p-6`}>
                <p className="text-xs font-bold uppercase tracking-wider text-[#007a33]">
                  {t.diaspora.delivery}
                </p>
                <div className="mt-4 grid gap-3">
                  {t.diaspora.options.map((option, index) => {
                    const Icon = [FileText, Globe2, Plane][index] ?? FileText;
                    const selected = deliveryChoice === index;
                    return (
                      <button
                        key={option.title}
                        onClick={() => setDeliveryChoice(index)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${focusRing} ${
                          selected
                            ? "border-[#007a33] bg-[#effaf2] shadow-[0_6px_18px_rgba(0,122,51,.12)]"
                            : "border-[#e5ece7] bg-white hover:border-[#8fc5a0] hover:bg-[#f7fcf8]"
                        }`}
                      >
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                            selected ? "bg-[#007a33] text-white" : "bg-[#eaf6ed] text-[#007a33]"
                          }`}
                        >
                          {selected ? <Check size={17} /> : <Icon size={17} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">{option.title}</span>
                          <span className="mt-0.5 block text-[13px] text-[#5b6b62]">
                            {option.detail}
                          </span>
                        </span>
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-[#6b7a72]"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 rounded-xl bg-[#fff8e1] p-4 text-[13px] leading-5 text-[#6b5a1e]">
                  <strong>
                    {language === "FR"
                      ? "Important :"
                      : language === "KN"
                        ? "Ibyo ngombwa:"
                        : "Important:"}
                  </strong>{" "}
                  {t.diaspora.important}
                </p>
              </div>
            </div>
          </PageFrame>
        )}

        {active === "track" && (
          <PageFrame {...t.pages.track}>
            <div className={`${card} mx-auto max-w-2xl p-6 sm:p-8`}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-[#e7f1ff] text-[#1b5fa8]">
                  <ClipboardCheck size={22} />
                </div>
                <div>
                  <h2 className="text-[17px] font-extrabold">{t.track.heading}</h2>
                  <p className="text-[13px] text-[#5b6b62]">{t.track.sub}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={trackQuery}
                  onChange={(e) => {
                    setTrackQuery(e.target.value);
                    if (trackError) setTrackError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runTrackSearch();
                  }}
                  placeholder={t.track.placeholder}
                  aria-label={t.track.placeholder}
                  aria-invalid={Boolean(trackError)}
                  className={`flex-1 py-3 ${inputBase}`}
                />
                <button onClick={runTrackSearch} className={btnPrimary}>
                  <Search size={15} />
                  {t.track.search}
                </button>
              </div>
              {trackError && (
                <p
                  role="alert"
                  className="mt-2 rounded-lg bg-[#fff2cc] px-3 py-2 text-[13px] font-semibold text-[#8a6500]"
                >
                  {trackError}
                </p>
              )}
              {trackSearched && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#8fc5a0] bg-[#effaf2] px-4 py-3">
                  <span className="grid size-8 place-items-center rounded-full bg-[#007a33] text-white">
                    <Check size={16} aria-hidden="true" />
                  </span>
                  <span className="text-[13px] font-bold text-[#0a3f27]">#{trackQuery}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1b5fa8] ring-1 ring-[#cfe2d6]">
                    {t.track.current}
                  </span>
                </div>
              )}

              <div className="mt-8 border-t border-[#edf1ee] pt-7">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b6b62]">
                  {t.track.timelineLabel}
                </p>
                <ol className="mt-5 grid gap-4">
                  {t.track.timeline.map((item, i) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                          i < 2
                            ? "bg-[#e6f4ea] text-[#00662e]"
                            : i === 2
                              ? "bg-[#e7f1ff] text-[#1b5fa8]"
                              : "bg-[#eef1ef] text-[#6b7a72]"
                        }`}
                      >
                        {i < 2 ? <Check size={14} /> : i + 1}
                      </span>
                      <span
                        className={`text-sm ${i <= 2 ? "font-bold text-[#14231c]" : "text-[#5b6b62]"}`}
                      >
                        {item}
                      </span>
                      {i === 2 && (
                        <span className="rounded-full bg-[#e7f1ff] px-2 py-1 text-[10px] font-bold text-[#1b5fa8]">
                          {t.track.current}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </PageFrame>
        )}

        {active === "admin" && (
          <PageFrame {...t.pages.admin}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {adminStats.map((stat, index) => {
                const Icon =
                  [LayoutDashboard, ShieldCheck, ClipboardCheck, FileCheck2][index] ??
                  LayoutDashboard;
                return (
                  <div key={stat.label} className={`${card} p-5 transition hover:shadow-md`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] text-[#5b6b62]">{stat.label}</span>
                      <Icon size={17} className="text-[#007a33]" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-3xl font-black">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className={`${card} mt-6 p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold">{t.admin.recent}</h2>
                  <p className="mt-0.5 text-[13px] text-[#5b6b62]">{t.admin.recentSub}</p>
                </div>
                <button
                  onClick={exportCsv}
                  disabled={!requests.length}
                  className={`${btnOutline} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <FileText size={14} />
                  {t.admin.export}
                </button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-[13px]">
                  <thead className="border-b border-[#edf1ee] text-[11px] uppercase tracking-wider text-[#6b7a72]">
                    <tr>
                      {t.admin.columns.map((column) => (
                        <th key={column} className="pb-3 font-bold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 && (
                      <tr>
                        <td
                          colSpan={t.admin.columns.length}
                          className="py-10 text-center text-[13px] text-[#5b6b62]"
                        >
                          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-[#effaf2]">
                            <ClipboardCheck size={20} className="text-[#007a33]" />
                          </span>
                          <p className="font-bold text-[#14231c]">{t.admin.empty}</p>
                        </td>
                      </tr>
                    )}
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-[#f0f3f1] bg-[#fffbea]">
                        <td className="py-4 pr-4 font-bold">
                          {r.name}
                          <span className="block text-[12px] font-normal text-[#5b6b62]">
                            {r.phone}
                            {r.note ? ` · ${r.note}` : ""}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-[#5b6b62]">{r.service}</td>
                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-[#fff2cc] px-2.5 py-1 text-[11px] font-bold text-[#8a6500]">
                            {t.admin.newRequest}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-[#5b6b62]">{t.admin.adminToApply}</td>
                        <td className="py-4">
                          <a href={`tel:${r.phone}`} className={`${linkGreen} font-bold`}>
                            {t.admin.call}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PageFrame>
        )}
      </main>

      <footer className="border-t border-[#dce8df] bg-white">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-2 px-5 py-5 text-[12px] leading-5 text-[#5b6b62] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="flex items-center gap-2">
            <RwandaFlag className="h-4 w-6 shrink-0 rounded-[3px] ring-1 ring-black/10" />
            {t.footer.left}
          </span>
          <span className="max-w-3xl sm:text-right">{t.footer.right}</span>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
        <button
          onClick={() => setMbazaOpen(!mbazaOpen)}
          aria-expanded={mbazaOpen}
          className={`flex items-center gap-2 rounded-full bg-[#007a33] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-[#007a33]/30 transition hover:bg-[#00612a] active:scale-95 ${focusRing}`}
        >
          <MessageCircle size={17} aria-hidden="true" />
          <span className="hidden sm:inline">{t.floating.askMbaza}</span>
        </button>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t.floating.whatsappLabel}
          className={`flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-[#25D366]/35 transition hover:bg-[#1ebe5b] active:scale-95 ${focusRing}`}
        >
          <WhatsAppIcon size={17} />
          <span className="hidden sm:inline">{t.floating.whatsapp}</span>
        </a>
      </div>

      {mbazaOpen && <Mbaza language={language} onClose={() => setMbazaOpen(false)} />}
      {requestFor && (
        <AdminRequestDialog
          service={requestFor}
          language={language}
          onClose={() => setRequestFor("")}
        />
      )}
    </div>
  );
}

function PageFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="py-2">
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007a33]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#5b6b62]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#effaf2] p-2.5 text-[#0a6a3f]">
      <Check size={15} className="shrink-0" aria-hidden="true" />
      {text}
    </div>
  );
}

function TermCard({
  term,
  labels,
  onSpeak,
}: {
  term: { term: string; short: string; kn: string; fr: string };
  labels: { decoder: string; listen: string; kinyarwanda: string; francais: string };
  onSpeak: () => void;
}) {
  return (
    <div className={`${card} h-fit p-6`}>
      <div className="flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-[#fff6d8] text-[#8a6500]">
          <Volume2 size={18} aria-hidden="true" />
        </div>
        <button onClick={onSpeak} className={btnOutline}>
          <Volume2 size={14} aria-hidden="true" />
          {labels.listen}
        </button>
      </div>
      <p className="mt-5 text-[10.5px] font-bold uppercase tracking-wider text-[#007a33]">
        {labels.decoder}
      </p>
      <h2 className="mt-2 text-xl font-black">{term.term}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5b6b62]">{term.short}</p>
      <div className="mt-5 grid gap-2">
        <div className="rounded-lg bg-[#f5f8f6] p-3 text-[13px] leading-5 text-[#42524a]">
          <strong className="text-[#14231c]">🇷🇼 {labels.kinyarwanda}</strong>
          <br />
          {term.kn}
        </div>
        <div className="rounded-lg bg-[#f5f8f6] p-3 text-[13px] leading-5 text-[#42524a]">
          <strong className="text-[#14231c]">🇫🇷 {labels.francais}</strong>
          <br />
          {term.fr}
        </div>
      </div>
    </div>
  );
}
