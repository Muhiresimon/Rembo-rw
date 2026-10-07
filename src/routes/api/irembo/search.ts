import { createFileRoute } from "@tanstack/react-router";
import { kbSearch, MAX_KB_RESULTS } from "@/lib/irembo-kb";
import { mapArticleHits, toHelpCenterLang } from "@/lib/irembo-live";

export const Route = createFileRoute("/api/irembo/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
        const lang = toHelpCenterLang(url.searchParams.get("lang") ?? "en");

        if (query.length < 2) {
          return Response.json(
            { query, results: [] },
            { headers: { "Cache-Control": "public, max-age=60" } },
          );
        }

        try {
          const results = await kbSearch(query, lang, MAX_KB_RESULTS);
          return Response.json(
            { query, results },
            { headers: { "Cache-Control": "public, max-age=120" } },
          );
        } catch {
          return Response.json(
            { error: "Irembo's help center is unreachable right now." },
            { status: 502 },
          );
        }
      },
    },
  },
});
