export function jsonArrayToText(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : ""
}

export function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

export function priceLabel(value?: number | string | null, currency = "USD") {
  if (value == null) return "Preis nicht angegeben"
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return "Preis nicht angegeben"
  return `${currency} ${numeric.toFixed(2)}`
}
