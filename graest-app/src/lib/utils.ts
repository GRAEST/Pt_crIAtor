import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Converts AI plain-text response into HTML that TipTap can parse into
 * proper document nodes (paragraphs, bold, italic, etc.).
 *
 * - Double newlines → paragraph breaks
 * - Single newlines → <br>
 * - **text** or *text* → <strong>/<em> (fallback in case AI still uses markdown)
 */
export function aiTextToHtml(text: string): string {
  // Strip markdown bold/italic markers → convert to HTML tags
  let html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Split into paragraphs on double-newline
  const paragraphs = html.split(/\n{2,}/);

  // Wrap each paragraph in <p>, convert remaining single \n to <br>
  return paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
