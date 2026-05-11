import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AffiliateButton({
  href,
  children = "Visit website",
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
