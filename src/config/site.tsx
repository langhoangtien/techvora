import {
  BarChart3Icon,
  FileTextIcon,
  FolderTreeIcon,
  Globe2Icon,
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
    title: "Tá»•ng quan",
    url: "/admin",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Ná»™i dung",
    url: "/admin/posts",
    icon: <FileTextIcon />,
    items: [
      { title: "BÃ i viáº¿t", url: "/admin/posts" },
      { title: "CÃ´ng cá»¥", url: "/admin/tools" },
      { title: "Services", url: "/admin/services" },
      { title: "So sÃ¡nh", url: "/admin/comparisons" },
    ],
  },
  {
    title: "PhÃ¢n loáº¡i",
    url: "/admin/categories",
    icon: <FolderTreeIcon />,
    items: [
      { title: "Danh má»¥c", url: "/admin/categories" },
      { title: "Tháº»", url: "/admin/tags" },
      { title: "TÃ¡c giáº£", url: "/admin/authors" },
    ],
  },
  {
    title: "ThÆ° viá»‡n",
    url: "/admin/media",
    icon: <ImageIcon />,
  },
  {
    title: "SEO & váº­n hÃ nh",
    url: "/admin/seo",
    icon: <Globe2Icon />,
    items: [
      { title: "Chuyá»ƒn hÆ°á»›ng", url: "/admin/redirects" },
      { title: "CÃ i Ä‘áº·t site", url: "/admin/settings" },
    ],
  },
  {
    title: "TÃ i khoáº£n",
    url: "/admin/profile",
    icon: <UserRoundIcon />,
  },
]

export const adminQuickLinks = [
  { name: "Cáº¥u hÃ¬nh SEO", href: "/admin/settings", icon: <SettingsIcon /> },
  { name: "Redirects", href: "/admin/redirects", icon: <LinkIcon /> },
  { name: "Taxonomy", href: "/admin/categories", icon: <TagsIcon /> },
  { name: "TÃ¡c giáº£", href: "/admin/authors", icon: <UserRoundIcon /> },
  { name: "Tools", href: "/admin/tools", icon: <WrenchIcon /> },
  { name: "BÃ¡o cÃ¡o", href: "/admin/reports", icon: <BarChart3Icon /> },
]
