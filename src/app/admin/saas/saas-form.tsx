"use client"

import { useActionState, useState } from "react"
import type { SaaSProduct } from "@prisma/client"

import { saveSaaSAction, type SaaSFormState } from "@/modules/saas/actions"
import { jsonArrayToText } from "@/modules/saas/utils"
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

const initialState: SaaSFormState = { ok: false }

const statuses = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "SCHEDULED", label: "Lên lịch" },
  { value: "ARCHIVED", label: "Lưu trữ" },
]

export function SaaSForm({ product }: { product?: SaaSProduct | null }) {
  const [state, formAction] = useActionState(saveSaaSAction, initialState)
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
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Tên sản phẩm, mô tả, danh mục và các URL chính.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.name)}>
                <FieldLabel htmlFor="name" required>Tên sản phẩm</FieldLabel>
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
                  Tạo lại slug
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="category">Danh mục</FieldLabel>
                <Input id="category" name="category" defaultValue={product?.category ?? ""} placeholder="CRM, Analytics, AI, Project management..." />
              </Field>
              <Field>
                <FieldLabel htmlFor="shortDescription">Mô tả ngắn</FieldLabel>
                <textarea id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Mô tả chi tiết</FieldLabel>
                <textarea id="description" name="description" defaultValue={product?.description ?? ""} rows={5} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </Field>
              {[
                ["logoUrl", "Logo URL"],
                ["websiteUrl", "Website URL"],
                ["affiliateUrl", "Affiliate URL"],
              ].map(([key, label]) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(product?.[key as keyof SaaSProduct] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>Mỗi dòng là một mục cho các trường dạng danh sách.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {[
                ["features", "Tính năng"],
                ["pros", "Ưu điểm"],
                ["cons", "Nhược điểm"],
                ["bestFor", "Phù hợp nhất cho"],
                ["alternatives", "Sản phẩm thay thế"],
              ].map(([key, label]) => (
                <Field key={key}>
                  <FieldLabel htmlFor={key}>{label}</FieldLabel>
                  <textarea
                    id={key}
                    name={key}
                    defaultValue={jsonArrayToText(product?.[key as keyof SaaSProduct])}
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
            <CardDescription>Metadata dùng cho trang SaaS public.</CardDescription>
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
                  <Input id={key} name={key} defaultValue={String(product?.[key as keyof SaaSProduct] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="noindex" defaultChecked={product?.noindex ?? false} />
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
            <CardDescription>Mô hình giá và điểm đánh giá.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pricingModel">Pricing model</FieldLabel>
                <Input id="pricingModel" name="pricingModel" defaultValue={product?.pricingModel ?? ""} placeholder="Free trial, per seat, usage-based..." />
              </Field>
              <Field data-invalid={Boolean(state.errors?.pricingFrom)}>
                <FieldLabel htmlFor="pricingFrom">Giá từ</FieldLabel>
                <Input id="pricingFrom" name="pricingFrom" type="number" step="0.01" defaultValue={product?.pricingFrom?.toString() ?? ""} />
                {state.errors?.pricingFrom ? <FieldError>{state.errors.pricingFrom}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Tiền tệ</FieldLabel>
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
            <CardTitle>Xuất bản</CardTitle>
            <CardDescription>Trạng thái và thứ tự hiển thị.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.status)}>
                <FieldLabel htmlFor="status" required>Trạng thái</FieldLabel>
                <select id="status" name="status" defaultValue={product?.status ?? "DRAFT"} className="h-9 rounded-lg border bg-background px-3 text-sm">
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                {state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="order">Thứ tự</FieldLabel>
                <Input id="order" name="order" type="number" defaultValue={product?.order ?? 0} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
                Nổi bật
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/admin/saas">Hủy</a>
          </Button>
          <SubmitButton>Lưu SaaS</SubmitButton>
        </div>
      </aside>
    </form>
  )
}
