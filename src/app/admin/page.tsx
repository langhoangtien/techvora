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
  { label: "Ná»™i dung", value: "0", icon: <FileTextIcon /> },
  { label: "Danh má»¥c", value: "0", icon: <FolderTreeIcon /> },
  { label: "Redirect", value: "0", icon: <LinkIcon /> },
  { label: "TÃ¡c vá»¥ chá»", value: "0", icon: <ActivityIcon /> },
]

const readinessRows = [
  { area: "Schema ná»™i dung", status: "PUBLISHED", note: "ÄÃ£ Ä‘á»‹nh nghÄ©a" },
  { area: "SEO metadata", status: "PUBLISHED", note: "Sáºµn sÃ ng má»Ÿ rá»™ng" },
  { area: "CRUD quáº£n trá»‹", status: "DRAFT", note: "ChÆ°a triá»ƒn khai á»Ÿ bÆ°á»›c nÃ y" },
]

export default function AdminPage() {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tá»•ng quan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ná»n táº£ng quáº£n trá»‹ ná»™i dung Tekvora cho bÃ i viáº¿t, cÃ´ng cá»¥, Services
            vÃ  SEO.
          </p>
        </div>
        <div className="flex gap-2">
          <SearchBox placeholder="TÃ¬m trong admin" className="hidden w-64 md:block" />
          <Button variant="outline">Kiá»ƒm tra site</Button>
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
            <CardTitle>Tráº¡ng thÃ¡i ná»n táº£ng</CardTitle>
            <CardDescription>
              CÃ¡c pháº§n Ä‘Ã£ sáºµn sÃ ng trong bÆ°á»›c kiáº¿n trÃºc Ä‘áº§u tiÃªn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={readinessRows}
              columns={[
                {
                  key: "area",
                  header: "Khu vá»±c",
                  cell: (row) => <span className="font-medium">{row.area}</span>,
                },
                {
                  key: "status",
                  header: "Tráº¡ng thÃ¡i",
                  cell: (row) => <StatusBadge status={row.status} />,
                },
                {
                  key: "note",
                  header: "Ghi chÃº",
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
            <CardTitle>HÃ ng Ä‘á»£i biÃªn táº­p</CardTitle>
            <CardDescription>
              CRUD vÃ  auth sáº½ Ä‘Æ°á»£c triá»ƒn khai á»Ÿ milestone sau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="ChÆ°a cÃ³ ná»™i dung"
              description="Dá»¯ liá»‡u tháº­t sáº½ xuáº¥t hiá»‡n sau khi báº­t cÃ¡c module quáº£n trá»‹."
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
