import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(req: Request) {
  try {
    const { sessionId, studentName, reason } = await req.json()
    if (!sessionId) return NextResponse.json({ ok: true })
    if (!isAdminConfigured()) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    // Get message count for this session
    const { count } = await supabase
      .from("admin_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)

    const msgCount = count ?? 0
    const label = reason === "timeout" ? "⏱️ Session Timeout" : "🔴 User Left Chat"
    const name = studentName || "Student"

    await sendTelegramMessage(
      `${label}\n\n👤 <b>${name}</b> (#${sessionId})\n💬 <b>Total messages:</b> ${msgCount}\n\n<i>Yeh session ab close ho gaya hai.</i>`
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("admin-chat/end:", err)
    return NextResponse.json({ ok: true })
  }
}
