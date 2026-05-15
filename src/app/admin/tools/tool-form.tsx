"use client"

import { useActionState, useState } from "react"
import type { Category, Tool } from "@/generated/prisma/client"

import { saveToolAction, type ToolFormState } from "@/modules/tools/actions"
import { toolComponentOptions } from "@/modules/tools/definitions"
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

type ToolFormProps = {
  tool?: Tool | null
  categories: Pick<Category, "id" | "name" | "parentId">[]
}

const initialState: ToolFormState = { ok: false }

const statuses = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "SCHEDULED", label: "Lên lịch" },
  { value: "ARCHIVED", label: "Lưu trữ" },
]

export function ToolForm({ tool, categories }: ToolFormProps) {
  const [state, formAction] = useActionState(saveToolAction, initialState)
  const [name, setName] = useState(tool?.name ?? "")
  const [slug, setSlug] = useState(tool?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(tool?.slug))

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={tool?.id ?? ""} />
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
            <CardTitle>Thông tin công cụ</CardTitle>
            <CardDescription>Tên, mô tả ngắn và nội dung hiển thị trên trang public.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.name)}>
                <FieldLabel htmlFor="name" required>Tên công cụ</FieldLabel>
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
                <FieldLabel htmlFor="shortDescription">Mô tả ngắn</FieldLabel>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={tool?.shortDescription ?? tool?.tagline ?? ""}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Mô tả chi tiết</FieldLabel>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={tool?.description ?? ""}
                  rows={5}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="content">Nội dung bên dưới công cụ</FieldLabel>
                <textarea
                  id="content"
                  name="content"
                  defaultValue={tool?.content ?? ""}
                  rows={10}
                  className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm"
                  placeholder="<h2>How to use this tool</h2><p>...</p>"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Metadata dùng cho trang công cụ public.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
                <Input id="seoTitle" name="seoTitle" defaultValue={tool?.seoTitle ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  defaultValue={tool?.seoDesc ?? ""}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field data-invalid={Boolean(state.errors?.canonicalUrl)}>
                <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
                <Input id="canonicalUrl" name="canonicalUrl" defaultValue={tool?.canonical ?? ""} />
                {state.errors?.canonicalUrl ? (
                  <FieldError>{state.errors.canonicalUrl}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(state.errors?.ogImageUrl)}>
                <FieldLabel htmlFor="ogImageUrl">OG image URL</FieldLabel>
                <Input id="ogImageUrl" name="ogImageUrl" defaultValue={tool?.ogImageUrl ?? ""} />
                {state.errors?.ogImageUrl ? <FieldError>{state.errors.ogImageUrl}</FieldError> : null}
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="noindex" defaultChecked={tool?.noIndex ?? false} />
                Không index trang này
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Xuất bản</CardTitle>
            <CardDescription>Trạng thái, danh mục và component tương tác.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.status)}>
                <FieldLabel htmlFor="status" required>Trạng thái</FieldLabel>
                <select
                  id="status"
                  name="status"
                  defaultValue={tool?.status ?? "DRAFT"}
                  className="h-9 rounded-lg border bg-background px-3 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="categoryId">Danh mục</FieldLabel>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={tool?.categoryId ?? ""}
                  className="h-9 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Không danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field data-invalid={Boolean(state.errors?.componentKey)}>
                <FieldLabel htmlFor="componentKey">Tool component</FieldLabel>
                <select
                  id="componentKey"
                  name="componentKey"
                  defaultValue={tool?.componentKey ?? ""}
                  className="h-9 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Không có widget</option>
                  {toolComponentOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {state.errors?.componentKey ? <FieldError>{state.errors.componentKey}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="order">Thứ tự</FieldLabel>
                <Input id="order" name="order" type="number" defaultValue={tool?.order ?? 0} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={tool?.isFeatured ?? false} />
                Nổi bật
              </label>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/admin/tools">Hủy</a>
          </Button>
          <SubmitButton>Lưu công cụ</SubmitButton>
        </div>
      </aside>
    </form>
  )
}
