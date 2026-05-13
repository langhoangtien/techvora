import { NextResponse } from "next/server"

import {
  minSearchQueryLength,
  normalizeSearchQuery,
  searchPublicContent,
} from "@/modules/search/public"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = normalizeSearchQuery(searchParams.get("q"))

  if (query.length < minSearchQueryLength) {
    return NextResponse.json({
      query,
      minQueryLength: minSearchQueryLength,
      results: {
        articles: [],
        tools: [],
        services: [],
        comparisons: [],
      },
    })
  }

  try {
    const results = await searchPublicContent(query)

    return NextResponse.json({
      query,
      minQueryLength: minSearchQueryLength,
      results,
    })
  } catch {
    return NextResponse.json(
      {
        error: "Die Suche ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 }
    )
  }
}
