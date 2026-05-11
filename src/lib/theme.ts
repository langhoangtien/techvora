import type { CSSProperties } from "react"

import type { ThemeSettings } from "@/lib/settings"

type ThemeColor = {
  solid: string
  soft: string
  foreground: string
}

const themeColors: Record<string, ThemeColor> = {
  red: {
    solid: "oklch(0.577 0.245 27.325)",
    soft: "oklch(0.971 0.013 17.38)",
    foreground: "oklch(0.985 0 0)",
  },
  orange: {
    solid: "oklch(0.646 0.222 41.116)",
    soft: "oklch(0.98 0.016 73.684)",
    foreground: "oklch(0.985 0 0)",
  },
  amber: {
    solid: "oklch(0.769 0.188 70.08)",
    soft: "oklch(0.987 0.022 95.277)",
    foreground: "oklch(0.145 0 0)",
  },
  emerald: {
    solid: "oklch(0.596 0.145 163.225)",
    soft: "oklch(0.979 0.021 166.113)",
    foreground: "oklch(0.985 0 0)",
  },
  cyan: {
    solid: "oklch(0.609 0.126 221.723)",
    soft: "oklch(0.984 0.019 200.873)",
    foreground: "oklch(0.985 0 0)",
  },
  blue: {
    solid: "oklch(0.546 0.245 262.881)",
    soft: "oklch(0.97 0.014 254.604)",
    foreground: "oklch(0.985 0 0)",
  },
  violet: {
    solid: "oklch(0.541 0.281 293.009)",
    soft: "oklch(0.969 0.016 293.756)",
    foreground: "oklch(0.985 0 0)",
  },
  rose: {
    solid: "oklch(0.586 0.253 17.585)",
    soft: "oklch(0.969 0.015 12.422)",
    foreground: "oklch(0.985 0 0)",
  },
  neutral: {
    solid: "oklch(0.205 0 0)",
    soft: "oklch(0.97 0 0)",
    foreground: "oklch(0.985 0 0)",
  },
}

type ThemeStyle = CSSProperties & Record<`--${string}`, string>

function getColor(name: string) {
  return themeColors[name] ?? themeColors.red
}

export function getThemeStyle(theme: ThemeSettings): ThemeStyle {
  const primary = getColor(theme.primaryColor)
  const accent = getColor(theme.accentColor)

  return {
    "--primary": primary.solid,
    "--primary-foreground": primary.foreground,
    "--ring": primary.solid,
    "--sidebar-primary": primary.solid,
    "--sidebar-primary-foreground": primary.foreground,
    "--sidebar-ring": primary.solid,
    "--accent": accent.soft,
    "--accent-foreground": accent.solid,
    "--sidebar-accent": accent.soft,
    "--sidebar-accent-foreground": accent.solid,
    "--chart-1": primary.solid,
    "--chart-2": accent.solid,
  }
}
