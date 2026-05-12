import {
  BarChart3Icon,
  CircleQuestionMark,
  FileTextIcon,
  FolderTreeIcon,
  Globe2Icon,
  ImageIcon,
  LayoutDashboardIcon,
  LinkIcon,
  Settings,
  SettingsIcon,
  TagsIcon,
  UserRoundIcon,
  WrenchIcon,
} from "lucide-react"

export const siteConfig = {
  name: "Tekvora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Nội dung",
    url: "/admin/posts",
    icon: <FileTextIcon />,
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

export const navSettings = [  
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
 },
 {
    title: "Trợ giúp",
    url: "/admin/help",
    icon: CircleQuestionMark,
    
 }
        
]
  
export const nav = {
  adminNavMain:adminNavItems,
  adminNavSecondary: navSettings
}

export const adminQuickLinks = [
  { name: "Cấu hình SEO", href: "/admin/settings", icon: <SettingsIcon /> },
  { name: "Redirects", href: "/admin/redirects", icon: <LinkIcon /> },
  { name: "Taxonomy", href: "/admin/categories", icon: <TagsIcon /> },
  { name: "Tác giả", href: "/admin/authors", icon: <UserRoundIcon /> },
  { name: "Tools", href: "/admin/tools", icon: <WrenchIcon /> },
  { name: "Báo cáo", href: "/admin/reports", icon: <BarChart3Icon /> },
]
