"use client"

import { useActionState, useState } from "react"
import type { HostingProvider } from "@prisma/client"

import { saveHostingAction, type HostingFormState } from "@/modules/hosting/actions"
import { jsonArrayToText } from "@/modules/hosting/utils"
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

const initialState: HostingFormState = { ok: false }

const statuses = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "SCHEDULED", label: "Lên lịch" },
  { value: "ARCHIVED", label: "Lưu trữ" },
]

export function HostingForm({ provider }: { provider?: HostingProvider | null }) {
  const [state, formAction] = useActionState(saveHostingAction, initialState)
  const [name, setName] = useState(provider?.name ?? "")
  const [slug, setSlug] = useState(provider?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(provider?.slug))

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={provider?.id ?? ""} />
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
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Tên nhà cung cấp, mô tả và các URL chính.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.name)}>
                <FieldLabel htmlFor="name">Tên nhà cung cấp</FieldLabel>
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
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
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
                  Tạo lại slug
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="shortDescription">Mô tả ngắn</FieldLabel>
                <textarea id="shortDescription" name="shortDescription" defaultValue={provider?.shortDescription ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Mô tả chi tiết</FieldLabel>
                <textarea id="description" name="description" defaultValue={provider?.description ?? ""} rows={5} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              {[
                ["logoUrl", "Logo URL"],
                ["websiteUrl", "Website URL"],
                ["affiliateUrl", "Affiliate URL"],
              ].map(([key, label]) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(provider?.[key as keyof HostingProvider] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review details</CardTitle>
            <CardDescription>Mỗi dòng là một mục cho các trường dạng danh sách.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {[
                ["pros", "Ưu điểm"],
                ["cons", "Nhược điểm"],
                ["features", "Tính năng"],
                ["bestFor", "Phù hợp nhất cho"],
                ["dataCenterLocations", "Vị trí data center"],
              ].map(([key, label]) => (
                <Field key={key}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <textarea
                    id={key}
                    name={key}
                    defaultValue={jsonArrayToText(provider?.[key as keyof HostingProvider])}
                    rows={4}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              ))}
              <Field>
                <FieldLabel htmlFor="performanceNotes">Ghi chú hiệu năng</FieldLabel>
                <textarea id="performanceNotes" name="performanceNotes" defaultValue={provider?.performanceNotes ?? ""} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              <Field>
                <FieldLabel htmlFor="supportNotes">Ghi chú hỗ trợ</FieldLabel>
                <textarea id="supportNotes" name="supportNotes" defaultValue={provider?.supportNotes ?? ""} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Metadata dùng cho trang hosting public.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
                <Input id="seoTitle" name="seoTitle" defaultValue={provider?.seoTitle ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
                <textarea id="seoDescription" name="seoDescription" defaultValue={provider?.seoDescription ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              {[
                ["canonicalUrl", "Canonical URL"],
                ["ogImageUrl", "OG image URL"],
              ].map(([key, label]) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(provider?.[key as keyof HostingProvider] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="noindex" defaultChecked={provider?.noindex ?? false} />
                Không index trang này
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Giá và rating</CardTitle>
            <CardDescription>Thông tin tóm tắt hiển thị trên card public.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.pricingFrom)}>
                <FieldLabel htmlFor="pricingFrom">Giá từ</FieldLabel>
                <Input id="pricingFrom" name="pricingFrom" type="number" step="0.01" defaultValue={provider?.pricingFrom?.toString() ?? ""} />
                {state.errors?.pricingFrom ? <FieldError>{state.errors.pricingFrom}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Tiền tệ</FieldLabel>
                <Input id="currency" name="currency" defaultValue={provider?.currency ?? "USD"} />
              </Field>
              <Field data-invalid={Boolean(state.errors?.rating)}>
                <FieldLabel htmlFor="rating">Rating</FieldLabel>
                <Input id="rating" name="rating" type="number" min="0" max="5" step="0.1" defaultValue={provider?.rating?.toString() ?? ""} />
                {state.errors?.rating ? <FieldError>{state.errors.rating}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Xuất bản</CardTitle>
            <CardDescription>Trạng thái và thứ tự hiển thị.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.status)}>
                <FieldLabel htmlFor="status">Trạng thái</FieldLabel>
                <select id="status" name="status" defaultValue={provider?.status ?? "DRAFT"} className="h-9 rounded-lg border bg-background px-3 text-sm">
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                {state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="order">Thứ tự</FieldLabel>
                <Input id="order" name="order" type="number" defaultValue={provider?.order ?? 0} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={provider?.isFeatured ?? false} />
                Nổi bật
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/admin/hosting">Hủy</a>
          </Button>
          <SubmitButton>Lưu review</SubmitButton>
        </div>
      </aside>
    </form>
  )
}
