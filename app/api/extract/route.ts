import { NextResponse } from "next/server"
import { searchMockTests, getMockTestsByCategory, ALL_MOCK_TESTS } from "@/lib/mock-test-database"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const inputUrl = searchParams.get("url")?.trim()
  const directApiUrl = searchParams.get("apiUrl")?.trim()
  const category = searchParams.get("category")?.trim()
  const query = searchParams.get("q")?.trim()

  // If query is provided, search mock tests
  if (query) {
    const results = searchMockTests(query)
    return NextResponse.json({
      success: true,
      testSeries: results.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        total_tests: t.totalTests,
        total_questions: t.totalQuestions,
        duration: t.duration,
        language: t.language,
        category: t.category,
        examTags: t.examTags,
        is_free: t.isFree,
      })),
      source: "database",
      count: results.length,
    })
  }

  // If category is provided, get tests for that category
  if (category) {
    const results = getMockTestsByCategory(category)
    return NextResponse.json({
      success: true,
      testSeries: results.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        total_tests: t.totalTests,
        total_questions: t.totalQuestions,
        duration: t.duration,
        language: t.language,
        category: t.category,
        examTags: t.examTags,
        is_free: t.isFree,
      })),
      source: "database",
      count: results.length,
    })
  }

  // Detect category from URL if provided
  if (inputUrl || directApiUrl) {
    const url = (inputUrl || directApiUrl || "").toLowerCase()
    
    // Map URL keywords to categories
    let detectedCategory = "SSC"
    if (url.includes("ssc") || url.includes("cgl") || url.includes("chsl") || url.includes("mts")) {
      detectedCategory = "SSC"
    } else if (url.includes("bank") || url.includes("ibps") || url.includes("sbi") || url.includes("rbi")) {
      detectedCategory = "Banking"
    } else if (url.includes("nda") || url.includes("cds") || url.includes("defence") || url.includes("army") || url.includes("navy") || url.includes("capf") || url.includes("agniveer")) {
      detectedCategory = "Defence"
    } else if (url.includes("railway") || url.includes("rrb") || url.includes("ntpc") || url.includes("alp")) {
      detectedCategory = "Railways"
    } else if (url.includes("ctet") || url.includes("tet") || url.includes("teacher") || url.includes("kvs") || url.includes("nvs")) {
      detectedCategory = "Teaching"
    } else if (url.includes("upsc") || url.includes("ias") || url.includes("psc") || url.includes("bpsc") || url.includes("uppsc")) {
      detectedCategory = "UPSC"
    } else if (url.includes("jee") || url.includes("neet") || url.includes("gate") || url.includes("cuet")) {
      detectedCategory = "JEE/NEET"
    } else if (url.includes("police") || url.includes("constable")) {
      detectedCategory = "Police"
    }

    const results = getMockTestsByCategory(detectedCategory)
    
    return NextResponse.json({
      success: true,
      testSeries: results.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        total_tests: t.totalTests,
        total_questions: t.totalQuestions,
        duration: t.duration,
        language: t.language,
        category: t.category,
        examTags: t.examTags,
        is_free: t.isFree,
      })),
      source: "database",
      apiBase: directApiUrl || "mock",
      webBase: inputUrl || "",
      count: results.length,
    })
  }

  // Default: return mix of all categories
  const defaultTests = ALL_MOCK_TESTS.slice(0, 30)
  return NextResponse.json({
    success: true,
    testSeries: defaultTests.map(t => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      description: t.description,
      total_tests: t.totalTests,
      total_questions: t.totalQuestions,
      duration: t.duration,
      language: t.language,
      category: t.category,
      examTags: t.examTags,
      is_free: t.isFree,
    })),
    source: "database",
    count: defaultTests.length,
  })
}
