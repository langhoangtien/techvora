import {
  BarChart3Icon,
  FileTextIcon,
  FolderTreeIcon,
  Globe2Icon,
  HardDriveIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LinkIcon,
  SettingsIcon,
  TagsIcon,
  UserRoundIcon,
  WrenchIcon,
} from "lucide-react"

export const siteConfig = {
  name: "Tekvora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Independent reviews, comparisons, and practical guides for tech tools, SaaS, hosting, and VPS platforms.",
  locale: "en",
}

export const publicNavItems = [
  { title: "Tools", href: "/tools" },
  { title: "Articles", href: "/articles" },
  { title: "Hosting", href: "/hosting" },
  { title: "SaaS", href: "/saas" },
  { title: "Compare", href: "/compare" },
]

export const adminNavItems = [
  {
    title: "Tổng quan",
    url: "/admin",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Nội dung",
    url: "/admin/posts",
    icon: <FileTextIcon />,
    items: [
      { title: "Bài viết", url: "/admin/posts" },
      { title: "Công cụ", url: "/admin/tools" },
      { title: "Hosting/VPS", url: "/admin/hosting" },
      { title: "SaaS", url: "/admin/saas" },
      { title: "So sánh", url: "/admin/comparisons" },
    ],
  },
  {
    title: "Phân loại",
    url: "/admin/categories",
    icon: <FolderTreeIcon />,
    items: [
      { title: "Danh mục", url: "/admin/categories" },
      { title: "Thẻ", url: "/admin/tags" },
      { title: "Tác giả", url: "/admin/authors" },
    ],
  },
  {
    title: "Thư viện",
    url: "/admin/media",
    icon: <ImageIcon />,
  },
  {
    title: "SEO & vận hành",
    url: "/admin/seo",
    icon: <Globe2Icon />,
    items: [
      { title: "Chuyển hướng", url: "/admin/redirects" },
      { title: "Cài đặt site", url: "/admin/settings" },
    ],
  },
  {
    title: "Tài khoản",
    url: "/admin/profile",
    icon: <UserRoundIcon />,
  },
]

export const adminQuickLinks = [
  { name: "Cấu hình SEO", href: "/admin/settings", icon: <SettingsIcon /> },
  { name: "Redirects", href: "/admin/redirects", icon: <LinkIcon /> },
  { name: "Taxonomy", href: "/admin/categories", icon: <TagsIcon /> },
  { name: "Tác giả", href: "/admin/authors", icon: <UserRoundIcon /> },
  { name: "Tools", href: "/admin/tools", icon: <WrenchIcon /> },
  { name: "Hosting", href: "/admin/hosting", icon: <HardDriveIcon /> },
  { name: "Báo cáo", href: "/admin/reports", icon: <BarChart3Icon /> },
]
