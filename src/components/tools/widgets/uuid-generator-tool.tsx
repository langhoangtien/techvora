"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

function createIds(count: number) {
  return Array.from({ length: count }, () => crypto.randomUUID())
}

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState(() => createIds(5))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm font-medium">
          Quantity
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Math.min(Math.max(Number(event.target.value), 1), 50))}
            className="h-9 w-28 rounded-lg border bg-background px-3 text-sm"
          />
        </label>
        <Button type="button" onClick={() => setIds(createIds(count))}>
          Generate
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigator.clipboard.writeText(ids.join("\n"))}
        >
          Copy all
        </Button>
      </div>
      <div className="rounded-lg border bg-muted/20 p-3">
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7">
          {ids.join("\n")}
        </pre>
      </div>
    </div>
  )
}
