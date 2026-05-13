"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

const sample = '{"name":"Tekvora","type":"tools","active":true}'

export function JsonFormatterTool() {
  const [input, setInput] = useState(sample)
  const [indent, setIndent] = useState(2)

  const result = useMemo(() => {
    try {
      return {
        ok: true,
        value: JSON.stringify(JSON.parse(input), null, indent),
        message: "Gültiges JSON",
      }
    } catch (error) {
      return {
        ok: false,
        value: "",
        message: error instanceof Error ? error.message : "Ungültiges JSON",
      }
    }
  }, [input, indent])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium" htmlFor="json-input">
            JSON-Eingabe
          </label>
          <select
            value={indent}
            onChange={(event) => setIndent(Number(event.target.value))}
            className="h-8 rounded-lg border bg-background px-2 text-sm"
          >
            <option value={2}>2 Leerzeichen</option>
            <option value={4}>4 Leerzeichen</option>
          </select>
        </div>
        <textarea
          id="json-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-72 w-full resize-y rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-foreground/30"
          spellCheck={false}
        />
        <Button type="button" variant="outline" onClick={() => setInput(sample)}>
          Beispiel zurücksetzen
        </Button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Formatierte Ausgabe</p>
          <span className={result.ok ? "text-xs text-emerald-600" : "text-xs text-destructive"}>
            {result.message}
          </span>
        </div>
        <textarea
          readOnly
          value={result.value}
          className="min-h-72 w-full resize-y rounded-lg border bg-muted/30 p-3 font-mono text-sm outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
