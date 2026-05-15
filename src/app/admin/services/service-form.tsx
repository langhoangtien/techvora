"use client"

import { useActionState, useState } from "react"
import type { ServiceProduct as Service } from "@/generated/prisma/client"

import { saveServiceAction, type ServiceFormState } from "@/modules/services/actions"
import { jsonArrayToText } from "@/modules/services/utils"
import { slugify } from "@/lib/slugify"
import { cn } from "@/lib/utils"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: ServiceFormState = { ok: false }

const statuses = [
  { value: "DRAFT", label: "NhÃ¡p" },
  { value: "PUBLISHED", label: "Xuáº¥t báº£n" },
  { value: "SCHEDULED", label: "LÃªn lá»‹ch" },
  { value: "ARCHIVED", label: "LÆ°u trá»¯" },
]

export function ServiceForm({ product }: { product?: Service | null }) {
  const [state, formAction] = useActionState(saveServiceAction, initialState)
  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug))

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <div className="space-y-6">
        {state.message ? (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              state.ok
                ? "bg-emerald-50 text-emerald-700"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {state.message}
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>ThÃ´ng tin cÆ¡ báº£n</CardTitle>
            <CardDescription>TÃªn sáº£n pháº©m, mÃ´ táº£, danh má»¥c vÃ  cÃ¡c URL chÃ­nh.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.name)}>
                <FieldLabel htmlFor="name" required>TÃªn sáº£n pháº©m</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    const next = event.target.value
                    setName(next)
                    if (!slugTouched) setSlug(slugify(next))
                  }}
                  required
                />
                {state.errors?.name ? <FieldError>{state.errors.name}</FieldError> : null}
              </Field>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Field data-invalid={Boolean(state.errors?.slug)}>
                  <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setSlug(slugify(event.target.value))
                    }}
                    required
                  />
                  {state.errors?.slug ? <FieldError>{state.errors.slug}</FieldError> : null}
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={() => {
                    setSlug(slugify(name))
                    setSlugTouched(true)
                  }}
                >
                  Táº¡o láº¡i slug
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="category">Danh má»¥c</FieldLabel>
                <Input id="category" name="category" defaultValue={product?.category ?? ""} placeholder="CRM, Analytics, AI, Project management..." />
              </Field>
              <Field>
                <FieldLabel htmlFor="shortDescription">MÃ´ táº£ ngáº¯n</FieldLabel>
                <textarea id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">MÃ´ táº£ chi tiáº¿t</FieldLabel>
                <textarea id="description" name="description" defaultValue={product?.description ?? ""} rows={5} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              {[
                ["logoUrl", "Logo URL"],
                ["websiteUrl", "Website URL"],
                ["affiliateUrl", "Affiliate URL"],
              ].map(([key, label]) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(product?.[key as keyof Service] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>Má»—i dÃ²ng lÃ  má»™t má»¥c cho cÃ¡c trÆ°á»ng dáº¡ng danh sÃ¡ch.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {[
                ["features", "TÃ­nh nÄƒng"],
                ["pros", "Æ¯u Ä‘iá»ƒm"],
                ["cons", "NhÆ°á»£c Ä‘iá»ƒm"],
                ["bestFor", "PhÃ¹ há»£p nháº¥t cho"],
                ["alternatives", "Sáº£n pháº©m thay tháº¿"],
              ].map(([key, label]) => (
                <Field key={key}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <textarea
                    id={key}
                    name={key}
                    defaultValue={jsonArrayToText(product?.[key as keyof Service])}
                    rows={4}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Metadata dÃ¹ng cho trang Services public.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
                <Input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
                <textarea id="seoDescription" name="seoDescription" defaultValue={product?.seoDescription ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              {[
                ["canonicalUrl", "Canonical URL"],
                ["ogImageUrl", "OG image URL"],
              ].map(([key, label]) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(product?.[key as keyof Service] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="noindex" defaultChecked={product?.noindex ?? false} />
                KhÃ´ng index trang nÃ y
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GiÃ¡ vÃ  rating</CardTitle>
            <CardDescription>MÃ´ hÃ¬nh giÃ¡ vÃ  Ä‘iá»ƒm Ä‘Ã¡nh giÃ¡.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pricingModel">Pricing model</FieldLabel>
                <Input id="pricingModel" name="pricingModel" defaultValue={product?.pricingModel ?? ""} placeholder="Free trial, per seat, usage-based..." />
              </Field>
              <Field data-invalid={Boolean(state.errors?.pricingFrom)}>
                <FieldLabel htmlFor="pricingFrom">GiÃ¡ tá»«</FieldLabel>
                <Input id="pricingFrom" name="pricingFrom" type="number" step="0.01" defaultValue={product?.pricingFrom?.toString() ?? ""} />
                {state.errors?.pricingFrom ? <FieldError>{state.errors.pricingFrom}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Tiá»n tá»‡</FieldLabel>
                <Input id="currency" name="currency" defaultValue={product?.currency ?? "USD"} />
              </Field>
              <Field data-invalid={Boolean(state.errors?.rating)}>
                <FieldLabel htmlFor="rating">Rating</FieldLabel>
                <Input id="rating" name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating?.toString() ?? ""} />
                {state.errors?.rating ? <FieldError>{state.errors.rating}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Xuáº¥t báº£n</CardTitle>
            <CardDescription>Tráº¡ng thÃ¡i vÃ  thá»© tá»± hiá»ƒn thá»‹.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.status)}>
                <FieldLabel htmlFor="status" required>Tráº¡ng thÃ¡i</FieldLabel>
                <select id="status" name="status" defaultValue={product?.status ?? "DRAFT"} className="h-9 rounded-lg border bg-background px-3 text-sm">
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                {state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="order">Thá»© tá»±</FieldLabel>
                <Input id="order" name="order" type="number" defaultValue={product?.order ?? 0} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
                Ná»•i báº­t
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/admin/services">Há»§y</a>
          </Button>
          <SubmitButton>LÆ°u Services</SubmitButton>
        </div>
      </aside>
    </form>
  )
}
