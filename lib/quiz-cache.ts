import { createAdminClient } from "@/lib/supabase/admin"

export interface QuizListItem {
  id: string
  title: string
  description: string
  category: string
  time_limit: number
  enabled: boolean
  created_at: string
  questions: { id: string }[]
}

let _cache: { data: QuizListItem[]; at: number } | null = null
let _pending: Promise<QuizListItem[]> | null = null
const CACHE_TTL = 60_000

export async function getQuizList(): Promise<QuizListItem[]> {
  if (_pending) return _pending
  if (_cache && Date.now() - _cache.at < CACHE_TTL) return _cache.data

  _pending = (async () => {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, description, category, time_limit, questions, enabled, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[quiz-cache] DB error:", error)
      return _cache?.data ?? []
    }

    const quizzes = (data || []).map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      time_limit: q.time_limit,
      enabled: q.enabled,
      created_at: q.created_at,
      questions: Array.isArray(q.questions)
        ? q.questions.map((qs: { id?: string }) => ({ id: qs.id ?? "" }))
        : [],
    }))

    _cache = { data: quizzes, at: Date.now() }
    return quizzes
  })().finally(() => { _pending = null })

  return _pending
}

export function invalidateQuizCache() {
  _cache = null
}
