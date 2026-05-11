export function adminRedirect(path: string, params: Record<string, string>) {
  const search = new URLSearchParams(params)
  return `${path}?${search.toString()}`
}

export function deleteErrorMessage(resource: string) {
  return `Khong the xoa ${resource}. Muc nay co the da bi xoa hoac dang duoc du lieu khac su dung.`
}
