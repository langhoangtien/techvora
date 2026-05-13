type ComparisonRow = {
  feature?: string
  itemA?: string
  itemB?: string
  winner?: string
}

function rows(value: unknown): ComparisonRow[] {
  if (!Array.isArray(value)) return []
  return value.filter((row): row is ComparisonRow => typeof row === "object" && row !== null)
}

export function ComparisonTable({ value }: { value: unknown }) {
  const tableRows = rows(value)

  if (tableRows.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Kriterium</th>
              <th className="px-4 py-3">Option A</th>
              <th className="px-4 py-3">Option B</th>
              <th className="px-4 py-3">Gewinner</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tableRows.map((row, index) => (
              <tr key={`${row.feature}-${index}`}>
                <td className="px-4 py-3 font-medium">{row.feature}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.itemA}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.itemB}</td>
                <td className="px-4 py-3">{row.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
