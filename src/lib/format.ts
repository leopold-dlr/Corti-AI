import type { FieldValue } from "@/lib/analysis";
import type { Lang, Messages } from "@/lib/i18n";

/** Valeur lisible d'un champ de la Data collection (listes fixes, booléens, nombres) */
export function formatValue(value: FieldValue, t: Messages): string {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return t.dossier.notProvided;
  }
  if (typeof value === "boolean") return value ? t.dossier.yes : t.dossier.no;
  if (typeof value === "number") return String(value);
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds === null) return null;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${String(seconds % 60).padStart(2, "0")} s`;
}

export function formatDate(unixSeconds: number | null, lang: Lang): string | null {
  if (unixSeconds === null) return null;
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(unixSeconds * 1000));
}

export function toNumber(value: FieldValue): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}
