import type { PostStatus, PostType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export type PostListFilters = {
  q?: string
  status?: string
  type?: string
  categoryId?: string
  authorId?: string
  page?: number
}

const pageSize = 10

export async function getPostList(filters: PostListFilters) {
  const page = Math.max(filters.page ?? 1, 1)
  const where = {
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { slug: { contains: filters.q, mode: "insensitive" as const } },
            { excerpt: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status as PostStatus } : {}),
    ...(filters.type ? { type: filters.type as PostType } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.authorId ? { authorId: filters.authorId } : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ])

  return {
    posts,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getPostEditorOptions() {
  const [categories, tags, authors] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { categories, tags, authors }
}

export async function getPostForEdit(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

export async function getPostForPreview(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  })
}
