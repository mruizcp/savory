/**
 * Escala cantidades en texto libre (p. ej. "200 g", "1/2 taza") y formatea números.
 * Si no hay número inicial reconocible, se añade un factor entre paréntesis.
 */

export function defaultBaseServings(servings: number | null | undefined): number {
  const n = servings ?? 4;
  return Math.min(50, Math.max(1, Math.round(n)));
}

export function getServingScaleFactor(
  baseServings: number,
  targetServings: number,
): number {
  if (baseServings <= 0 || targetServings <= 0) return 1;
  return targetServings / baseServings;
}

function parseLeadingNumericQuantity(
  text: string,
): { value: number; rest: string } | null {
  const t = text.trim();
  const frac = /^(\d+)\s*\/\s*(\d+)\s+(.*)$/.exec(t);
  if (frac) {
    const a = parseInt(frac[1], 10);
    const b = parseInt(frac[2], 10);
    if (b === 0) return null;
    return { value: a / b, rest: frac[3].trim() };
  }
  const dec = /^(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(t);
  if (dec) {
    const value = parseFloat(dec[1].replace(",", "."));
    if (Number.isNaN(value)) return null;
    return { value, rest: dec[2].trim() };
  }
  return null;
}

export function formatScaledNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  if (Math.abs(rounded - Math.round(rounded)) < 0.0001) {
    return String(Math.round(rounded));
  }
  return String(Math.round(rounded * 100) / 100).replace(/\.?0+$/, "");
}

export function scaleQuantityText(
  quantityText: string | null,
  factor: number,
): string | null {
  if (quantityText == null || !quantityText.trim()) {
    return quantityText;
  }
  const parsed = parseLeadingNumericQuantity(quantityText);
  if (!parsed) {
    const f = formatScaledNumber(factor);
    return `${quantityText} (×${f})`;
  }
  const scaled = parsed.value * factor;
  const formatted = formatScaledNumber(scaled);
  const rest = parsed.rest ? ` ${parsed.rest}` : "";
  return `${formatted}${rest}`.trim();
}

export function scaleCalories(
  calories: number | null,
  factor: number,
): number | null {
  if (calories == null) return null;
  return Math.max(0, Math.round(calories * factor));
}
