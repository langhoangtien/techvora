import { prisma } from "@/lib/prisma"
import { normalizeRedirectPath, shouldSkipRuntimeRedirect } from "@/modules/redirects/paths"

const locale = "de-DE"

export async function getRuntimeRedirect(pathname: string) {
  const source = normalizeRedirectPath(pathname)

  if (!source || shouldSkipRuntimeRedirect(source)) return null

  const redirect = await prisma.redirect.findUnique({
    where: { source_locale: { source, locale } },
    select: {
      destination: true,
      statusCode: true,
      active: true,
    },
  })

  if (!redirect?.active) return null
  if (redirect.statusCode !== 301 && redirect.statusCode !== 302) return null

  return {
    destination: redirect.destination,
    statusCode: redirect.statusCode,
  }
}
