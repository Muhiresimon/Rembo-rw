import type { ArticleDetail } from "@/lib/irembo";
import {
  toHelpCenterLang,
  toLiveLang,
  type LiveHit,
  type ServiceDetail,
} from "@/lib/irembo-live-types";

export { toHelpCenterLang, toLiveLang };
export type { LiveHit, LiveSource, ServiceDetail } from "@/lib/irembo-live-types";

export const MAX_LIVE_RESULTS = 9;

const SEARCH_TIMEOUT_MS = 30000;
const DETAIL_TIMEOUT_MS = 45000;

export function scraperBase(): string {
  if (typeof process === "undefined") return "";
  return (process.env?.["SCRAPER_URL"] ?? "").replace(/\/+$/, "");
}

export function mapScraperResults(payload: unknown): LiveHit[] {
  const results =
    typeof payload === "object" && payload !== null && "results" in payload
      ? (payload as { results?: unknown }).results
      : undefined;
  if (!Array.isArray(results)) return [];

  const hits: LiveHit[] = [];
  for (const entry of results) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as { id?: unknown; name?: unknown; category?: unknown };
    const id = typeof record.name === "string" ? record.name : "";
    if (!id.trim()) continue;
    hits.push({
      id: id.trim(),
      title: id.trim(),
      category: typeof record.category === "string" ? record.category.trim() : "",
      source: "irembo",
    });
    if (hits.length === MAX_LIVE_RESULTS) break;
  }
  return hits;
}

export function mapArticleHits(articles: ArticleDetail[]): LiveHit[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    category: article.category,
    source: "help-center",
    article,
  }));
}

export async function searchScraper(query: string, lang: string): Promise<LiveHit[] | undefined> {
  const base = scraperBase();
  if (!base) return undefined;
  try {
    const params = new URLSearchParams({ q: query, lang });
    const response = await fetch(`${base}/api/search?${params.toString()}`, {
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;
    return mapScraperResults(await response.json());
  } catch {
    return undefined;
  }
}

export async function fetchServiceDetail(
  id: string,
  option: number,
  lang: string,
): Promise<ServiceDetail> {
  const base = scraperBase();
  if (!base)
    throw Object.assign(new Error("Live Irembo scraper is not configured"), { status: 503 });

  const params = new URLSearchParams({ id, lang, option: String(option) });
  const response = await fetch(`${base}/api/service?${params.toString()}`, {
    signal: AbortSignal.timeout(DETAIL_TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw Object.assign(new Error(body.error ?? "Live service lookup failed"), {
      status: response.status,
    });
  }
  return (await response.json()) as ServiceDetail;
}
