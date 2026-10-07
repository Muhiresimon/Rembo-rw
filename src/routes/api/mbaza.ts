import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const Body = z.object({
  language: z.enum(["EN", "KN", "FR"]).default("EN"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
});

const SYSTEM = `You are Mbaza, the assistant of RemboRw, an independent concierge that helps people in Rwanda and the diaspora with government e-services on Irembo (passports, birth certificates, criminal record certificates, change of name, etc.).

Answer the question directly: no preamble, no filler, no restating the question.
Formatting rules:
- Write clean, professional prose. Use short paragraphs and bullet points for checklists; bold key terms.
- When comparing options, documents, requirements, fees, deadlines or steps, use a GitHub-flavored markdown table with a clear header row (e.g. | Document | Child passport | Birth certificate |).
- Never add watermarks, footers, signatures, disclaimers about being an AI, model names, credits, or any branding/attribution line.
- Keep it under 150 words plus any table.
- Always remind users to confirm exact fees and requirements on irembo.gov.rw when giving requirements.
- If they want someone to apply for them, point them to the concierge button, always quoting its exact label.`;

const LOVABLE_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const LOVABLE_MODEL = "openai/gpt-6-astra";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
// Fastest first: benchmarks on this key put 3.5-flash-lite and
// flash-lite-latest at ~0.8-2.2s to first token, while 3.7-flash / 3.8-flash
// return 503 (high demand) or stall for 10s+. Tried in order — each model has
// its own burst quota, so a throttled one is skipped for the next.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_FALLBACKS = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

// Lovable issues `sk_…` project keys; Google AI Studio issues `AQ.…` Gemini keys.
// Only the first shape is accepted by the Lovable gateway, so pick the endpoint
// from the key instead of hard-failing on whichever one is configured.
function isLovableKey(key: string): boolean {
  return key.startsWith("sk_");
}

function statusOf(error: unknown): number | undefined {
  return (
    (error as { statusCode?: number; status?: number })?.statusCode ??
    (error as { status?: number })?.status
  );
}

// Worth trying the next model for: overload, rate limits and gateway hiccups.
// Auth and quota failures are rejected the same way by every model, so stop.
function isTransient(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function describeFailure(error: unknown): { status: number; message: string } {
  const status = statusOf(error) ?? 502;
  const text = error instanceof Error ? error.message : String(error);
  if (status === 401 || status === 403) {
    return { status, message: "Mbaza's AI key was rejected. Please ask the admin to update it." };
  }
  if (status === 402) {
    return { status, message: "AI credits are used up for now." };
  }
  if (status === 429) {
    return { status, message: "Too many questions — please wait a moment." };
  }
  if (status >= 500) {
    return { status, message: "The AI service is busy right now. Please try again in a moment." };
  }
  return { status, message: text || "Mbaza could not answer." };
}

// streamText only calls the provider once the body is consumed, i.e. after the
// 200 header is already on the wire — so a rejected key or an overloaded model
// used to produce an empty 200 and a useless "no answer" in the chat. Read the
// first chunk before responding: failures that happen before any content can
// still be reported with a real status, successful streams are passed through.
async function guardFirstChunk(upstream: Response): Promise<Response> {
  const body = upstream.body;
  if (!body) return upstream;

  const reader = body.getReader();
  let first: ReadableStreamReadResult<Uint8Array>;
  try {
    first = await reader.read();
  } catch (error) {
    const failure = describeFailure(error);
    return Response.json({ error: failure.message }, { status: failure.status });
  }
  if (first.done) {
    return Response.json({ error: "Mbaza returned no answer. Please try again." }, { status: 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(first.value);
    },
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return new Response(stream, { headers: upstream.headers });
}

export const Route = createFileRoute("/api/mbaza")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return Response.json({ error: "AI is not configured" }, { status: 500 });

        const instruction = {
          EN: "Reply in natural, fluent English. The concierge button is named “Ask an Admin to handle it”.",
          KN: "Reply in natural, fluent, standard Kinyarwanda (proper spelling and grammar only). The concierge button is named “Saba umuyobozi agukorere” — quote that Kinyarwanda label, never an English one.",
          FR: "Répondez en français naturel et courant. Le bouton concierge s’appelle “Demander à un Admin de s’en occuper”.",
        }[parsed.data.language];
        const lovable = isLovableKey(key);
        const openai = createOpenAI(
          lovable
            ? {
                baseURL: LOVABLE_BASE_URL,
                apiKey: key,
                headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
              }
            : { baseURL: GEMINI_BASE_URL, apiKey: key },
        );
        const modelIds = lovable
          ? [LOVABLE_MODEL]
          : [...new Set([process.env["MBAZA_MODEL"] || GEMINI_MODEL, ...GEMINI_FALLBACKS])];

        const common = {
          system: `${SYSTEM}\n${instruction}`,
          messages: parsed.data.messages,
          maxRetries: 0,
          maxOutputTokens: 800,
          abortSignal: request.signal,
        };

        let lastFailure: Response | undefined;
        for (const [index, modelId] of modelIds.entries()) {
          const result = streamText({
            ...common,
            model: lovable ? openai.responses(modelId) : openai.chat(modelId),
            ...(lovable
              ? {
                  providerOptions: {
                    openai: {
                      forceReasoning: true,
                      reasoningEffort: "low",
                      reasoningSummary: "auto",
                      store: false,
                      include: ["reasoning.encrypted_content"],
                    },
                  },
                }
              : {}),
          });

          let response: Response;
          try {
            response = await guardFirstChunk(result.toTextStreamResponse());
          } catch (e) {
            const failure = describeFailure(e);
            response = Response.json({ error: failure.message }, { status: failure.status });
          }
          if (response.ok) return response;

          lastFailure = response;
          const isLastModel = index === modelIds.length - 1;
          if (isLastModel || !isTransient(response.status)) return response;
        }
        return lastFailure ?? Response.json({ error: "Mbaza could not answer." }, { status: 502 });
      },
    },
  },
});
