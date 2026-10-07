export type ArticleEntry = {
  id: string;
  lang: string;
  url: string;
  title: string;
};

export type ArticleDetail = {
  id: string;
  url: string;
  title: string;
  category: string;
  modified: string;
  summary: string;
  requirements: string[];
  facts: string[];
};

type Block = { kind: "heading" | "paragraph" | "item"; text: string; table: boolean };

type Section = { heading: string; items: string[]; tableItems: string[] };

const ARTICLE_PATH = /\/(en|fr|is)\/support\/solutions\/articles\/(\d+)-([a-z0-9-]+)\/?$/i;

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "apply",
  "application",
  "are",
  "for",
  "from",
  "get",
  "how",
  "in",
  "is",
  "of",
  "on",
  "or",
  "our",
  "request",
  "the",
  "to",
  "what",
  "with",
  "you",
  "your",
]);

const MARKER =
  /^(prerequisites?|requirements?|required documents?|documents? required|documents? to provide|documents? needed|what you (?:need|must have|should have)|eligibility|who can apply|conditions?)\s*:?\s*(.*)$/i;

const REQUIREMENT_HEADING =
  /^(?:prerequisites?|requirements?|required documents?|documents? required|documents? to provide|documents? needed|what you (?:need|must have|should have)|eligibility|who can apply|conditions?)\s*:?\s*$/i;

const FACT =
  /\b(?:rwf|frw|costs?|fees?|price|processing time|working days?|validity|valid for|delivery|delivered)\b/i;

const STEP_STOP = /^\s*\d+[.)]\s|^follow these\b|^to (?:apply|request|complete|pay)\b|^steps?\b/i;

const TRIVIAL = /^(?:note|warning|important|tip|remember)\s*:?\s*$/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  agrave: "à",
  copy: "©",
  ccedil: "ç",
  eacute: "é",
  egrave: "è",
  euro: "€",
  gt: ">",
  hellip: "…",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  ocirc: "ô",
  quot: '"',
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  ucirc: "û",
};

function safeCodePoint(code: number): string {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_raw, hex: string) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_raw, dec: string) => safeCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (raw, name: string) => {
      const key = name.toLowerCase();
      if (key === "amp") return "&";
      return NAMED_ENTITIES[key] ?? raw;
    });
}

function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function scanTag(source: string, tag: string, start: number): string {
  const matcher = new RegExp(`</?${tag}\\b[^>]*>`, "gi");
  matcher.lastIndex = start;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(source))) {
    const token = match[0];
    if (token.startsWith("</")) depth -= 1;
    else if (!token.endsWith("/>")) depth += 1;
    if (depth === 0) return source.slice(start, match.index);
  }
  return source.slice(start);
}

function extractBlock(source: string, tag: string, className: string): string | undefined {
  const opener = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const classMatcher = new RegExp(`(^|\\s)${className}(\\s|$)`);
  let match: RegExpExecArray | null;
  while ((match = opener.exec(source))) {
    const openTag = match[0];
    if (openTag.endsWith("/>")) continue;
    const attribute = /class="([^"]*)"/i.exec(openTag);
    if (!attribute?.[1] || !classMatcher.test(attribute[1])) continue;
    return scanTag(source, tag, opener.lastIndex);
  }
  return undefined;
}

function tableRanges(source: string): [number, number][] {
  const ranges: [number, number][] = [];
  const pattern = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) ranges.push([match.index, match.index + match[0].length]);
  return ranges;
}

function isInside(ranges: [number, number][], index: number): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const ranges = tableRanges(body);
  const pattern = /<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body))) {
    const tag = (match[1] ?? "").toLowerCase();
    const inner = match[2] ?? "";
    const table = isInside(ranges, match.index);
    if (tag === "li") {
      const nested = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(inner);
      if (nested) {
        const heading = textOf(nested[1] ?? "");
        if (heading) blocks.push({ kind: "heading", text: heading, table });
        const rest = textOf(inner.replace(nested[0], " "));
        if (rest) blocks.push({ kind: "item", text: rest, table });
        continue;
      }
    }
    const text = textOf(inner);
    if (!text) continue;
    blocks.push({
      kind: tag === "p" ? "paragraph" : tag === "li" ? "item" : "heading",
      text,
      table,
    });
  }
  return blocks;
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function singular(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

export function titleFromSlug(slug: string): string {
  const words = slug.replace(/^-+/, "").replace(/-+$/, "").split("-").filter(Boolean);
  const title = words.join(" ").trim();
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function parseArticleUrl(rawUrl: string): ArticleEntry | undefined {
  const match = ARTICLE_PATH.exec(rawUrl.trim());
  if (!match) return undefined;
  const lang = match[1]?.toLowerCase();
  const id = match[2];
  const slug = match[3];
  if (!lang || !id || !slug) return undefined;
  return { id, lang, url: rawUrl.trim(), title: titleFromSlug(slug) };
}

export function parseSitemap(xml: string): ArticleEntry[] {
  const entries: ArticleEntry[] = [];
  const seen = new Set<string>();
  const pattern = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml))) {
    const location = match[1];
    if (!location) continue;
    const entry = parseArticleUrl(location);
    if (!entry || seen.has(entry.url)) continue;
    seen.add(entry.url);
    entries.push(entry);
  }
  return entries;
}

export function searchArticles(query: string, entries: ArticleEntry[], limit = 3): ArticleEntry[] {
  const needle = normalize(query);
  const tokens = needle.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return [];
  const keyTokens = tokens.filter((token) => !STOPWORDS.has(token));
  const used = keyTokens.length ? keyTokens : tokens;

  const scored: { entry: ArticleEntry; score: number; hits: number }[] = [];
  const requiredHits = Math.max(1, Math.ceil(used.length * 0.6));
  for (const entry of entries) {
    const title = normalize(entry.title);
    const titleTokens = new Set(title.split(/[^a-z0-9]+/).filter(Boolean));
    let score = 0;
    let hits = 0;
    for (const token of used) {
      const variants = [token, singular(token)];
      const hit =
        variants.some((variant) => titleTokens.has(variant)) ||
        (token.length >= 5 && title.includes(token));
      if (!hit) continue;
      hits += 1;
      score += variants.some((variant) => titleTokens.has(variant)) ? 4 : 2;
    }
    if (hits < requiredHits) continue;
    if (title.includes(needle)) {
      score += 8;
      const position = title.indexOf(needle);
      score += Math.max(0, 6 - Math.floor(position / 8));
    }
    score += Math.max(0, 8 - Math.floor(title.length / 12));
    if (/^(how to|tips and how to|guide to)/.test(title)) score += 3;
    if (/\b(faq|faqs|frequently asked)\b/.test(title)) score -= 5;
    if (score > 0) scored.push({ entry, score, hits });
  }

  scored.sort(
    (a, b) => b.score - a.score || b.hits - a.hits || a.entry.title.localeCompare(b.entry.title),
  );
  return scored.slice(0, limit).map((item) => item.entry);
}

function matchMarker(text: string): Section | undefined {
  const match = MARKER.exec(text);
  if (!match) return undefined;
  const label = match[1];
  const rest = (match[2] ?? "").trim();
  if (!label) return undefined;
  const heading = label.replace(/\s*:$/, "").trim();
  const section: Section = { heading, items: [], tableItems: [] };
  if (rest) section.items.push(rest);
  return section;
}

function usable(items: string[], minLength: number): string[] {
  return items.filter(
    (item) => item.length >= minLength && !TRIVIAL.test(item) && !STEP_STOP.test(item),
  );
}

function collectRequirements(sections: Section[]): string[] {
  const strict = sections.find((section) => REQUIREMENT_HEADING.test(section.heading));
  const loose = sections.find((section) => /requirement|prerequisite/i.test(section.heading));
  const chosen = strict ?? loose;
  if (!chosen) return [];
  const prose = usable(chosen.items, 4);
  const fromTables = usable(chosen.tableItems, 12);
  const items = prose.length ? prose : fromTables;
  return [...new Set(items)].slice(0, 10);
}

export function parseArticle(html: string, entry: ArticleEntry): ArticleDetail {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  const title = textOf(extractBlock(cleaned, "h1", "article__title") ?? "") || entry.title;

  const crumbs = extractBlock(cleaned, "ol", "breadcrumbs");
  const category = crumbs
    ? [...crumbs.matchAll(/<li[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/gi)]
        .map((match) => textOf(match[1] ?? ""))
        .filter(Boolean)
        .slice(1)
        .join(" · ")
    : "";

  const meta = /<div[^>]*class="[^"]*\bmeta\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(cleaned);
  const modified = meta ? textOf(meta[1] ?? "") : "";

  const body = extractBlock(cleaned, "div", "article__body") ?? "";
  const blocks = parseBlocks(body);

  const sections: Section[] = [];
  let current: Section = { heading: "", items: [], tableItems: [] };
  let summary = "";
  let closed = false;

  for (const block of blocks) {
    if (block.kind === "heading") {
      sections.push(current);
      current = { heading: block.text, items: [], tableItems: [] };
      closed = false;
      continue;
    }
    if (block.kind === "paragraph") {
      const marker = matchMarker(block.text);
      if (marker) {
        sections.push(current);
        current = marker;
        closed = false;
        continue;
      }
      if (closed) continue;
      if (current.heading) {
        if (STEP_STOP.test(block.text)) {
          closed = true;
          continue;
        }
        (block.table ? current.tableItems : current.items).push(block.text);
      } else if (!summary) {
        summary = block.text;
      }
      continue;
    }
    if (closed) continue;
    if (STEP_STOP.test(block.text)) {
      closed = true;
      continue;
    }
    (block.table ? current.tableItems : current.items).push(block.text);
  }
  sections.push(current);

  const requirements = collectRequirements(
    sections.filter((section) => section.heading !== "" || section.items.length > 0),
  );

  const facts: string[] = [];
  const seen = new Set(requirements);
  for (const block of blocks) {
    if (block.kind === "heading" || block.table) continue;
    if (block.text.length < 12 || block.text.length > 240) continue;
    if (!FACT.test(block.text) || seen.has(block.text)) continue;
    seen.add(block.text);
    facts.push(block.text);
    if (facts.length === 3) break;
  }

  if (!summary) summary = blocks.find((block) => block.kind === "paragraph")?.text ?? "";

  return {
    id: entry.id,
    url: entry.url,
    title,
    category,
    modified,
    summary: clamp(summary, 260),
    requirements,
    facts,
  };
}
