"use client"

import { IconTrash as Trash2Icon } from "@tabler/icons-react"

import { deleteRedirectAction } from "@/modules/redirects/actions"
import { Button } from "@/components/ui/button"

export function DeleteRedirectButton({ id }: { id: string }) {
  return (
    <form
      action={deleteRedirectAction}
      onSubmit={(event) => {
        if (!window.confirm("Bạn có chắc muốn xóa redirect này?")) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}
