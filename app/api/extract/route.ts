import { NextResponse } from "next/server"

function buildApiUrl(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`)
    const host = url.hostname.replace(/^www\./, "")
    return `https://api.${host}`
  } catch {
    return ""
  }
}

function buildWebUrl(input: string): string {
  if (input.startsWith("http")) return input
  return `https://${input.replace(/^www\./, "")}`
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

function extractNextData(html: string): Record<string, unknown> | null {
  try {
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/)
    if (!match) return null
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function findTestSeries(data: unknown, depth = 0): unknown[] {
  if (depth > 6 || !data) return []
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null && "title" in (data[0] as object)) {
      return data as unknown[]
    }
    for (const item of data) {
      const found = findTestSeries(item, depth + 1)
      if (found.length) return found
    }
  }
  if (typeof data === "object" && data !== null) {
    for (const key of ["testSeries", "test_series", "courses", "data", "items", "results"]) {
      const val = (data as Record<string, unknown>)[key]
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && "title" in (val[0] as object)) {
        return val
      }
    }
    for (const val of Object.values(data as object)) {
      const found = findTestSeries(val, depth + 1)
      if (found.length) return found
    }
  }
  return []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const inputUrl = searchParams.get("url")?.trim()

  if (!inputUrl) {
    return NextResponse.json({ error: "URL required" }, { status: 400 })
  }

  const webUrl = buildWebUrl(inputUrl)
  const apiUrl = buildApiUrl(webUrl)

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/html, */*",
  }

  // Try API endpoint first (AppX pattern)
  const apiEndpoints = [
    `${apiUrl}/api/v1/test-series/?format=json`,
    `${apiUrl}/api/v1/test-series/`,
    `${webUrl}/api/v1/test-series/?format=json`,
  ]

  for (const endpoint of apiEndpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, { headers }, 10000)
      if (res.ok) {
        const json = await res.json()
        const series = findTestSeries(json)
        if (series.length > 0) {
          return NextResponse.json({
            success: true,
            testSeries: series,
            source: "api",
            apiBase: apiUrl,
            webBase: webUrl,
          })
        }
      }
    } catch {}
  }

  // Fallback: scrape __NEXT_DATA__ from website
  try {
    const testSeriesUrl = webUrl.replace(/\/$/, "") + "/test-series/"
    const res = await fetchWithTimeout(testSeriesUrl, { headers }, 15000)
    if (res.ok) {
      const html = await res.text()
      const nextData = extractNextData(html)
      if (nextData) {
        const series = findTestSeries(nextData)
        if (series.length > 0) {
          return NextResponse.json({
            success: true,
            testSeries: series,
            source: "scrape",
            apiBase: apiUrl,
            webBase: webUrl,
          })
        }
      }
    }
  } catch {}

  return NextResponse.json({
    error: "Could not fetch test series. Make sure the URL is an AppX-based educational website.",
  }, { status: 404 })
}
