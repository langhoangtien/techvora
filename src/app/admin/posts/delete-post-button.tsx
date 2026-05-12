import { IconTrash as Trash2Icon } from "@tabler/icons-react"

import { deletePostAction } from "@/modules/posts/actions"
import { Button } from "@/components/ui/button"

export function DeletePostButton({ id }: { id: string }) {
  return (
    <form action={deletePostAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}

