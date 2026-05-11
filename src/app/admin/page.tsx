import { ActivityIcon, FileTextIcon, FolderTreeIcon, LinkIcon } from "lucide-react"

import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/layout/empty-state"
import { SearchBox } from "@/components/layout/search-box"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Nội dung", value: "0", icon: <FileTextIcon /> },
  { label: "Danh mục", value: "0", icon: <FolderTreeIcon /> },
  { label: "Redirect", value: "0", icon: <LinkIcon /> },
  { label: "Tác vụ chờ", value: "0", icon: <ActivityIcon /> },
]

const readinessRows = [
  { area: "Schema nội dung", status: "PUBLISHED", note: "Đã định nghĩa" },
  { area: "SEO metadata", status: "PUBLISHED", note: "Sẵn sàng mở rộng" },
  { area: "CRUD quản trị", status: "DRAFT", note: "Chưa triển khai ở bước này" },
]

export default function AdminPage() {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nền tảng quản trị nội dung Tekvora cho bài viết, công cụ, SaaS,
            hosting và SEO.
          </p>
        </div>
        <div className="flex gap-2">
          <SearchBox placeholder="Tìm trong admin" className="hidden w-64 md:block" />
          <Button variant="outline">Kiểm tra site</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardDescription>{stat.label}</CardDescription>
              <span className="text-muted-foreground [&_svg]:size-4">
                {stat.icon}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái nền tảng</CardTitle>
            <CardDescription>
              Các phần đã sẵn sàng trong bước kiến trúc đầu tiên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={readinessRows}
              columns={[
                {
                  key: "area",
                  header: "Khu vực",
                  cell: (row) => <span className="font-medium">{row.area}</span>,
                },
                {
                  key: "status",
                  header: "Trạng thái",
                  cell: (row) => <StatusBadge status={row.status} />,
                },
                {
                  key: "note",
                  header: "Ghi chú",
                  cell: (row) => (
                    <span className="text-muted-foreground">{row.note}</span>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hàng đợi biên tập</CardTitle>
            <CardDescription>
              CRUD và auth sẽ được triển khai ở milestone sau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Chưa có nội dung"
              description="Dữ liệu thật sẽ xuất hiện sau khi bật các module quản trị."
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
