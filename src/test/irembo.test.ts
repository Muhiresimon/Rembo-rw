import { describe, expect, it } from "vitest";

import { parseArticle, parseSitemap, searchArticles, titleFromSlug } from "@/lib/irembo";
import { mapArticleHits, mapScraperResults } from "@/lib/irembo-live";
import { toLiveLang } from "@/lib/irembo-live-types";

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://support.irembo.gov.rw/en/support/solutions/articles/47001193156-how-to-apply-for-a-birth-certificate</loc></url>
  <url><loc>https://support.irembo.gov.rw/en/support/solutions/articles/47001147721-how-to-apply-for-a-criminal-record-certificate</loc></url>
  <url><loc>https://support.irembo.gov.rw/en/support/solutions/articles/47001165759-tips-and-how-to-apply-for-an-e-passport-for-the-first-time</loc></url>
  <url><loc>https://support.irembo.gov.rw/fr/support/solutions/articles/47001226033-how-to-apply-for-change-of-name</loc></url>
  <url><loc>https://support.irembo.gov.rw/en/support/home</loc></url>
  <url><loc>https://support.irembo.gov.rw/en/support/solutions</loc></url>
</urlset>`;

const ARTICLE_HTML = `
<html><body>
  <ol class="breadcrumbs">
    <li><a href="/en/support/home">IremboGov</a></li>
    <li title="Family"><a href="/en/support/solutions/47000523242">Family</a></li>
    <li title="Birth Services"><a href="/en/support/solutions/folders/47000777678">Birth Services</a></li>
  </ol>
  <article class="article">
    <header class="article-header">
      <h1 class="article__title" itemprop="name">How to Apply for a Birth Certificate</h1>
      <div class="article-meta">
        <div class="entry-info__content">
          <div class="meta">Modified on: Thu, 15 May, 2025 at 4:34 PM</div>
        </div>
      </div>
    </header>
    <div class="article__body markdown" itemprop="articleBody">
      <p>This service allows all Rwandans to apply for a birth certificate.</p>
      <p>The processing time of a birth certificate is 1 working day; the service costs Rwf 500.</p>
      <p><b>Prerequisites:&nbsp;</b></p>
      <ul>
        <li><p>Applicants should have an Irembo account or visit the nearest agent.</p></li>
        <li><p>Applicants should have a National ID number or a Citizen application number.</p></li>
      </ul>
      <h2>Follow these simple steps to apply</h2>
      <ol><li>Visit www.irembo.gov.rw and Log In.</li></ol>
    </div>
  </article>
</body></html>`;

describe("Irembo knowledge base index", () => {
  it("keeps only article URLs and derives a readable title from the slug", () => {
    const entries = parseSitemap(SITEMAP);

    expect(entries).toHaveLength(4);
    expect(entries.map((entry) => entry.lang).sort()).toEqual(["en", "en", "en", "fr"]);
    expect(
      entries.some((entry) => entry.title.includes("How to apply for a birth certificate")),
    ).toBe(true);
    expect(titleFromSlug("how-to-apply-for-change-of-name")).toBe(
      "How to apply for change of name",
    );
    expect(titleFromSlug("how-to-apply-for-a-certificate-of-succession-")).toBe(
      "How to apply for a certificate of succession",
    );
  });

  it("ranks the article the query is about first", () => {
    const entries = parseSitemap(SITEMAP);

    const birth = searchArticles("birth certificate", entries);
    expect(birth[0]?.title).toContain("birth certificate");

    const criminal = searchArticles("criminal record", entries);
    expect(criminal[0]?.title).toContain("criminal record");

    expect(searchArticles("passport", entries)).toHaveLength(1);
    expect(searchArticles("   ", entries)).toEqual([]);
    expect(searchArticles("zzzz", entries)).toEqual([]);
  });

  it("matches in the requested language only", () => {
    const entries = parseSitemap(SITEMAP).filter((entry) => entry.lang === "fr");

    expect(searchArticles("change of name", entries)).toHaveLength(1);
    expect(searchArticles("birth certificate", entries)).toEqual([]);
  });
});

describe("Irembo article parsing", () => {
  const entry = parseSitemap(SITEMAP)[0];

  it("extracts the title, breadcrumb category and modification date", () => {
    expect(entry).toBeDefined();
    const article = parseArticle(ARTICLE_HTML, entry!);

    expect(article.title).toBe("How to Apply for a Birth Certificate");
    expect(article.category).toBe("Family · Birth Services");
    expect(article.modified).toBe("Modified on: Thu, 15 May, 2025 at 4:34 PM");
  });

  it("extracts the summary, requirements and fee/processing facts", () => {
    const article = parseArticle(ARTICLE_HTML, entry!);

    expect(article.summary).toBe(
      "This service allows all Rwandans to apply for a birth certificate.",
    );
    expect(article.requirements).toEqual([
      "Applicants should have an Irembo account or visit the nearest agent.",
      "Applicants should have a National ID number or a Citizen application number.",
    ]);
    expect(article.facts).toContain(
      "The processing time of a birth certificate is 1 working day; the service costs Rwf 500.",
    );
    expect(article.url).toBe(entry!.url);
  });

  it("returns an empty requirement list when the article has no prerequisites section", () => {
    const html = `
      <h1 class="article__title">General Information</h1>
      <ol class="breadcrumbs"><li><a href="/en/support/home">IremboGov</a></li></ol>
      <div class="article__body markdown"><p>Some guidance without a requirements list.</p></div>`;
    const article = parseArticle(html, entry!);

    expect(article.requirements).toEqual([]);
    expect(article.category).toBe("");
    expect(article.summary).toBe("Some guidance without a requirements list.");
  });
});

describe("Live Irembo scraper mapping", () => {
  it("maps the site's language codes onto scraper languages", () => {
    expect(toLiveLang("EN")).toBe("en");
    expect(toLiveLang("FR")).toBe("fr");
    expect(toLiveLang("KN")).toBe("rw");
    expect(toLiveLang("rw")).toBe("rw");
    expect(toLiveLang("de")).toBe("en");
  });

  it("turns scraper search results into live hits and drops unusable entries", () => {
    const hits = mapScraperResults({
      results: [
        { id: "e-Passport Application", name: "e-Passport Application", category: "Immigration" },
        { id: "x", name: "   ", category: "Sport" },
        { name: "Gusaba Indangamuntu", category: "Irangamimerere" },
        "not-an-object",
      ],
    });

    expect(hits).toHaveLength(2);
    expect(hits[0]).toMatchObject({
      id: "e-Passport Application",
      category: "Immigration",
      source: "irembo",
    });
    expect(hits[0]?.article).toBeUndefined();
    expect(mapScraperResults({ results: null })).toEqual([]);
  });

  it("caps live hits and keeps help-center articles inline", () => {
    const many = Array.from({ length: 20 }, (_, index) => ({ name: `Service ${index}` }));
    expect(mapScraperResults({ results: many })).toHaveLength(9);

    const articles = mapArticleHits([
      {
        id: "1",
        url: "https://support.irembo.gov.rw/en/support/solutions/articles/1-x",
        title: "How to Apply",
        category: "Family",
        modified: "",
        summary: "Summary",
        requirements: ["National ID"],
        facts: [],
      },
    ]);

    expect(articles).toHaveLength(1);
    expect(articles[0]?.source).toBe("help-center");
    expect(articles[0]?.article?.requirements).toEqual(["National ID"]);
  });
});
