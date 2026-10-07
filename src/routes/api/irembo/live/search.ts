import { createFileRoute } from "@tanstack/react-router";
import { kbSearch } from "@/lib/irembo-kb";
import { mapArticleHits, searchScraper, toHelpCenterLang, toLiveLang } from "@/lib/irembo-live";

export const Route = createFileRoute("/api/irembo/live/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
        const requestedLang = url.searchParams.get("lang") ?? "en";
        const lang = toLiveLang(requestedLang);

        if (query.length < 2) {
          return Response.json(
            { query, source: null, results: [] },
            { headers: { "Cache-Control": "public, max-age=60" } },
          );
        }

        const liveHits = await searchScraper(query, lang);
        if (liveHits && liveHits.length > 0) {
          return Response.json(
            { query, source: "irembo", results: liveHits },
            { headers: { "Cache-Control": "public, max-age=60" } },
          );
        }

        try {
          const articles = await kbSearch(query, toHelpCenterLang(requestedLang));
          return Response.json(
            { query, source: "help-center", results: mapArticleHits(articles) },
            { headers: { "Cache-Control": "public, max-age=120" } },
          );
        } catch {
          return Response.json({ error: "Irembo is unreachable right now." }, { status: 502 });
        }
      },
    },
  },
});
