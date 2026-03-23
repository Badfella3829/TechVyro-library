import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { getQuizList, invalidateQuizCache } from "@/lib/quiz-cache"

export async function GET() {
  try {
    const quizzes = await getQuizList()
    const response = NextResponse.json({ quizzes })
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch (err) {
    console.error("[quiz-api] GET quizzes exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") || null
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        id: body.id,
        title: body.title,
        description: body.description || "",
        category: body.category || "General",
        time_limit: body.timeLimit || 1200,
        questions: body.questions || [],
        enabled: body.enabled !== undefined ? body.enabled : true,
        created_at: body.createdAt || new Date().toISOString(),
        tags: body.tags || [],
        visibility: body.visibility || "public",
        section: body.section || "General",
        difficulty: body.difficulty || "medium",
        structure_location: body.structureLocation || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    invalidateQuizCache()
    return NextResponse.json({ quiz: data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
