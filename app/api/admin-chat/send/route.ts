import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(req: Request) {
  try {
    const { sessionId, message, studentName } = await req.json()
    if (!sessionId || !message?.trim()) {
      return NextResponse.json({ error: "sessionId and message required" }, { status: 400 })
    }
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    const supabase = createAdminClient()

    // Get message count for context
    const { count: msgCount } = await supabase
      .from("admin_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)

    const msgNum = (msgCount ?? 0) + 1
    const name = studentName || "Student"
    const timeStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit", minute: "2-digit", hour12: true,
    })

    // Rich message format with inline Quick Reply button
    const text =
      `📨 <b>${name}</b>  <code>#${sessionId}</code>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `${message.trim()}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `🕐 ${timeStr}  •  💬 Msg #${msgNum}`

    const telegramMsgId = await sendTelegramMessage(text, {
      reply_markup: {
        inline_keyboard: [[
          { text: "✏️ Quick Reply", callback_data: `reply:${sessionId}:${name}` },
          { text: "📋 Sessions", callback_data: "sessions" },
        ]],
      },
    })

    // Save to DB
    const { data, error } = await supabase
      .from("admin_chat_messages")
      .insert({
        session_id: sessionId,
        sender: "student",
        message: message.trim(),
        telegram_message_id: telegramMsgId,
      })
      .select("id, created_at")
      .single()

    if (error) throw error

    await supabase
      .from("admin_chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId)

    return NextResponse.json({ success: true, messageId: data.id })
  } catch (err) {
    console.error("admin-chat/send:", err)
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }
}
