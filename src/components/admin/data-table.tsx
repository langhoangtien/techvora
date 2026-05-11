import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/layout/empty-state"

type Column<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  emptyTitle = "Chưa có dữ liệu",
  className,
}: {
  columns: Column<T>[]
  data: T[]
  emptyTitle?: string
  className?: string
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
