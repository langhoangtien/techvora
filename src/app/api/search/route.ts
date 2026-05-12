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
        hosting: [],
        saas: [],
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
        error: "Unable to search right now. Please try again later.",
      },
      { status: 500 }
    )
  }
}
