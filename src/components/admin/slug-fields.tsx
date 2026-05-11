"use client"

import { useState } from "react"

import { slugify } from "@/lib/slugify"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SlugFields({
  nameLabel = "Tên",
  name,
  slug,
  nameError,
  slugError,
}: {
  nameLabel?: string
  name?: string | null
  slug?: string | null
  nameError?: string
  slugError?: string
}) {
  const [nameValue, setNameValue] = useState(name ?? "")
  const [slugValue, setSlugValue] = useState(slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(slug))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field data-invalid={Boolean(nameError)}>
        <FieldLabel htmlFor="name" required>{nameLabel}</FieldLabel>
        <Input
          id="name"
          name="name"
          value={nameValue}
          onChange={(event) => {
            const nextName = event.target.value
            setNameValue(nextName)

            if (!slugTouched) {
              setSlugValue(slugify(nextName))
            }
          }}
          aria-invalid={Boolean(nameError)}
          required
        />
        {nameError ? <FieldError>{nameError}</FieldError> : null}
      </Field>
      <Field data-invalid={Boolean(slugError)}>
        <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
        <Input
          id="slug"
          name="slug"
          value={slugValue}
          onChange={(event) => {
            setSlugTouched(true)
            setSlugValue(slugify(event.target.value))
          }}
          aria-invalid={Boolean(slugError)}
          required
        />
        {slugError ? <FieldError>{slugError}</FieldError> : null}
      </Field>
    </div>
  )
}
