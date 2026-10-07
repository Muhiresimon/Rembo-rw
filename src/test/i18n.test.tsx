import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RemboPage } from "@/components/RemboPage";
import { LANGS, dict } from "@/lib/i18n";

const HEADINGS = {
  EN: "without the queue.",
  KN: "utabanje kwinjira mu rutonde.",
  FR: "sans la queue.",
} as const;

const flattenKeys = (value: unknown, path: string[] = []): string[] =>
  typeof value === "string"
    ? [path.join(".")]
    : Array.isArray(value)
      ? value.flatMap((entry, index) => flattenKeys(entry, [...path, String(index)]))
      : value && typeof value === "object"
        ? Object.entries(value).flatMap(([key, entry]) => flattenKeys(entry, [...path, key]))
        : [];

describe("Language switcher", () => {
  it("renders the hero heading in EN, KN and FR", async () => {
    render(<RemboPage />);

    for (const lang of LANGS) {
      fireEvent.click(screen.getByRole("button", { name: lang }));
      expect(screen.getByText(HEADINGS[lang])).toBeInTheDocument();
    }
  });

  it("keeps the WhatsApp action and Rwanda flag available in every language", async () => {
    render(<RemboPage />);

    for (const lang of LANGS) {
      fireEvent.click(screen.getByRole("button", { name: lang }));

      const whatsapp = Array.from(document.querySelectorAll("a")).find((a) =>
        a.getAttribute("href")?.startsWith("https://wa.me/250798892113"),
      );
      expect(whatsapp).toBeTruthy();

      expect(document.querySelectorAll("svg[viewBox='0 0 90 60']").length).toBeGreaterThan(0);
    }
  });

  it("exposes the same dictionary keys in EN, KN and FR", () => {
    const [en, kn, fr] = LANGS.map((lang) => flattenKeys(dict[lang]).sort());

    expect(kn).toEqual(en);
    expect(fr).toEqual(en);
  });
});
