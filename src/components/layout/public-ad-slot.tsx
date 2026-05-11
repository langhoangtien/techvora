import type { AdsSettings } from "@/lib/settings"
import { AdSlot } from "@/components/layout/ad-slot"

export function PublicAdSlot({
  ads,
  label,
  className,
}: {
  ads: AdsSettings
  label: string
  className?: string
}) {
  if (!ads.enableAds) {
    return null
  }

  return <AdSlot label={label} className={className} />
}

