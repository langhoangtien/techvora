"use client"

import { useActionState } from "react"
import Link from "next/link"
import type { Tag } from "@prisma/client"

import { saveTagAction, type TagFormState } from "@/modules/tags/actions"
import { SlugFields } from "@/components/admin/slug-fields"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const initialState: TagFormState = {
  ok: false,
}

export function TagForm({ tag }: { tag?: Tag | null }) {
  const [state, formAction] = useActionState(saveTagAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tag ? "Sửa thẻ" : "Tạo thẻ"}</CardTitle>
        <CardDescription>
          Thẻ dùng để nhóm bài viết theo chủ đề nhỏ hơn danh mục.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={tag?.id ?? ""} />
          {state.message ? (
            <div className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
              {state.message}
            </div>
          ) : null}
          <FieldGroup>
            <SlugFields
              nameLabel="Tên thẻ"
              name={tag?.name}
              slug={tag?.slug}
              nameError={state.errors?.name}
              slugError={state.errors?.slug}
            />
            <Field>
              <FieldLabel htmlFor="description">Mô tả</FieldLabel>
              <textarea
                id="description"
                name="description"
                defaultValue={tag?.description ?? ""}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <div className="flex justify-end gap-2">
              {tag ? (
                <Button asChild variant="outline">
                  <Link href="/admin/tags">Hủy sửa</Link>
                </Button>
              ) : null}
              <SubmitButton>{tag ? "Lưu thẻ" : "Tạo thẻ"}</SubmitButton>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
