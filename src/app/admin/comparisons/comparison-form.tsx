"use client"

import { useActionState, useState } from "react"
import type { Comparison } from "@/generated/prisma/client"

import { saveComparisonAction, type ComparisonFormState } from "@/modules/comparisons/actions"
import { comparisonTableToText, jsonArrayToText } from "@/modules/comparisons/utils"
import { slugify } from "@/lib/slugify"
import { cn } from "@/lib/utils"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: ComparisonFormState = { ok: false }
const statuses = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "SCHEDULED", label: "Lên lịch" },
  { value: "ARCHIVED", label: "Lưu trữ" },
]

function Textarea({ id, defaultValue, rows = 4, mono = false }: { id: string; defaultValue?: string; rows?: number; mono?: boolean }) {
  return <textarea id={id} name={id} defaultValue={defaultValue ?? ""} rows={rows} className={cn("w-full rounded-lg border bg-background px-3 py-2 text-sm", mono && "font-mono")} />
}

export function ComparisonForm({ comparison }: { comparison?: Comparison | null }) {
  const [state, formAction] = useActionState(saveComparisonAction, initialState)
  const [title, setTitle] = useState(comparison?.title ?? "")
  const [slug, setSlug] = useState(comparison?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(comparison?.slug))

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={comparison?.id ?? ""} />
      <div className="space-y-6">
        {state.message ? <div className={cn("rounded-lg border px-4 py-3 text-sm", state.ok ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive")}>{state.message}</div> : null}
        <Card>
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle><CardDescription>Tiêu đề, summary, verdict và winner.</CardDescription></CardHeader>
          <CardContent><FieldGroup>
            <Field data-invalid={Boolean(state.errors?.title)}>
              <FieldLabel htmlFor="title" required>Tiêu đề</FieldLabel>
              <Input id="title" name="title" value={title} onChange={(event) => { const next = event.target.value; setTitle(next); if (!slugTouched) setSlug(slugify(next)) }} required />
              {state.errors?.title ? <FieldError>{state.errors.title}</FieldError> : null}
            </Field>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Field data-invalid={Boolean(state.errors?.slug)}>
                <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
                <Input id="slug" name="slug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)) }} required />
                {state.errors?.slug ? <FieldError>{state.errors.slug}</FieldError> : null}
              </Field>
              <Button type="button" variant="outline" className="self-end" onClick={() => { setSlug(slugify(title)); setSlugTouched(true) }}>Tạo lại slug</Button>
            </div>
            {["excerpt", "summary", "verdict"].map((key) => (
              <Field key={key}><FieldLabel htmlFor={key}>{key}</FieldLabel><Textarea id={key} defaultValue={String(comparison?.[key as keyof Comparison] ?? "")} rows={key === "excerpt" ? 3 : 4} /></Field>
            ))}
            <Field><FieldLabel htmlFor="winner">Winner</FieldLabel><Input id="winner" name="winner" defaultValue={comparison?.winner ?? ""} placeholder="A, B, Tie, or product name" /></Field>
          </FieldGroup></CardContent>
        </Card>
        {(["A", "B"] as const).map((side) => (
          <Card key={side}>
            <CardHeader><CardTitle>Item {side}</CardTitle><CardDescription>Thông tin, CTA và pros/cons của item {side}.</CardDescription></CardHeader>
            <CardContent><FieldGroup>
              <Field data-invalid={Boolean(state.errors?.[`item${side}Name`])}>
                <FieldLabel htmlFor={`item${side}Name`} required>Tên item {side}</FieldLabel>
                <Input id={`item${side}Name`} name={`item${side}Name`} defaultValue={String(comparison?.[`item${side}Name` as keyof Comparison] ?? "")} required />
                {state.errors?.[`item${side}Name`] ? <FieldError>{state.errors[`item${side}Name`]}</FieldError> : null}
              </Field>
              {[`item${side}LogoUrl`, `item${side}Url`, `item${side}AffiliateUrl`].map((key) => (
                <Field key={key} data-invalid={Boolean(state.errors?.[key])}>
                  <FieldLabel htmlFor={key}>{key}</FieldLabel>
                  <Input id={key} name={key} defaultValue={String(comparison?.[key as keyof Comparison] ?? "")} />
                  {state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}
                </Field>
              ))}
              {[`pros${side}`, `cons${side}`, `bestFor${side}`].map((key) => (
                <Field key={key}><FieldLabel htmlFor={key}>{key} - mỗi dòng một mục</FieldLabel><Textarea id={key} defaultValue={jsonArrayToText(comparison?.[key as keyof Comparison])} /></Field>
              ))}
            </FieldGroup></CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader><CardTitle>Comparison details</CardTitle><CardDescription>comparisonTable là JSON array, content là HTML/text chi tiết.</CardDescription></CardHeader>
          <CardContent><FieldGroup>
            <Field data-invalid={Boolean(state.errors?.comparisonTable)}>
              <FieldLabel htmlFor="comparisonTable">Comparison table JSON</FieldLabel>
              <Textarea id="comparisonTable" defaultValue={comparisonTableToText(comparison?.comparisonTable)} rows={10} mono />
              {state.errors?.comparisonTable ? <FieldError>{state.errors.comparisonTable}</FieldError> : null}
            </Field>
            <Field><FieldLabel htmlFor="content">Content</FieldLabel><Textarea id="content" defaultValue={comparison?.content ?? ""} rows={10} /></Field>
          </FieldGroup></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>SEO</CardTitle><CardDescription>Metadata cho trang comparison public.</CardDescription></CardHeader>
          <CardContent><FieldGroup>
            <Field><FieldLabel htmlFor="seoTitle">SEO title</FieldLabel><Input id="seoTitle" name="seoTitle" defaultValue={comparison?.seoTitle ?? ""} /></Field>
            <Field><FieldLabel htmlFor="seoDescription">SEO description</FieldLabel><Textarea id="seoDescription" defaultValue={comparison?.seoDescription ?? ""} rows={3} /></Field>
            {["canonicalUrl", "ogImageUrl"].map((key) => (
              <Field key={key} data-invalid={Boolean(state.errors?.[key])}><FieldLabel htmlFor={key}>{key}</FieldLabel><Input id={key} name={key} defaultValue={String(comparison?.[key as keyof Comparison] ?? "")} />{state.errors?.[key] ? <FieldError>{state.errors[key]}</FieldError> : null}</Field>
            ))}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="noindex" defaultChecked={comparison?.noindex ?? false} />Không index trang này</label>
          </FieldGroup></CardContent>
        </Card>
      </div>
      <aside className="space-y-6">
        <Card><CardHeader><CardTitle>Xuất bản</CardTitle><CardDescription>Trạng thái và thứ tự hiển thị.</CardDescription></CardHeader>
          <CardContent><FieldGroup>
            <Field data-invalid={Boolean(state.errors?.status)}><FieldLabel htmlFor="status" required>Trạng thái</FieldLabel><select id="status" name="status" defaultValue={comparison?.status ?? "DRAFT"} className="h-9 rounded-lg border bg-background px-3 text-sm">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>{state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}</Field>
            <Field><FieldLabel htmlFor="order">Thứ tự</FieldLabel><Input id="order" name="order" type="number" defaultValue={comparison?.order ?? 0} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={comparison?.isFeatured ?? false} />Nổi bật</label>
          </FieldGroup></CardContent>
        </Card>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" asChild><a href="/admin/comparisons">Hủy</a></Button><SubmitButton>Lưu comparison</SubmitButton></div>
      </aside>
    </form>
  )
}
