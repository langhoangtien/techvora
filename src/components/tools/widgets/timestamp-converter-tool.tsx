"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

export function TimestampConverterTool() {
  const [timestamp, setTimestamp] = useState(() => Math.floor(Date.now() / 1000).toString())
  const [dateText, setDateText] = useState(() => new Date().toISOString())

  const parsedTimestamp = useMemo(() => {
    const numeric = Number(timestamp)
    if (!Number.isFinite(numeric)) return null
    const ms = timestamp.length <= 10 ? numeric * 1000 : numeric
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date
  }, [timestamp])

  const parsedDate = useMemo(() => {
    const date = new Date(dateText)
    return Number.isNaN(date.getTime()) ? null : date
  }, [dateText])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="text-sm font-medium" htmlFor="timestamp-input">
          Unix-Zeitstempel
        </label>
        <input
          id="timestamp-input"
          value={timestamp}
          onChange={(event) => setTimestamp(event.target.value)}
          className="h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm"
        />
        <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-7">
          <p>UTC: {parsedTimestamp ? parsedTimestamp.toISOString() : "Ungültiger Zeitstempel"}</p>
          <p>
            Lokal:{" "}
            {parsedTimestamp ? parsedTimestamp.toLocaleString("de-DE", { timeZoneName: "short" }) : "-"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())}
        >
          Aktuelle Zeit verwenden
        </Button>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium" htmlFor="date-input">
          Datum oder ISO-Zeichenfolge
        </label>
        <input
          id="date-input"
          value={dateText}
          onChange={(event) => setDateText(event.target.value)}
          className="h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm"
        />
        <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-7">
          <p>Sekunden: {parsedDate ? Math.floor(parsedDate.getTime() / 1000) : "Ungültiges Datum"}</p>
          <p>Millisekunden: {parsedDate ? parsedDate.getTime() : "-"}</p>
        </div>
      </div>
    </div>
  )
}
