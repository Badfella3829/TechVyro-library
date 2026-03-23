import { NextResponse } from "next/server"

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 20000) {
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

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim()
}

interface AppXQuestion {
  id?: string | number
  question?: string
  title?: string
  question_title?: string
  options?: Array<{ option?: string; text?: string; optionKey?: string; id?: number }>
  answer?: string | number
  correct_option?: string | number
  correct?: string | number
  solution?: string
  explanation?: string
  marks?: number
  negative_marks?: number
}

interface NormalizedQuestion {
  qid: string
  question: string
  options: string[]
  correct: number
  marks: number
  explanation: string
}

function normalizeQuestion(q: AppXQuestion, idx: number): NormalizedQuestion | null {
  try {
    const questionText = stripHtml(
      String(q.question || q.title || q.question_title || "")
    )
    if (!questionText) return null

    const rawOptions = q.options || []
    const options = rawOptions.map((o) => stripHtml(String(o.option || o.text || "")))
    if (options.length < 2) return null

    // Determine correct answer index
    let correctIdx = 0
    const rawAnswer = q.answer ?? q.correct_option ?? q.correct

    if (typeof rawAnswer === "number") {
      correctIdx = rawAnswer - 1 // Usually 1-indexed
    } else if (typeof rawAnswer === "string") {
      // Could be "a", "b", "c", "d" or "1", "2", "3", "4"
      const letter = rawAnswer.toLowerCase().trim()
      if (["a", "b", "c", "d", "e"].includes(letter)) {
        correctIdx = letter.charCodeAt(0) - "a".charCodeAt(0)
      } else {
        const num = parseInt(letter)
        if (!isNaN(num)) correctIdx = num - 1
      }
    } else if (rawOptions.length > 0) {
      // Try matching by optionKey
      const matchIdx = rawOptions.findIndex(
        (o) => o.optionKey === rawAnswer || String(o.id) === String(rawAnswer)
      )
      if (matchIdx >= 0) correctIdx = matchIdx
    }

    correctIdx = Math.max(0, Math.min(correctIdx, options.length - 1))

    return {
      qid: String(q.id || idx),
      question: questionText,
      options,
      correct: correctIdx,
      marks: q.marks ?? 1,
      explanation: stripHtml(String(q.solution || q.explanation || "")),
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testId = searchParams.get("testId")
  const apiBase = searchParams.get("apiBase")

  if (!testId || !apiBase) {
    return NextResponse.json({ error: "testId and apiBase required" }, { status: 400 })
  }

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
  }

  const endpoints = [
    `${apiBase}/api/v1/test/${testId}/questions/?format=json`,
    `${apiBase}/api/v1/test/${testId}/questions/`,
    `${apiBase}/api/v1/tests/${testId}/questions/?format=json`,
    `${apiBase}/api/v1/test-series/test/${testId}/questions/?format=json`,
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, { headers }, 15000)
      if (!res.ok) continue

      const json = await res.json()
      const rawQuestions = findQuestions(json)

      if (rawQuestions.length > 0) {
        const questions = rawQuestions
          .map((q, i) => normalizeQuestion(q as AppXQuestion, i))
          .filter(Boolean) as NormalizedQuestion[]

        if (questions.length > 0) {
          return NextResponse.json({
            success: true,
            questions,
            total: questions.length,
          })
        }
      }
    } catch {}
  }

  return NextResponse.json({ error: "Could not fetch questions for this test" }, { status: 404 })
}

function findQuestions(data: unknown, depth = 0): unknown[] {
  if (depth > 5 || !data) return []
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      const first = data[0] as Record<string, unknown>
      if ("question" in first || "title" in first || "options" in first) return data
    }
    for (const item of data) {
      const found = findQuestions(item, depth + 1)
      if (found.length) return found
    }
  }
  if (typeof data === "object" && data !== null) {
    for (const key of ["questions", "data", "results", "items"]) {
      const val = (data as Record<string, unknown>)[key]
      if (Array.isArray(val) && val.length > 0) {
        const found = findQuestions(val, depth + 1)
        if (found.length) return found
      }
    }
    for (const val of Object.values(data as object)) {
      const found = findQuestions(val, depth + 1)
      if (found.length) return found
    }
  }
  return []
}
