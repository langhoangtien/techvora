import { Trash2Icon } from "lucide-react"

import { deleteServiceAction } from "@/modules/services/actions"
import { Button } from "@/components/ui/button"

export function DeleteServiceButton({ id }: { id: string }) {
  return (
    <form action={deleteServiceAction}>
      <input type="hidden" name="id" value={id} />
      <Button size="icon-sm" variant="destructive" type="submit">
        <Trash2Icon />
        <span className="sr-only">XÃ³a</span>
      </Button>
    </form>
  )
}
