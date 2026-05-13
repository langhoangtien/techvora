import {
  IconChartBar,
  IconFileText,
  IconLayoutDashboard,
  IconLink,
  IconListTree,
  IconPhoto,
  IconQuestionMark,
  IconSettings,
  IconTags,
  IconTool,
  IconUserCircle,
  IconWorld,
} from "@tabler/icons-react"

export const siteConfig = {
  name: "Tekvora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3008",
  description:
    "Independent reviews, comparisons, and practical guides for tech tools and online services.",
  locale: "en",
}

export const publicNavItems = [
  { title: "Tools", href: "/tools" },
  { title: "Articles", href: "/articles" },
  { title: "Services", href: "/services" },
  { title: "Compare", href: "/compare" },
]

export const adminNavItems = [
  {
    title: "Tổng quan",
    url: "/admin",
    icon: <IconLayoutDashboard />,
  },
  {
    title: "Nội dung",
    url: "/admin/posts",
    icon: <IconFileText />,
    items: [
      { title: "Bài viết", url: "/admin/posts" },
      { title: "Công cụ", url: "/admin/tools" },
      { title: "Services", url: "/admin/services" },
      { title: "So sánh", url: "/admin/comparisons" },
    ],
  },
  {
    title: "Phân loại",
    url: "/admin/categories",
    icon: <IconListTree />,
    items: [
      { title: "Danh mục", url: "/admin/categories" },
      { title: "Thẻ", url: "/admin/tags" },
      { title: "Tác giả", url: "/admin/authors" },
    ],
  },
  {
    title: "Thư viện",
    url: "/admin/media",
    icon: <IconPhoto />,
  },
  {
    title: "SEO & vận hành",
    url: "/admin/seo",
    icon: <IconWorld />,
    items: [
      { title: "Chuyển hướng", url: "/admin/redirects" },
      { title: "Cài đặt site", url: "/admin/settings" },
    ],
  },
  {
    title: "Tài khoản",
    url: "/admin/profile",
    icon: <IconUserCircle />,
  },
]

export const navSettings = [
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: IconSettings,
  },
  {
    title: "Trợ giúp",
    url: "/admin/help",
    icon: IconQuestionMark,
  },
]

export const nav = {
  adminNavMain: adminNavItems,
  adminNavSecondary: navSettings,
}

export const adminQuickLinks = [
  {
    name: "Cấu hình SEO",
    href: "/admin/settings",
    icon: <IconSettings />,
  },
  {
    name: "Redirects",
    href: "/admin/redirects",
    icon: <IconLink />,
  },
  {
    name: "Taxonomy",
    href: "/admin/categories",
    icon: <IconTags />,
  },
  {
    name: "Tác giả",
    href: "/admin/authors",
    icon: <IconUserCircle />,
  },
  {
    name: "Tools",
    href: "/admin/tools",
    icon: <IconTool />,
  },
  {
    name: "Báo cáo",
    href: "/admin/reports",
    icon: <IconChartBar />,
  },
]