import { NextResponse } from "next/server"
import { searchMockTests, getMockTestsByCategory, ALL_MOCK_TESTS, getMockTestStats } from "@/lib/mock-test-database"

// Exam categories with their keywords
const EXAM_CATEGORIES: Record<string, { name: string; keywords: string[] }> = {
  ssc: { name: "SSC", keywords: ["ssc", "cgl", "chsl", "mts", "gd", "cpo", "steno", "je", "staff selection"] },
  banking: { name: "Banking", keywords: ["bank", "ibps", "sbi", "rbi", "po", "clerk", "rrb bank", "nabard", "sebi"] },
  defence: { name: "Defence", keywords: ["nda", "cds", "defence", "army", "navy", "airforce", "afcat", "agniveer", "capf"] },
  railways: { name: "Railways", keywords: ["railway", "rrb", "ntpc", "group d", "alp", "je railway", "technician", "loco"] },
  teaching: { name: "Teaching", keywords: ["ctet", "tet", "teacher", "kvs", "nvs", "dsssb", "super tet", "uptet", "reet"] },
  upsc: { name: "UPSC", keywords: ["upsc", "ias", "ips", "pcs", "bpsc", "uppsc", "mppsc", "rpsc", "wbcs", "civil services"] },
  jeeneet: { name: "JEE/NEET", keywords: ["jee", "neet", "physics", "chemistry", "maths", "engineering", "medical", "gate", "cuet"] },
  police: { name: "Police", keywords: ["police", "constable", "si", "sub inspector"] },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").trim().toLowerCase()
  const limit = parseInt(searchParams.get("limit") || "50")

  if (!q || q.length < 2) {
    // Return category overview when no query
    const stats = getMockTestStats()
    return NextResponse.json({ 
      results: [],
      categories: stats.categories,
      totalSeries: stats.totalSeries,
      totalTests: stats.totalTests,
    })
  }

  // Find matching category
  let matchedCategory: string | null = null
  for (const [catKey, catData] of Object.entries(EXAM_CATEGORIES)) {
    if (catData.keywords.some(kw => q.includes(kw) || kw.includes(q))) {
      matchedCategory = catData.name
      break
    }
  }

  // Search mock tests
  const mockResults = searchMockTests(q)
  
  // If we found a matching category, also get category-specific results
  let categoryResults: typeof mockResults = []
  if (matchedCategory) {
    categoryResults = getMockTestsByCategory(matchedCategory)
  }

  // Combine and deduplicate results
  const combinedMap = new Map<string, typeof mockResults[0]>()
  
  // Add search results first (higher priority)
  for (const r of mockResults) {
    combinedMap.set(r.id, r)
  }
  
  // Add category results
  for (const r of categoryResults) {
    if (!combinedMap.has(r.id)) {
      combinedMap.set(r.id, r)
    }
  }

  const results = Array.from(combinedMap.values()).slice(0, limit)

  return NextResponse.json({ 
    results: results.map((r, idx) => ({
      id: r.id,
      name: `Mock Test ${idx + 1}`,
      displayName: r.title,
      description: r.description,
      api: `mock:${r.category}`,
      webBase: `mock:${r.slug}`,
      category: r.category,
      examTags: r.examTags,
      totalTests: r.totalTests,
      totalQuestions: r.totalQuestions,
    })),
    totalFound: combinedMap.size,
    matchedCategory,
    categories: [...new Set(results.map(r => r.category))],
  })
}
