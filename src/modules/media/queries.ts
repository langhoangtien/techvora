import { prisma } from "@/lib/prisma"

export type MediaListFilters = {
  q?: string
  mimeType?: string
  sort?: string
}

export async function getMediaForAdmin(filters: MediaListFilters = {}) {
  const q = filters.q?.trim()
  const orderBy =
    filters.sort === "oldest"
      ? { createdAt: "asc" as const }
      : filters.sort === "largest"
        ? { size: "desc" as const }
        : filters.sort === "smallest"
          ? { size: "asc" as const }
          : { createdAt: "desc" as const }

  return prisma.media.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { filename: { contains: q, mode: "insensitive" as const } },
              { originalName: { contains: q, mode: "insensitive" as const } },
              { altText: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(filters.mimeType ? { mimeType: filters.mimeType } : {}),
    },
    orderBy,
    take: 120,
  })
}

export async function getMediaMimeTypes() {
  const rows = await prisma.media.findMany({
    select: { mimeType: true },
    distinct: ["mimeType"],
    orderBy: { mimeType: "asc" },
  })

  return rows.map((row) => row.mimeType)
}

