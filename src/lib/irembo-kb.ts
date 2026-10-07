import {
  parseArticle,
  parseSitemap,
  searchArticles,
  type ArticleDetail,
  type ArticleEntry,
} from "@/lib/irembo";

const SITEMAP_URL = "https://support.irembo.gov.rw/support/sitemap.xml";
const INDEX_TTL_MS = 24 * 60 * 60 * 1000;
const ARTICLE_TTL_MS = 12 * 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 9000;
const USER_AGENT = "RemboRw/1.0 (public service requirements guide)";

export const MAX_KB_RESULTS = 3;

type Cached<T> = { value: T; expires: number };

let indexCache: Cached<ArticleEntry[]> | undefined;
const indexPending = new Map<string, Promise<ArticleEntry[]>>();
const articleCache = new Map<string, Cached<ArticleDetail>>();
const articlePending = new Map<string, Promise<ArticleDetail>>();

async function fetchText(url: string, lang: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.8,*/*;q=0.5",
      "Accept-Language": lang,
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Irembo responded with ${response.status}`);
  return response.text();
}

async function loadIndex(lang: string): Promise<ArticleEntry[]> {
  const cached = indexCache;
  if (cached && cached.expires > Date.now()) {
    const matches = cached.value.filter((entry) => entry.lang === lang);
    if (matches.length) return matches;
  }

  const pending = indexPending.get("sitemap");
  if (pending) {
    const entries = await pending;
    return entries.filter((entry) => entry.lang === lang);
  }

  const promise = (async () => {
    const xml = await fetchText(SITEMAP_URL, lang);
    const entries = parseSitemap(xml);
    if (!entries.length) throw new Error("Irembo's service index is empty");
    indexCache = { value: entries, expires: Date.now() + INDEX_TTL_MS };
    return entries;
  })();
  indexPending.set("sitemap", promise);

  try {
    const entries = await promise;
    const matches = entries.filter((entry) => entry.lang === lang);
    if (matches.length) return matches;
    return entries.filter((entry) => entry.lang === "en");
  } finally {
    indexPending.delete("sitemap");
  }
}

async function loadArticle(entry: ArticleEntry): Promise<ArticleDetail> {
  const cached = articleCache.get(entry.url);
  if (cached && cached.expires > Date.now()) return cached.value;

  const pending = articlePending.get(entry.url);
  if (pending) return pending;

  const promise = (async () => {
    const html = await fetchText(entry.url, entry.lang);
    const detail = parseArticle(html, entry);
    articleCache.set(entry.url, { value: detail, expires: Date.now() + ARTICLE_TTL_MS });
    return detail;
  })();
  articlePending.set(entry.url, promise);

  try {
    return await promise;
  } finally {
    articlePending.delete(entry.url);
  }
}

function emptyDetail(entry: ArticleEntry): ArticleDetail {
  return {
    id: entry.id,
    url: entry.url,
    title: entry.title,
    category: "",
    modified: "",
    summary: "",
    requirements: [],
    facts: [],
  };
}

export async function kbSearch(
  query: string,
  lang: string,
  limit = MAX_KB_RESULTS,
): Promise<ArticleDetail[]> {
  const matches = searchArticles(query, await loadIndex(lang), limit);
  return Promise.all(
    matches.map(async (entry) => {
      try {
        return await loadArticle(entry);
      } catch {
        return emptyDetail(entry);
      }
    }),
  );
}
