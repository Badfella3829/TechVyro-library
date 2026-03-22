import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = body?.message

    if (!message?.text) return NextResponse.json({ ok: true })
    if (!isAdminConfigured()) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    // Verify message is from admin's Telegram chat
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "general_settings")
      .single()

    const adminChatId = String((settings?.value as Record<string, string>)?.telegramChatId || "")
    const fromChatId = String(message.chat?.id || "")

    if (!adminChatId || fromChatId !== adminChatId) {
      return NextResponse.json({ ok: true })
    }

    const text: string = message.text.trim()
    const token = process.env.TELEGRAM_BOT_TOKEN!

    // ── Method 1: /reply SESSION_ID message text ──────────────
    const manualReplyMatch = text.match(/^\/reply\s+([A-Z0-9]{6,8})\s+(.+)$/is)
    if (manualReplyMatch) {
      const targetSession = manualReplyMatch[1].toUpperCase()
      const replyText = manualReplyMatch[2].trim()

      const { data: session } = await supabase
        .from("admin_chat_sessions")
        .select("id, student_name")
        .eq("id", targetSession)
        .maybeSingle()

      if (!session) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: fromChatId,
            text: `❌ Session <b>#${targetSession}</b> nahi mila. Check karo session ID sahi hai.`,
            parse_mode: "HTML",
          }),
        })
        return NextResponse.json({ ok: true })
      }

      await supabase.from("admin_chat_messages").insert({
        session_id: session.id,
        sender: "admin",
        message: replyText,
      })
      await supabase
        .from("admin_chat_sessions")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", session.id)

      // Confirm to admin
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: fromChatId,
          text: `✅ Reply bhej diya → <b>${session.student_name}</b> (#${session.id})`,
          parse_mode: "HTML",
        }),
      })

      return NextResponse.json({ ok: true })
    }

    // ── Method 2: /sessions — list active sessions ─────────────
    if (text === "/sessions" || text === "/active") {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: sessions } = await supabase
        .from("admin_chat_sessions")
        .select("id, student_name, last_message_at")
        .gte("last_message_at", cutoff)
        .order("last_message_at", { ascending: false })

      if (!sessions?.length) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: fromChatId,
            text: "ℹ️ Abhi koi active chat session nahi hai.",
          }),
        })
        return NextResponse.json({ ok: true })
      }

      const list = sessions
        .map((s) => {
          const ago = Math.round((Date.now() - new Date(s.last_message_at).getTime()) / 60000)
          return `• <b>${s.student_name}</b> (#${s.id}) — ${ago} min pehle`
        })
        .join("\n")

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: fromChatId,
          text: `📋 <b>Active Sessions (last 30 min):</b>\n\n${list}\n\n<i>Reply karne ke liye: message pe Reply karein\nYa type karein: /reply SESSION_ID aapka reply</i>`,
          parse_mode: "HTML",
        }),
      })

      return NextResponse.json({ ok: true })
    }

    // ── Method 3: Telegram native Reply feature ────────────────
    const replyToMsgId: number | null = message.reply_to_message?.message_id || null
    let sessionId: string | null = null

    if (replyToMsgId) {
      const { data: origMsg } = await supabase
        .from("admin_chat_messages")
        .select("session_id")
        .eq("telegram_message_id", replyToMsgId)
        .maybeSingle()

      if (origMsg?.session_id) sessionId = origMsg.session_id
    }

    // ── No session found: show help instead of guessing ────────
    if (!sessionId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: fromChatId,
          text: `⚠️ Kisi student ka message pe <b>Reply</b> karein, ya use karein:\n\n<code>/reply SESSION_ID aapka message</code>\n\nActive sessions dekhne ke liye: <code>/sessions</code>`,
          parse_mode: "HTML",
        }),
      })
      return NextResponse.json({ ok: true })
    }

    // Save admin reply
    await supabase.from("admin_chat_messages").insert({
      session_id: sessionId,
      sender: "admin",
      message: text,
    })
    await supabase
      .from("admin_chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("telegram-webhook:", err)
    return NextResponse.json({ ok: true })
  }
}
