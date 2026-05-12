import { IconTrash as Trash2Icon } from "@tabler/icons-react"

import { deleteToolAction } from "@/modules/tools/actions"
import { Button } from "@/components/ui/button"

export function DeleteToolButton({ id }: { id: string }) {
  return (
    <form action={deleteToolAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}
