import { Trash2Icon } from "lucide-react"

import { deleteHostingAction } from "@/modules/hosting/actions"
import { Button } from "@/components/ui/button"

export function DeleteHostingButton({ id }: { id: string }) {
  return (
    <form action={deleteHostingAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">Xóa</span>
      </Button>
    </form>
  )
}
