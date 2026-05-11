export function jsonArrayToText(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : ""
}

export function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

export function comparisonTableToText(value: unknown) {
  return value ? JSON.stringify(value, null, 2) : ""
}

export function parseComparisonTable(value: string) {
  if (!value.trim()) return []
  const parsed = JSON.parse(value)
  if (!Array.isArray(parsed)) throw new Error("Comparison table must be an array.")
  return parsed.map((row) => ({
    feature: String(row?.feature ?? ""),
    itemA: String(row?.itemA ?? ""),
    itemB: String(row?.itemB ?? ""),
    winner: String(row?.winner ?? ""),
  }))
}
