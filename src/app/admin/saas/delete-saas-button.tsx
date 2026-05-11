import { Trash2Icon } from "lucide-react"

import { deleteSaaSAction } from "@/modules/saas/actions"
import { Button } from "@/components/ui/button"

export function DeleteSaaSButton({ id }: { id: string }) {
  return (
    <form action={deleteSaaSAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}
