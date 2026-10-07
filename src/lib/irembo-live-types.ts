import type { ArticleDetail } from "@/lib/irembo";

export type LiveSource = "irembo" | "help-center";

export type LiveHit = {
  id: string;
  title: string;
  category: string;
  source: LiveSource;
  article?: ArticleDetail;
};

export type ServiceDetail = {
  id: string;
  name: string;
  option: string;
  options: string[];
  category: string;
  about: string;
  duration: string;
  fee: string;
  provider: string;
  applicants: string[];
  required: string[];
  other: string[];
  optional: string[];
  notes: string[];
  fetchedAt: string;
  url: string;
  listUrl: string;
  lang: string;
};

export function toLiveLang(language: string): "en" | "fr" | "rw" {
  const lang = language.toLowerCase();
  if (lang === "fr" || lang === "rw" || lang === "kn") return lang === "kn" ? "rw" : lang;
  return "en";
}

export function toHelpCenterLang(language: string): string {
  return language.toLowerCase() === "fr" ? "fr" : "en";
}
