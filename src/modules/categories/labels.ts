export type CategoryPathItem = {
  id: string
  name: string
  parentId: string | null
}

export function formatCategoryPath(
  category: CategoryPathItem,
  categories: CategoryPathItem[],
) {
  const byId = new Map(categories.map((item) => [item.id, item]))
  const path = [category.name]
  const seen = new Set([category.id])
  let parentId = category.parentId

  while (parentId) {
    if (seen.has(parentId)) break

    const parent = byId.get(parentId)
    if (!parent) break

    path.unshift(parent.name)
    seen.add(parent.id)
    parentId = parent.parentId
  }

  return path.join(" / ")
}

export function sortCategoriesByTree<T extends CategoryPathItem>(
  categories: T[],
) {
  const byParentId = new Map<string | null, T[]>()
  const byId = new Set(categories.map((category) => category.id))
  const sorted: T[] = []
  const visited = new Set<string>()

  for (const category of categories) {
    const parentId = category.parentId && byId.has(category.parentId) ? category.parentId : null
    const siblings = byParentId.get(parentId) ?? []

    siblings.push(category)
    byParentId.set(parentId, siblings)
  }

  function appendBranch(parentId: string | null) {
    const children = byParentId.get(parentId) ?? []

    for (const child of children) {
      if (visited.has(child.id)) continue

      visited.add(child.id)
      sorted.push(child)
      appendBranch(child.id)
    }
  }

  appendBranch(null)

  return sorted
}
