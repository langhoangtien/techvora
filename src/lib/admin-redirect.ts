export function adminRedirect(path: string, params: Record<string, string>) {
  const search = new URLSearchParams(params)
  return `${path}?${search.toString()}`
}

export function deleteErrorMessage(resource: string) {
  return `Không thể xóa ${resource}. Mục này có thể đã bị xóa hoặc đang được dữ liệu khác sử dụng.`
}
