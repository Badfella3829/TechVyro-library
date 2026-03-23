import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(req: Request) {
  try {
    const { sessionId, studentName, reason } = await req.json()
    if (!sessionId) return NextResponse.json({ ok: true })
    if (!isAdminConfigured()) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    const { count } = await supabase
      .from("admin_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)

    const msgCount = count ?? 0
    const name = studentName || "Student"

    let icon = "🔴"
    let reasonText = "User left the chat"
    if (reason === "tab_closed") { icon = "🚪"; reasonText = "Tab/browser closed" }
    else if (reason === "ended_by_user") { icon = "✅"; reasonText = "Student ended the chat" }
    else if (reason === "timeout") { icon = "⏱️"; reasonText = "Session timeout" }

    const text =
      `${icon} <b>Chat Ended</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Student:</b> ${name}\n` +
      `🔑 <b>Session:</b> <code>#${sessionId}</code>\n` +
      `💬 <b>Messages:</b> ${msgCount}\n` +
      `📌 <b>Reason:</b> ${reasonText}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<i>This session is now closed.</i>`

    await sendTelegramMessage(text)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("admin-chat/end:", err)
    return NextResponse.json({ ok: true })
  }
}
