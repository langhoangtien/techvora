"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
}

function decodeBase64(value: string) {
  return decodeURIComponent(escape(atob(value)))
}

export function Base64EncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [input, setInput] = useState("Tekvora tools")

  const result = useMemo(() => {
    try {
      return {
        ok: true,
        value: mode === "encode" ? encodeBase64(input) : decodeBase64(input),
      }
    } catch {
      return { ok: false, value: "Ungültige Base64-Eingabe." }
    }
  }, [input, mode])

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border bg-muted/30 p-1">
        {(["encode", "decode"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              mode === item ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            {item === "encode" ? "Kodieren" : "Dekodieren"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-56 w-full resize-y rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-foreground/30"
          spellCheck={false}
        />
        <div className="space-y-3">
          <textarea
            readOnly
            value={result.value}
            className="min-h-56 w-full resize-y rounded-lg border bg-muted/30 p-3 font-mono text-sm outline-none"
            spellCheck={false}
          />
          <Button
            type="button"
            variant="outline"
            disabled={!result.ok}
            onClick={() => navigator.clipboard.writeText(result.value)}
          >
            Ausgabe kopieren
          </Button>
        </div>
      </div>
    </div>
  )
}
