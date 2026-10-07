import { dict, isLang, type Lang } from "@/lib/i18n";
import { Markdown } from "@/lib/markdown";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function Mbaza({ language, onClose }: { language: Lang; onClose: () => void }) {
  const lang: Lang = isLang(language) ? language : "EN";
  const t = dict[lang];
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/mbaza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, messages: next }),
      });
      if (!res.ok || !res.body) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          payload.error ||
            (res.status === 402
              ? t.mbaza.errors.credits
              : res.status === 429
                ? t.mbaza.errors.rate
                : t.mbaza.errors.generic),
        );
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
        endRef.current?.scrollIntoView({ block: "end" });
      }
      if (!acc) throw new Error(t.mbaza.errors.empty);
    } catch (e) {
      setMessages(next);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-[132px] right-5 z-30 flex w-[min(560px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[#dce8df] bg-white shadow-2xl">
      <div className="flex items-center gap-3 bg-[#007a33] px-4 py-3 text-white">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
          <MessageCircle size={15} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">{t.mbaza.title}</span>
          <span className="block text-[11px] text-white/80">{t.mbaza.subtitle}</span>
        </span>
        <button
          onClick={onClose}
          aria-label={t.mbaza.close}
          className="rounded-md p-1 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex max-h-[65vh] min-h-40 flex-col gap-3 overflow-auto bg-[#f6faf8] p-4 text-[13px]">
        <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-[#dce8df] bg-white p-3 leading-5 text-[#42524a]">
          {t.mbaza.greeting}
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {t.mbaza.suggestions.map((question) => (
              <button
                key={question}
                onClick={() => send(question)}
                className="rounded-full border border-[#8fc5a0] bg-white px-3 py-2 text-left text-[12px] font-semibold text-[#00662e] transition hover:border-[#007a33] hover:bg-[#effaf2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a33]"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[92%] rounded-xl p-3 leading-5 ${
              m.role === "user"
                ? "self-end whitespace-pre-wrap rounded-tr-sm bg-[#007a33] text-white"
                : "w-fit max-w-full rounded-tl-sm border border-[#dce8df] bg-white text-[#42524a]"
            }`}
          >
            {m.content ? (
              m.role === "user" ? (
                m.content
              ) : (
                <Markdown text={m.content} />
              )
            ) : (
              <span className="text-[#6b7a72]">{t.mbaza.thinking}</span>
            )}
          </div>
        ))}

        {error && (
          <div
            className="rounded-lg border border-[#f3c9c9] bg-[#fdecec] p-3 text-[#a12a2a]"
            role="alert"
          >
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-[#e5ece7] p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.mbaza.input}
          aria-label={t.mbaza.input}
          className="min-w-0 flex-1 rounded-lg border border-[#cfe2d6] px-3 py-2 text-[13px] outline-none transition placeholder:text-[#6b7a72] hover:border-[#a8cebb] focus:border-[#007a33] focus-visible:ring-2 focus-visible:ring-[#007a33]"
        />
        <button
          disabled={busy}
          aria-label={t.mbaza.input}
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#007a33] text-white transition hover:bg-[#00612a] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a33] focus-visible:ring-offset-2"
        >
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
