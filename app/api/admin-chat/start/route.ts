import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(req: Request) {
  try {
    const { studentName } = await req.json()
    if (!studentName?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    const sessionId = crypto.randomUUID().slice(0, 8).toUpperCase()
    const supabase = createAdminClient()

    await supabase.from("admin_chat_sessions").insert({
      id: sessionId,
      student_name: studentName.trim(),
    })

    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    })

    // Count active sessions
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { count: activeSessions } = await supabase
      .from("admin_chat_sessions")
      .select("id", { count: "exact", head: true })
      .gte("last_message_at", cutoff)

    const text =
      `🟢 <b>New Chat Session!</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Student:</b> ${studentName.trim()}\n` +
      `🔑 <b>Session:</b> <code>#${sessionId}</code>\n` +
      `🕐 <b>Time:</b> ${now}\n` +
      `👥 <b>Active chats:</b> ${activeSessions ?? 1}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<i>Use "✏️ Quick Reply" on the student's message or use the Telegram Reply feature.</i>`

    await sendTelegramMessage(text, {
      reply_markup: {
        inline_keyboard: [[
          { text: "📋 Active Sessions", callback_data: "sessions" },
          { text: "❓ Help", callback_data: "help" },
        ]],
      },
    })

    return NextResponse.json({ sessionId })
  } catch (err) {
    console.error("admin-chat/start:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
