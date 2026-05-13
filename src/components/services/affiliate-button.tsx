import Link from "next/link"
import { IconExternalLink as ExternalLinkIcon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export function AffiliateButton({
  href,
  children = "Website besuchen",
}: {
  href?: string | null
  children?: React.ReactNode
}) {
  if (!href) {
    return null
  }

  return (
    <Button asChild>
      <Link href={href} target="_blank" rel="nofollow sponsored noopener">
        {children}
        <ExternalLinkIcon />
      </Link>
    </Button>
  )
}
