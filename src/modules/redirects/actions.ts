"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import {
  isBlockedRedirectPath,
  isExternalRedirectUrl,
  isValidFromPath,
  isValidToPath,
  normalizeRedirectPath,
} from "@/modules/redirects/paths"

export type RedirectFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"fromPath" | "toPath" | "status", string>>
}

const locale = "en"
const validStatusCodes = new Set([301, 302])

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

async function ensureAdmin() {
  return isAdminSession()
}

async function wouldCreateLoop(source: string, destination: string, currentId?: string | null) {
  if (isExternalRedirectUrl(destination)) return false

  let next = normalizeRedirectPath(destination)
  const seen = new Set([source])

  for (let depth = 0; depth < 10; depth++) {
    if (seen.has(next)) return true
    seen.add(next)

    const redirect = await prisma.redirect.findUnique({
      where: { source_locale: { source: next, locale } },
      select: { id: true, destination: true, active: true },
    })

    if (!redirect?.active || redirect.id === currentId) return false
    if (isExternalRedirectUrl(redirect.destination)) return false

    next = normalizeRedirectPath(redirect.destination)
  }

  return true
}

async function validateRedirectInput(formData: FormData) {
  const id = text(formData, "id") || null
  const fromPath = normalizeRedirectPath(text(formData, "fromPath"))
  const toPath = normalizeRedirectPath(text(formData, "toPath"))
  const status = Number(text(formData, "status"))
  const errors: RedirectFormState["errors"] = {}

  if (!fromPath) errors.fromPath = "Vui lòng nhập đường dẫn nguồn."
  else if (!isValidFromPath(fromPath)) errors.fromPath = "Đường dẫn nguồn phải bắt đầu bằng dấu /."
  else if (isBlockedRedirectPath(fromPath)) {
    errors.fromPath = "Không được tạo redirect cho đường dẫn admin, API hoặc preview."
  }

  if (!toPath) errors.toPath = "Vui lòng nhập đường dẫn đích."
  else if (!isValidToPath(toPath)) {
    errors.toPath = "Đường dẫn đích phải bắt đầu bằng / hoặc https://."
  } else if (!isExternalRedirectUrl(toPath) && isBlockedRedirectPath(toPath)) {
    errors.toPath = "Không được redirect đến đường dẫn admin, API hoặc preview."
  }

  if (!validStatusCodes.has(status)) {
    errors.status = "Mã trạng thái chỉ được là 301 hoặc 302."
  }

  if (fromPath && toPath && fromPath === toPath) {
    errors.toPath = "Đường dẫn nguồn và đích không được giống nhau."
  }

  const existing = fromPath
    ? await prisma.redirect.findUnique({
        where: { source_locale: { source: fromPath, locale } },
        select: { id: true },
      })
    : null

  if (existing && existing.id !== id) {
    errors.fromPath = "Đường dẫn nguồn này đã tồn tại."
  }

  if (!errors.fromPath && !errors.toPath && (await wouldCreateLoop(fromPath, toPath, id))) {
    errors.toPath = "Redirect này có thể tạo vòng lặp. Vui lòng chọn đường dẫn đích khác."
  }

  return { id, fromPath, toPath, status, errors }
}

export async function saveRedirectAction(
  _prevState: RedirectFormState,
  formData: FormData
): Promise<RedirectFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Bạn không có quyền lưu redirect." }
  }

  const { id, fromPath, toPath, status, errors } = await validateRedirectInput(formData)

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Vui lòng kiểm tra lại thông tin redirect.", errors }
  }

  const data = {
    source: fromPath,
    destination: toPath,
    statusCode: status,
    locale,
    active: true,
  }

  const saved = id
    ? await prisma.redirect.update({ where: { id }, data })
    : await prisma.redirect.create({ data })

  revalidatePath("/admin/redirects")
  revalidatePath(saved.source)
  redirect(
    `/admin/redirects/${saved.id}/edit?success=${encodeURIComponent(
      id ? "Đã cập nhật redirect." : "Đã tạo redirect."
    )}`
  )
}

export async function deleteRedirectAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/redirects", { error: "Bạn không có quyền xóa redirect." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.redirect.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/redirects", { error: deleteErrorMessage("redirect") }))
  }

  revalidatePath("/admin/redirects")
  redirect(adminRedirect("/admin/redirects", { success: "Đã xóa redirect." }))
}

export async function createAutoRedirectIfSlugChanged({
  oldPath,
  newPath,
}: {
  oldPath: string
  newPath: string
}) {
  const source = normalizeRedirectPath(oldPath)
  const destination = normalizeRedirectPath(newPath)

  if (!source || !destination || source === destination) return
  if (!isValidFromPath(source) || !isValidToPath(destination)) return
  if (isBlockedRedirectPath(source)) return
  if (!isExternalRedirectUrl(destination) && isBlockedRedirectPath(destination)) return
  if (await wouldCreateLoop(source, destination)) return

  await prisma.redirect.upsert({
    where: { source_locale: { source, locale } },
    update: {
      destination,
      statusCode: 301,
      active: true,
    },
    create: {
      source,
      destination,
      statusCode: 301,
      locale,
      active: true,
    },
  })
}
