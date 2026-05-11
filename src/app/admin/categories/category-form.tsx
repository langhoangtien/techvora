"use client"

import { useActionState } from "react"
import Link from "next/link"
import type { Category } from "@prisma/client"

import {
  saveCategoryAction,
  type CategoryFormState,
} from "@/modules/categories/actions"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: CategoryFormState = {
  ok: false,
}

type CategoryOption = Pick<Category, "id" | "name" | "parentId">

export function CategoryForm({
  category,
  categories,
}: {
  category?: Category | null
  categories: CategoryOption[]
}) {
  const [state, formAction] = useActionState(saveCategoryAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Sửa danh mục" : "Tạo danh mục"}</CardTitle>
        <CardDescription>
          Quản lý phân cấp danh mục cho nội dung, công cụ và các trang public.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={category?.id ?? ""} />
          {state.message ? (
            <div className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
              {state.message}
            </div>
          ) : null}
          <FieldGroup>
            <SlugFields
              nameLabel="Tên danh mục"
              name={category?.name}
              slug={category?.slug}
              nameError={state.errors?.name}
              slugError={state.errors?.slug}
            />
            <Field>
              <FieldLabel htmlFor="description">Mô tả</FieldLabel>
              <textarea
                id="description"
                name="description"
                defaultValue={category?.description ?? ""}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field data-invalid={Boolean(state.errors?.parentId)}>
                <FieldLabel htmlFor="parentId">Danh mục cha</FieldLabel>
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue={category?.parentId ?? ""}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Không có</option>
                  {categories
                    .filter((item) => item.id !== category?.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
                {state.errors?.parentId ? (
                  <FieldError>{state.errors.parentId}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(state.errors?.order)}>
                <FieldLabel htmlFor="order">Thứ tự</FieldLabel>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={category?.order ?? 0}
                  aria-invalid={Boolean(state.errors?.order)}
                />
                {state.errors?.order ? (
                  <FieldError>{state.errors.order}</FieldError>
                ) : null}
              </Field>
              <Field orientation="horizontal" className="items-center rounded-lg border p-3">
                <Input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  defaultChecked={category?.isFeatured ?? false}
                  className="size-4"
                />
                <FieldLabel htmlFor="isFeatured">Nổi bật</FieldLabel>
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              {category ? (
                <Button asChild variant="outline">
                  <Link href="/admin/categories">Hủy sửa</Link>
                </Button>
              ) : null}
              <SubmitButton>{category ? "Lưu danh mục" : "Tạo danh mục"}</SubmitButton>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
