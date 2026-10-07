import express from "express";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const BASE = "https://irembo.gov.rw";
const TTL_MS = 24 * 60 * 60 * 1000;
const NEG_TTL_MS = 60 * 1000;
const CACHE_FILE = path.join(__dirname, "cache.json");
const LANGS = new Set(["en", "fr", "rw"]);
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const listUrl = (lang) => `${BASE}/home/citizen/all_services?lang=${lang}`;

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fixMojibake = (s) => {
  if (!/Ã[\u0080-\u00bf]|â[\u0080-\u009f]/.test(s)) return s;
  const fixed = Buffer.from(s, "latin1").toString("utf8");
  return fixed.includes("\uFFFD") ? s : fixed;
};

const stripControls = (s) => s.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, " ");

const cleanValue = (value) => {
  if (typeof value === "string")
    return stripControls(fixMojibake(value)).replace(/\s+/g, " ").trim();
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cleanValue(entry)]),
    );
  return value;
};

let cache = { index: {}, detail: {} };
try {
  if (fs.existsSync(CACHE_FILE))
    cache = { ...cache, ...JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) };
} catch {
  cache = { index: {}, detail: {} };
}

let saveTimer = null;
const persist = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(
      CACHE_FILE,
      JSON.stringify(cache),
      (e) => e && console.error("cache write failed:", e.message),
    );
  }, 400);
};

let browserPromise = null;
const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({ headless: true })
      .then((b) => {
        b.on("disconnected", () => {
          browserPromise = null;
        });
        return b;
      })
      .catch((e) => {
        browserPromise = null;
        throw e;
      });
  }
  return browserPromise;
};

const blocked = new Set(["image", "font", "media"]);

class Slot {
  constructor() {
    this.page = null;
    this.queue = Promise.resolve();
  }

  run(fn) {
    const next = this.queue.then(async () => {
      try {
        return await fn(await this.ensure());
      } catch (e) {
        await this.drop();
        throw e;
      }
    });
    this.queue = next.catch(() => {});
    return next;
  }

  async ensure() {
    if (this.page && this.page.isClosed()) this.page = null;
    if (!this.page) {
      const browser = await getBrowser();
      const context = await browser.newContext({
        locale: "en-US",
        userAgent: USER_AGENT,
        viewport: { width: 1440, height: 900 },
      });
      await context.route("**/*", (route) =>
        blocked.has(route.request().resourceType()) ? route.abort() : route.continue(),
      );
      this.page = await context.newPage();
      this.page.setDefaultTimeout(25000);
      this.page.setDefaultNavigationTimeout(60000);
    }
    return this.page;
  }

  async drop() {
    const page = this.page;
    this.page = null;
    if (page)
      await page
        .context()
        .close()
        .catch(() => {});
  }
}

const slots = [new Slot(), new Slot()];
let rr = 0;
const withPage = (fn) => slots[rr++ % slots.length].run(fn);

const inflight = new Map();
const dedupe = (key, fn) => {
  if (inflight.has(key)) return inflight.get(key);
  const p = Promise.resolve()
    .then(fn)
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
};

const waitFor = async (page, expr, timeout = 20000, arg = undefined) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await page.evaluate(expr, arg).catch(() => false)) return true;
    await page.waitForTimeout(300);
  }
  return false;
};

async function openList(page, lang) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(listUrl(lang), { waitUntil: "commit", timeout: 60000 });
      await page.waitForSelector("a.ln-h", { timeout: 60000 });
      await page.waitForTimeout(1200);
      return;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function scrapeList(page, lang) {
  await openList(page, lang);
  const items = await page.evaluate(() => {
    const seen = new Set();
    const out = [];
    let category = "";
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    while (walk.nextNode()) {
      const el = walk.currentNode;
      if (/^H[1-6]$/.test(el.tagName)) {
        const t = (el.innerText || "").trim().replace(/\s+/g, " ");
        if (t && !/^(welcome|murakaza neza)\b/i.test(t)) category = t;
        continue;
      }
      if (el.tagName !== "A" || !el.classList.contains("ln-h")) continue;
      const name = (el.innerText || "").trim().replace(/\s+/g, " ");
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push({ name, category });
    }
    return out;
  });
  if (!items.length) throw new Error("No services found on the Irembo list page.");
  return items;
}

function loadIndex(lang) {
  const hit = cache.index[lang];
  if (hit && hit.items.length && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit);
  return dedupe(`index::${lang}`, async () => {
    const fresh = cache.index[lang];
    if (fresh && fresh.items.length && Date.now() - fresh.at < TTL_MS) return fresh;
    const items = await withPage((page) => scrapeList(page, lang));
    cache.index[lang] = { at: Date.now(), items };
    persist();
    console.log(`indexed ${items.length} services (${lang})`);
    return cache.index[lang];
  });
}

const ABOUT = /^(about this service|ibyerekeye iyi serivisi|a\s+propos\s+de\s+ce\s+service)\b/i;
const NOISE =
  /^(learn more|kanda hano|need help|ukeneye ubufasha|you cannot apply|ntushobora gusaba|besoin d|cliquez ici|vous ne pouvez pas|saba$|apply\b)/i;
const FACT_MARKERS = [
  {
    key: "duration",
    re: /(processing\s*time|d[ée]lai\s+de\s+traitement|igihe\s+dosiye\s+imara)\s*:/i,
  },
  { key: "fee", re: /(price|prix|fee|cost|montant\s+[àa]\s+payer|igiciro|ikiguzi)\s*:/i },
  { key: "provider", re: /(provided\s*by|fourni\s+par|yatanzwe\s+na)\s*:/i },
];

function classifyHeading(line) {
  const s = norm(line);
  if (/^(who are you applying for|urasabira nde|pour qui postulez)/.test(s)) return "applicants";
  if (!/(attachment|migereka|jointes?\b)/.test(s)) return null;
  if (/^(indi migereka|other attachments|autres pieces)/.test(s)) return "other";
  if (/(optional|facultatif|ubushake|inyongera)/.test(s)) return "optional";
  if (/(required|isabwa|requis)/.test(s)) return "required";
  return "other";
}

function splitFacts(line) {
  const found = FACT_MARKERS.map((m) => {
    const match = m.re.exec(line);
    return match ? { key: m.key, start: match.index, end: match.index + match[0].length } : null;
  })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
  const out = {};
  found.forEach((m, i) => {
    const until = i + 1 < found.length ? found[i + 1].start : line.length;
    out[m.key] = line
      .slice(m.end, until)
      .replace(/\s+/g, " ")
      .replace(/^[:\s]+|[:\s]+$/g, "");
  });
  return out;
}

function parseModal(rawText, group, optionName, options, category) {
  const text = fixMojibake(rawText);
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const aboutAt = lines.findIndex((l) => ABOUT.test(l));
  const factsAt = lines.findIndex((l) => FACT_MARKERS.some((m) => m.re.test(l)));
  let about = "";
  if (aboutAt >= 0) {
    const end = factsAt > aboutAt ? factsAt : Math.min(lines.length, aboutAt + 8);
    about = lines
      .slice(aboutAt + 1, end)
      .filter((l) => !NOISE.test(l))
      .join(" ");
  }
  const facts = factsAt >= 0 ? splitFacts(lines[factsAt]) : {};

  const sections = { required: [], other: [], optional: [], applicants: [] };
  const notes = [];
  let current = null;
  for (const line of lines.slice(Math.max(factsAt, aboutAt) + 1)) {
    if (NOISE.test(line)) {
      if (/^(need help|ukeneye ubufasha|you cannot apply|ntushobora)/i.test(line)) notes.push(line);
      current = null;
      continue;
    }
    const head = classifyHeading(line);
    if (head) {
      current = head;
      continue;
    }
    if (!current) continue;
    const item = line.match(/^\d+[.)]\s+(.*)$/);
    if (item) {
      sections[current].push(item[1]);
      continue;
    }
    if (current === "applicants") {
      sections.applicants.push(line);
      continue;
    }
    current = null;
  }

  const parsed =
    Boolean(about || facts.duration || facts.fee || facts.provider) || sections.required.length > 0;
  const data = {
    id: group,
    name: group,
    option: optionName || group,
    options,
    category,
    about,
    duration: facts.duration || "",
    fee: facts.fee || "",
    provider: facts.provider || "",
    applicants: sections.applicants,
    required: sections.required,
    other: sections.other,
    optional: sections.optional,
    notes,
    fetchedAt: new Date().toISOString(),
  };
  if (!parsed || process.env.RAW_TEXT === "1") data.rawText = text;
  return data;
}

async function grabApplyUrl(page) {
  const button = page
    .locator("mat-dialog-container button, mat-dialog-container a")
    .filter({ hasText: /saba|apply|postuler|demander/i })
    .first();
  if (!(await button.count().catch(() => 0))) return null;
  await page
    .evaluate(() => {
      window.__navs = [];
      const push = history.pushState.bind(history);
      const replace = history.replaceState.bind(history);
      history.pushState = (...a) => {
        window.__navs.push(String(a[2] ?? ""));
        return push(...a);
      };
      history.replaceState = (...a) => {
        window.__navs.push(String(a[2] ?? ""));
        return replace(...a);
      };
    })
    .catch(() => {});
  await button.click({ timeout: 8000 }).catch(() => null);
  const ok = await waitFor(
    page,
    () => (window.__navs || []).some((u) => u.includes("/user/citizen/service/")),
    8000,
  );
  if (!ok) return null;
  const nav = await page.evaluate(
    () => (window.__navs || []).find((u) => u.includes("/user/citizen/service/")) || null,
  );
  if (!nav) return null;
  try {
    return new URL(nav, BASE).toString();
  } catch {
    return null;
  }
}

async function readService(page, lang, group, option) {
  await openList(page, lang);
  const link = page
    .locator("a.ln-h:visible")
    .filter({ hasText: new RegExp(`^\\s*${escapeRe(group)}\\s*$`) })
    .first();
  await link.click({ timeout: 20000 });
  await page.waitForSelector("mat-dialog-container", { timeout: 20000 });

  let options = [];
  let chosen = 0;
  const dropdown = page.locator("#grouped_service_dropdown .ng-select-container");
  if (await dropdown.count().catch(() => 0)) {
    await dropdown.click({ timeout: 15000 });
    await waitFor(page, () => document.querySelectorAll(".ng-option").length > 0, 25000);
    options = await page.evaluate(() =>
      [...document.querySelectorAll(".ng-option")].map((o) =>
        (o.innerText || "").trim().replace(/\s+/g, " "),
      ),
    );
    if (!options.length) throw new Error("Service options did not load.");
    chosen = Math.min(Math.max(option, 0), options.length - 1);
    const before = await page
      .locator("mat-dialog-container")
      .innerText({ timeout: 10000 })
      .catch(() => "");
    await page.locator(".ng-option").nth(chosen).click({ timeout: 15000 });
    const ready = await waitFor(
      page,
      (prev) => {
        const d = document.querySelector("mat-dialog-container");
        if (!d) return false;
        const t = d.innerText || "";
        return t.length > 250 && t !== prev;
      },
      25000,
      before,
    );
    if (!ready) throw new Error("Service details did not load.");
    await page.waitForTimeout(700);
  } else {
    await waitFor(
      page,
      () => (document.querySelector("mat-dialog-container")?.innerText || "").length > 250,
      15000,
    );
  }

  const rawText = await page.locator("mat-dialog-container").innerText({ timeout: 10000 });
  const url = await grabApplyUrl(page);
  const index = cache.index[lang] || { items: [] };
  const item = index.items.find((it) => it.name === group);
  const data = parseModal(
    rawText,
    group,
    options[chosen] || group,
    options,
    item ? item.category : "",
  );
  const empty =
    !data.about && !data.duration && !data.fee && !data.provider && !data.required.length;
  if (empty) throw new Error("Could not read this service's details.");
  data.url = url;
  data.listUrl = listUrl(lang);
  return data;
}

function fetchDetail(lang, item, option) {
  const key = `${lang}::${item.name}::${option}`;
  const hit = cache.detail[key];
  if (hit && !hit.failed && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit.data);
  if (hit && hit.failed && Date.now() - hit.at < NEG_TTL_MS) {
    return Promise.reject(Object.assign(new Error(hit.error), { status: 504 }));
  }
  return dedupe(key, async () => {
    const attempt = () => withPage((page) => readService(page, lang, item.name, option));
    try {
      let data;
      try {
        data = await attempt();
      } catch (e) {
        if (!/did not load|Could not read/.test(e.message)) throw e;
        await new Promise((r) => setTimeout(r, 2500));
        data = await attempt();
      }
      cache.detail[key] = { at: Date.now(), data };
      persist();
      return data;
    } catch (e) {
      cache.detail[key] = { at: Date.now(), failed: true, error: e.message };
      persist();
      throw e;
    }
  });
}

const buckets = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "?";
  const b = buckets.get(ip) || { start: now, count: 0 };
  if (now - b.start > 60000) {
    b.start = now;
    b.count = 0;
  }
  b.count += 1;
  buckets.set(ip, b);
  if (b.count > 30) {
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests, slow down." });
  }
  next();
}

const pickLang = (v) => {
  const l = String(v || "en").toLowerCase();
  return LANGS.has(l) ? l : "en";
};

const app = express();
app.set("trust proxy", true);

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/api", rateLimit);

app.get("/api/search", async (req, res) => {
  const lang = pickLang(req.query.lang);
  const q = norm(req.query.q);
  try {
    const { items } = await loadIndex(lang);
    const results = (
      q ? items.filter((it) => norm(it.name).includes(q) || norm(it.category).includes(q)) : items
    )
      .slice(0, 30)
      .map((it) => ({ id: it.name, name: it.name, category: it.category }));
    res.set("Cache-Control", "public, max-age=60");
    res.json({ lang, query: String(req.query.q || ""), total: results.length, results });
  } catch (e) {
    console.error("search failed:", e.message);
    res.status(502).json({ error: "Could not load services from Irembo." });
  }
});

app.get("/api/service", async (req, res) => {
  const lang = pickLang(req.query.lang);
  const id = String(req.query.id || "").trim();
  const option = Number.isFinite(Number(req.query.option))
    ? Math.max(0, Number(req.query.option))
    : 0;
  if (!id) return res.status(400).json({ error: "Missing id." });
  try {
    const { items } = await loadIndex(lang);
    const item = items.find((it) => it.name === id);
    if (!item) return res.status(404).json({ error: "Unknown service." });
    const data = await fetchDetail(lang, item, option);
    res.set("Cache-Control", "public, max-age=300");
    res.json(cleanValue({ ...data, lang }));
  } catch (e) {
    console.error("detail failed:", e.message);
    res.status(e.status || 502).json({ error: "Could not fetch this service from Irembo." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    cached: Object.keys(cache.index).map((lang) => ({
      lang,
      services: cache.index[lang].items.length,
      details: Object.keys(cache.detail).filter((k) => k.startsWith(`${lang}::`)).length,
    })),
  });
});

app.get("/api/debug/links", async (req, res) => {
  const allowed =
    (!process.env.DEBUG_TOKEN && ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.ip)) ||
    (process.env.DEBUG_TOKEN && req.query.token === process.env.DEBUG_TOKEN);
  if (!allowed) return res.status(403).json({ error: "Forbidden." });
  try {
    const lang = pickLang(req.query.lang);
    const force = req.query.force === "1";
    if (force) delete cache.index[lang];
    const { items } = await loadIndex(lang);
    res.json({ lang, indexed: items.length, sample: items.slice(0, 40) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

function start(port, attempt = 0) {
  const s = app.listen(port, () => {
    const actual = s.address().port;
    console.log(`Rembo Rw scraper running on http://localhost:${actual}`);
    loadIndex("en").catch((e) => console.error("Initial index failed:", e.message));
  });
  s.on("error", (e) => {
    if (e.code === "EADDRINUSE" && attempt < 20) {
      console.log(`Port ${port} is busy, trying ${port + 1}…`);
      start(port + 1, attempt + 1);
      return;
    }
    console.error("Could not start server:", e.message);
    process.exit(1);
  });
}

start(PORT);
