import Link from "next/link"
import {
  ArrowUpRightIcon,
  BarChart3Icon,
  FileTextIcon,
  GitCompareIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react"

import { getAdminDashboard } from "@/modules/admin/dashboard"
import { requireAdmin } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(date)
}

function StatusPill({ status }: { status: string }) {
  const label =
    {
      DRAFT: "Nháp",
      PUBLISHED: "Đã xuất bản",
      SCHEDULED: "Đã lên lịch",
      ARCHIVED: "Lưu trữ",
    }[status] ?? status

  return (
    <span className="inline-flex h-6 items-center rounded-md border bg-muted px-2 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card className="transition-colors hover:border-primary/30 hover:bg-muted/20">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardDescription>{label}</CardDescription>
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-normal">{value.toLocaleString("vi-VN")}</p>
      </CardContent>
    </Card>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <CardHeader>
      <CardTitle className="text-base tracking-normal">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}

type RecentItem = {
  id: string
  title: string
  slug: string
  status: string
  updatedAt: Date
  author: { name: string } | null
}

function RecentContentList({
  items,
  emptyLabel,
  getEditHref,
  getViewHref,
}: {
  items: RecentItem[]
  emptyLabel: string
  getEditHref: (item: RecentItem) => string
  getViewHref: (item: RecentItem) => string
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="divide-y rounded-lg border">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_auto]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-medium">{item.title}</h3>
              <StatusPill status={item.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.author?.name ?? "Chưa có tác giả"} · Cập nhật {formatDate(item.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={getEditHref(item)}>Edit</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={getViewHref(item)} target="_blank">
                View
                <ArrowUpRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminPage() {
  await requireAdmin()
  const dashboard = await getAdminDashboard()

  const metrics = [
    { label: "Tổng bài viết", value: dashboard.stats.totalPosts, icon: <FileTextIcon /> },
    { label: "Tổng services", value: dashboard.stats.totalServices, icon: <ServerIcon /> },
    { label: "Tổng tools", value: dashboard.stats.totalTools, icon: <WrenchIcon /> },
    {
      label: "Tổng comparisons",
      value: dashboard.stats.totalComparisons,
      icon: <GitCompareIcon />,
    },
    {
      label: "Bài published",
      value: dashboard.stats.publishedPosts,
      icon: <ShieldCheckIcon />,
    },
    { label: "Bài draft", value: dashboard.stats.draftPosts, icon: <FileTextIcon /> },
  ]

  const quickActions = [
    { title: "Tạo bài viết mới", href: "/admin/posts/new", icon: <FileTextIcon /> },
    { title: "Tạo service mới", href: "/admin/services/new", icon: <ServerIcon /> },
    { title: "Tạo tool mới", href: "/admin/tools/new", icon: <WrenchIcon /> },
    {
      title: "Tạo comparison mới",
      href: "/admin/comparisons/new",
      icon: <GitCompareIcon />,
    },
  ]

  const healthItems = [
    {
      label: "Bài viết thiếu SEO title",
      value: dashboard.health.postsMissingSeoTitle,
    },
    {
      label: "Bài viết thiếu meta description",
      value: dashboard.health.postsMissingMetaDescription,
    },
    {
      label: "Bài chưa có ảnh cover",
      value: dashboard.health.postsMissingCover,
    },
    {
      label: "Services chưa có category",
      value: dashboard.health.servicesMissingCategory,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <LayoutDashboardIcon className="size-3.5" />
            Admin dashboard
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
              Tổng quan hệ thống nội dung
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Theo dõi bài viết, services, tools, comparisons và các cảnh báo SEO quan trọng
              trong một giao diện quản trị gọn, rõ, dễ mở rộng.
            </p>
          </div>
        </div>

        <Card className="self-start">
          <CardContent className="p-4">
            <form action="/admin/posts" className="flex items-center gap-2">
              <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-background px-3">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search articles, services, tools..."
                  className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card>
            <SectionTitle
              title="Recent Articles"
              description="Các bài viết được cập nhật gần đây nhất."
            />
            <CardContent>
              <RecentContentList
                items={dashboard.recentArticles}
                emptyLabel="Chưa có bài viết gần đây."
                getEditHref={(item) => `/admin/posts/${item.id}/edit`}
                getViewHref={(item) => `/articles/${item.slug}`}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionTitle
              title="Recent Services"
              description="Hồ sơ services mới cập nhật cho directory public."
            />
            <CardContent>
              <RecentContentList
                items={dashboard.recentServices}
                emptyLabel="Chưa có service gần đây."
                getEditHref={(item) => `/admin/services/${item.id}/edit`}
                getViewHref={(item) => `/services/${item.slug}`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle
              title="Quick Actions"
              description="Các thao tác biên tập thường dùng."
            />
            <CardContent className="grid gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  className="h-11 justify-between"
                >
                  <Link href={action.href}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground [&_svg]:size-4">
                        {action.icon}
                      </span>
                      {action.title}
                    </span>
                    <PlusIcon />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <SectionTitle
              title="SEO / Content Health"
              description="Các điểm cần xử lý trước khi mở rộng nội dung."
            />
            <CardContent className="grid gap-3">
              {healthItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <TriangleAlertIcon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="rounded-md border bg-card px-2 py-1 text-sm font-semibold">
                    {item.value.toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <SectionTitle
              title="Top Categories"
              description="Các nhóm nội dung chiến lược."
            />
            <CardContent className="grid gap-2">
              {dashboard.topCategories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.count.toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
