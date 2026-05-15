"use client"

import type { Media } from "@/generated/prisma/client"

export type MediaPickerProps = {
  media: Media[]
  onSelect?: (media: Media) => void
}

export function MediaPicker({ media, onSelect }: MediaPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {media.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item)}
          className="overflow-hidden rounded-lg border bg-card text-left transition-colors hover:border-foreground/20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl ?? item.url}
            alt={item.altText ?? item.filename}
            className="aspect-square w-full object-cover"
          />
          <span className="block truncate px-2 py-1 text-xs text-muted-foreground">
            {item.filename}
          </span>
        </button>
      ))}
    </div>
  )
}

