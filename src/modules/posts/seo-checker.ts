export type SeoCheckStatus = "good" | "warning" | "bad"

export type SeoCheckInput = {
  title: string
  slug: string
  excerpt: string
  content: string
  seoTitle: string
  seoDescription: string
  coverImageUrl: string
  categoryId: string
  tagIds: string[]
}

export type SeoCheckItem = {
  key: string
  label: string
  status: SeoCheckStatus
  message: string
}

export function extractWordCount(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!text) return 0
  return text.split(" ").filter(Boolean).length
}

export function extractHeadings(html: string) {
  return [...html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: match[2].replace(/<[^>]+>/g, "").trim(),
  }))
}

export function extractImages(html: string) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => {
    const tag = match[0]
    const alt = tag.match(/\salt=["']([^"']*)["']/i)?.[1] ?? ""
    const src = tag.match(/\ssrc=["']([^"']*)["']/i)?.[1] ?? ""
    return { src, alt }
  })
}

export function extractLinks(html: string) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(
    (match) => match[1]
  )
}

function lengthStatus(value: string, goodMin: number, goodMax: number, warnMin: number, warnMax: number): SeoCheckStatus {
  const length = value.trim().length
  if (length >= goodMin && length <= goodMax) return "good"
  if (length >= warnMin && length <= warnMax) return "warning"
  return "bad"
}

function slugStatus(slug: string): SeoCheckStatus {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? "good" : "bad"
}

export function calculateSeoScore(input: SeoCheckInput) {
  const headings = extractHeadings(input.content)
  const images = extractImages(input.content)
  const links = extractLinks(input.content)
  const wordCount = extractWordCount(input.content)
  const internalLinks = links.filter((link) => link.startsWith("/") || link.includes("tekvora"))
  const externalLinks = links.filter((link) => /^https?:\/\//.test(link) && !link.includes("tekvora"))
  const missingAlt = images.filter((image) => !image.alt.trim())

  const items: SeoCheckItem[] = [
    {
      key: "seoTitle",
      label: "Tiêu đề SEO",
      status: lengthStatus(input.seoTitle || input.title, 40, 60, 30, 70),
      message: "Tốt nhất trong khoảng 40-60 ký tự.",
    },
    {
      key: "seoDescription",
      label: "Mô tả SEO",
      status: lengthStatus(input.seoDescription, 120, 160, 80, 180),
      message: "Tốt nhất trong khoảng 120-160 ký tự.",
    },
    {
      key: "slug",
      label: "Slug URL",
      status: slugStatus(input.slug),
      message: "Slug nên viết thường, dễ đọc và dùng dấu gạch ngang.",
    },
    {
      key: "headings",
      label: "Cấu trúc heading",
      status: headings.some((heading) => heading.level === 1)
        ? "warning"
        : headings.some((heading) => heading.level === 2)
          ? "good"
          : "warning",
      message: headings.some((heading) => heading.level === 1)
        ? "Không nên dùng H1 trong nội dung vì tiêu đề bài đã là H1."
        : "Nên có ít nhất một H2 trong nội dung.",
    },
    {
      key: "images",
      label: "Ảnh trong nội dung",
      status: images.length === 0 ? "warning" : missingAlt.length > 0 ? "warning" : "good",
      message:
        images.length === 0
          ? "Nên có ít nhất một ảnh minh họa."
          : missingAlt.length > 0
            ? "Một số ảnh chưa có alt text."
            : "Ảnh có alt text phù hợp.",
    },
    {
      key: "cover",
      label: "Ảnh đại diện",
      status: input.coverImageUrl ? "good" : "warning",
      message: "Nên đặt cover image cho bài viết.",
    },
    {
      key: "internalLinks",
      label: "Liên kết nội bộ",
      status: internalLinks.length > 0 ? "good" : "warning",
      message: "Nên có ít nhất một liên kết nội bộ.",
    },
    {
      key: "externalLinks",
      label: "Liên kết ngoài",
      status: externalLinks.length > 0 ? "good" : "warning",
      message: "Liên kết ngoài là tùy chọn nhưng thường hữu ích.",
    },
    {
      key: "wordCount",
      label: "Số lượng từ",
      status: wordCount >= 800 ? "good" : wordCount >= 300 ? "warning" : "bad",
      message: `${wordCount} từ. Tốt nhất từ 800 từ trở lên.`,
    },
    {
      key: "category",
      label: "Danh mục",
      status: input.categoryId ? "good" : "warning",
      message: "Nên chọn danh mục cho bài viết.",
    },
    {
      key: "tags",
      label: "Thẻ",
      status: input.tagIds.length > 0 ? "good" : "warning",
      message: "Nên chọn ít nhất một thẻ.",
    },
    {
      key: "excerpt",
      label: "Excerpt",
      status: input.excerpt.trim() ? "good" : "warning",
      message: "Nên viết excerpt để dùng trong listing và chia sẻ.",
    },
  ]

  const points = items.reduce((total, item) => {
    if (item.status === "good") return total + 1
    if (item.status === "warning") return total + 0.5
    return total
  }, 0)

  return {
    score: Math.round((points / items.length) * 100),
    items,
    wordCount,
    headings,
    images,
    links,
  }
}
