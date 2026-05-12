import { CheckIcon, XIcon } from "lucide-react"

function listItems(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

export function ProsConsList({
  pros,
  cons,
}: {
  pros: unknown
  cons: unknown
}) {
  const proItems = listItems(pros)
  const conItems = listItems(cons)

  if (proItems.length === 0 && conItems.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold tracking-tight">Pros</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {proItems.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold tracking-tight">Cons</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {conItems.map((item) => (
            <li key={item} className="flex gap-2">
              <XIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
