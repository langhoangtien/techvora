export function jsonArrayToText(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : ""
}

export function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

export function priceLabel(value?: number | string | null, currency = "USD") {
  if (value == null) return "Pricing not listed"
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return "Pricing not listed"
  return `${currency} ${numeric.toFixed(2)}`
}
