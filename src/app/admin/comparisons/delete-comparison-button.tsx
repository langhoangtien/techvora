import { IconTrash as Trash2Icon } from "@tabler/icons-react"

import { deleteComparisonAction } from "@/modules/comparisons/actions"
import { Button } from "@/components/ui/button"

export function DeleteComparisonButton({ id }: { id: string }) {
  return (
    <form action={deleteComparisonAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}
