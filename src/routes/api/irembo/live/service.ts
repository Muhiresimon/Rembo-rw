import { createFileRoute } from "@tanstack/react-router";
import { fetchServiceDetail, toLiveLang } from "@/lib/irembo-live";

export const Route = createFileRoute("/api/irembo/live/service")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = (url.searchParams.get("id") ?? "").trim().slice(0, 200);
        const option = Number(url.searchParams.get("option") ?? "0");
        const lang = toLiveLang(url.searchParams.get("lang") ?? "en");

        if (!id) {
          return Response.json({ error: "Missing service id." }, { status: 400 });
        }

        try {
          const detail = await fetchServiceDetail(
            id,
            Number.isFinite(option) && option > 0 ? Math.floor(option) : 0,
            lang,
          );
          return Response.json(detail, { headers: { "Cache-Control": "public, max-age=300" } });
        } catch (error) {
          const status = (error as { status?: number }).status ?? 502;
          return Response.json(
            { error: "This service could not be loaded from Irembo right now." },
            { status: status === 404 ? 404 : status === 503 ? 503 : 502 },
          );
        }
      },
    },
  },
});
