import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchFilter({
  defaultValue,
  placeholder = "Tìm kiếm",
}: {
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <form className="flex w-full gap-2 md:max-w-sm">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="outline">
        Lọc
      </Button>
    </form>
  )
}
