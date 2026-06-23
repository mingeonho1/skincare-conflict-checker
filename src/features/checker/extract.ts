import { ACTIVES } from "./data";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/-/g, "").replace(/\s+/g, " ").trim();
}

export function extractByKeyword(ingredients: string): string[] {
  const normalizedInput = normalizeText(ingredients);
  const matchedIds = new Set<string>();

  for (const active of ACTIVES) {
    for (const alias of active.aliases) {
      const normalizedAlias = normalizeText(alias);
      if (normalizedInput.includes(normalizedAlias)) {
        matchedIds.add(active.id);
        break;
      }
    }
  }

  return Array.from(matchedIds);
}
