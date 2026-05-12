import { prisma } from "@/lib/prisma"

const pageSize = 10

export type RedirectListFilters = {
  q?: string
  status?: string
  page?: number
}

export async function getRedirectList(filters: RedirectListFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1)
  const statusCode = filters.status ? Number(filters.status) : undefined
  const where = {
    ...(filters.q
      ? {
          OR: [
            { source: { contains: filters.q, mode: "insensitive" as const } },
            { destination: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(statusCode === 301 || statusCode === 302 ? { statusCode } : {}),
  }

  const [redirects, total] = await Promise.all([
    prisma.redirect.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.redirect.count({ where }),
  ])

  return {
    redirects,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getRedirectForEdit(id: string) {
  return prisma.redirect.findUnique({ where: { id } })
}
