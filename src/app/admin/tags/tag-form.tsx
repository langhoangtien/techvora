"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import type { Tag } from "@prisma/client"

import { saveTagAction, type TagFormState } from "@/modules/tags/actions"
import { SlugFields } from "@/components/admin/slug-fields"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const initialState: TagFormState = {
  ok: false,
}

export function TagForm({
  tag,
  trigger,
}: {
  tag?: Tag | null
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveTagAction, initialState)
  const [open, setOpen] = useState(Boolean(tag))

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen && tag) {
      const url = new URL(window.location.href)
      url.searchParams.delete("edit")
      router.replace(`${url.pathname}${url.search}`, { scroll: false })
    }
  }
console.log("TRIGGER",trigger);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Sửa thẻ" : "Tạo thẻ"}</DialogTitle>
          <DialogDescription>
            Thẻ dùng để nhóm bài viết theo chủ đề nhỏ hơn danh mục.
          </DialogDescription>
        </DialogHeader>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <SubmitButton>{tag ? "Lưu thẻ" : "Tạo thẻ"}</SubmitButton>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
