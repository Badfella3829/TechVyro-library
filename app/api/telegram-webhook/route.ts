import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { sendTelegramToChat, answerCallbackQuery } from "@/lib/telegram"

const HELP_TEXT =
  `🤖 <b>TechVyro Admin Bot — Commands</b>\n` +
  `━━━━━━━━━━━━━━━━━━\n\n` +
  `<b>📋 Sessions:</b>\n` +
  `• /sessions — Active chat sessions\n\n` +
  `<b>✏️ Ways to reply:</b>\n` +
  `1️⃣ Use <b>Telegram Reply</b> on a student's message\n` +
  `2️⃣ Inline <b>"✏️ Quick Reply"</b> button\n` +
  `3️⃣ Command: <code>/reply SESSION_ID message</code>\n\n` +
  `<b>📊 Stats:</b>\n` +
  `• /stats — Today's chat statistics\n\n` +
  `<b>❓ Help:</b>\n` +
  `• /help — This message\n` +
  `• /start — Welcome message`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = process.env.TELEGRAM_BOT_TOKEN!
    if (!token || !isAdminConfigured()) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    // Get admin chat ID
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "general_settings")
      .single()
    const adminChatId = String((settings?.value as Record<string, string>)?.telegramChatId || "")

    // ── CALLBACK QUERY (inline button clicks) ─────────────────
    const callbackQuery = body?.callback_query
    if (callbackQuery) {
      const fromChatId = String(callbackQuery.message?.chat?.id || callbackQuery.from?.id || "")
      const data: string = callbackQuery.data || ""
      const cbId: string = callbackQuery.id

      if (!adminChatId || fromChatId !== adminChatId) {
        await answerCallbackQuery(token, cbId, "⛔ Access denied")
        return NextResponse.json({ ok: true })
      }

      // ── Button: sessions ──────────────────────────────────
      if (data === "sessions") {
        await answerCallbackQuery(token, cbId, "📋 Fetching sessions...")
        const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
        const { data: sessions } = await supabase
          .from("admin_chat_sessions")
          .select("id, student_name, last_message_at")
          .gte("last_message_at", cutoff)
          .order("last_message_at", { ascending: false })

        if (!sessions?.length) {
          await sendTelegramToChat(token, fromChatId,
            "ℹ️ No active sessions right now (last 30 min).")
        } else {
          const list = sessions.map((s, i) => {
            const ago = Math.round((Date.now() - new Date(s.last_message_at).getTime()) / 60000)
            return `${i + 1}. <b>${s.student_name}</b>  <code>#${s.id}</code>  (${ago} min ago)`
          }).join("\n")

          const buttons = sessions.slice(0, 5).map(s => ([{
            text: `✏️ Reply → ${s.student_name}`,
            callback_data: `reply:${s.id}:${s.student_name}`,
          }]))

          await sendTelegramToChat(token, fromChatId,
            `📋 <b>Active Sessions (last 30 min)</b>\n━━━━━━━━━━━━━━━━\n${list}`, {
              reply_markup: { inline_keyboard: buttons },
            })
        }
        return NextResponse.json({ ok: true })
      }

      // ── Button: help ──────────────────────────────────────
      if (data === "help") {
        await answerCallbackQuery(token, cbId)
        await sendTelegramToChat(token, fromChatId, HELP_TEXT)
        return NextResponse.json({ ok: true })
      }

      // ── Button: reply:SESSION_ID:Name ─────────────────────
      if (data.startsWith("reply:")) {
        const parts = data.split(":")
        const targetSession = parts[1]
        const targetName = parts.slice(2).join(":") || "Student"

        await answerCallbackQuery(token, cbId, `✏️ Reply to this message`)

        // Send a force-reply prompt — session ID embedded in text so webhook can parse it
        await sendTelegramToChat(token, fromChatId,
          `📝 <b>${targetName}</b>  <code>#${targetSession}</code>\n\nUse <b>Telegram Reply</b> on this message and type your response 👇`, {
            reply_markup: { force_reply: true, selective: true },
          })

        return NextResponse.json({ ok: true })
      }

      // ── Button: noop ──────────────────────────────────────
      if (data === "noop") {
        await answerCallbackQuery(token, cbId)
        return NextResponse.json({ ok: true })
      }

      await answerCallbackQuery(token, cbId)
      return NextResponse.json({ ok: true })
    }

    // ── REGULAR MESSAGES ──────────────────────────────────────
    const message = body?.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const fromChatId = String(message.chat?.id || "")
    if (!adminChatId || fromChatId !== adminChatId) return NextResponse.json({ ok: true })

    const text: string = message.text.trim()

    // ── /start ───────────────────────────────────────────────
    if (text === "/start") {
      await sendTelegramToChat(token, fromChatId,
        `👋 <b>Hello, TechVyro Admin!</b>\n\n` +
        `I am your <b>Live Chat Assistant Bot</b>.\n` +
        `Students chat on the website and messages arrive here.\n\n` +
        `📋 /sessions — View active chats\n` +
        `❓ /help — All commands`, {
          reply_markup: {
            inline_keyboard: [[
              { text: "📋 Active Sessions", callback_data: "sessions" },
              { text: "❓ Help", callback_data: "help" },
            ]],
          },
        })
      return NextResponse.json({ ok: true })
    }

    // ── /help ─────────────────────────────────────────────────
    if (text === "/help") {
      await sendTelegramToChat(token, fromChatId, HELP_TEXT, {
        reply_markup: {
          inline_keyboard: [[
            { text: "📋 Sessions", callback_data: "sessions" },
          ]],
        },
      })
      return NextResponse.json({ ok: true })
    }

    // ── /sessions or /active ──────────────────────────────────
    if (text === "/sessions" || text === "/active") {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: sessions } = await supabase
        .from("admin_chat_sessions")
        .select("id, student_name, last_message_at")
        .gte("last_message_at", cutoff)
        .order("last_message_at", { ascending: false })

      if (!sessions?.length) {
        await sendTelegramToChat(token, fromChatId,
          "ℹ️ <b>Active Sessions</b>\n\nNo active sessions at the moment.")
        return NextResponse.json({ ok: true })
      }

      const list = sessions.map((s, i) => {
        const ago = Math.round((Date.now() - new Date(s.last_message_at).getTime()) / 60000)
        return `${i + 1}. <b>${s.student_name}</b>  <code>#${s.id}</code>\n   ⏱ ${ago} min ago`
      }).join("\n\n")

      const buttons = sessions.slice(0, 5).map(s => ([{
        text: `✏️ Reply → ${s.student_name}`,
        callback_data: `reply:${s.id}:${s.student_name}`,
      }]))

      await sendTelegramToChat(token, fromChatId,
        `📋 <b>Active Sessions</b>  (last 30 min)\n━━━━━━━━━━━━━━━━\n\n${list}\n\n` +
        `<i>Reply via button or /reply command.</i>`, {
          reply_markup: { inline_keyboard: buttons },
        })
      return NextResponse.json({ ok: true })
    }

    // ── /stats ────────────────────────────────────────────────
    if (text === "/stats") {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayISO = todayStart.toISOString()

      const [{ count: todaySessions }, { count: totalSessions }, { count: totalMsgs }] =
        await Promise.all([
          supabase.from("admin_chat_sessions").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
          supabase.from("admin_chat_sessions").select("id", { count: "exact", head: true }),
          supabase.from("admin_chat_messages").select("id", { count: "exact", head: true }),
        ])

      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { count: activeSessions } = await supabase
        .from("admin_chat_sessions").select("id", { count: "exact", head: true }).gte("last_message_at", cutoff)

      await sendTelegramToChat(token, fromChatId,
        `📊 <b>Chat Statistics</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `🟢 <b>Active now:</b> ${activeSessions ?? 0}\n` +
        `📅 <b>Today's sessions:</b> ${todaySessions ?? 0}\n` +
        `📁 <b>Total sessions:</b> ${totalSessions ?? 0}\n` +
        `💬 <b>Total messages:</b> ${totalMsgs ?? 0}`, {
          reply_markup: {
            inline_keyboard: [[
              { text: "📋 Active Sessions", callback_data: "sessions" },
            ]],
          },
        })
      return NextResponse.json({ ok: true })
    }

    // ── /reply SESSION_ID message ─────────────────────────────
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
        await sendTelegramToChat(token, fromChatId,
          `❌ Session <code>#${targetSession}</code> not found.\n\n` +
          `View active sessions: /sessions`, {
            reply_markup: { inline_keyboard: [[{ text: "📋 Sessions", callback_data: "sessions" }]] },
          })
        return NextResponse.json({ ok: true })
      }

      await supabase.from("admin_chat_messages").insert({
        session_id: session.id,
        sender: "admin",
        message: replyText,
      })
      await supabase.from("admin_chat_sessions")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", session.id)

      await sendTelegramToChat(token, fromChatId,
        `✅ <b>Reply sent!</b>\n` +
        `👤 <b>${session.student_name}</b>  <code>#${session.id}</code>\n` +
        `💬 <i>"${replyText.slice(0, 80)}${replyText.length > 80 ? "…" : ""}"</i>`, {
          reply_markup: {
            inline_keyboard: [[
              { text: "📋 Sessions", callback_data: "sessions" },
            ]],
          },
        })
      return NextResponse.json({ ok: true })
    }

    // ── Telegram native Reply feature ─────────────────────────
    const replyToMsgId: number | null = message.reply_to_message?.message_id || null
    const replyToText: string = message.reply_to_message?.text || ""
    let sessionId: string | null = null

    if (replyToMsgId) {
      // Method A: match by telegram_message_id in DB (student messages)
      const { data: origMsg } = await supabase
        .from("admin_chat_messages")
        .select("session_id")
        .eq("telegram_message_id", replyToMsgId)
        .maybeSingle()

      if (origMsg?.session_id) {
        sessionId = origMsg.session_id
      } else {
        // Method B: parse #SESSIONID from force-reply prompt text (Quick Reply button flow)
        const sessionMatch = replyToText.match(/#([A-Z0-9]{6,8})/)
        if (sessionMatch) sessionId = sessionMatch[1]
      }
    }

    if (!sessionId) {
      // Unknown message — show help
      await sendTelegramToChat(token, fromChatId,
        `⚠️ Use <b>Telegram Reply</b> on a student's message,\n` +
        `or use the <b>"✏️ Quick Reply"</b> button.\n\n` +
        `Or type:\n<code>/reply SESSION_ID your_message</code>\n\n` +
        `Available commands: /help`, {
          reply_markup: {
            inline_keyboard: [[
              { text: "📋 Sessions", callback_data: "sessions" },
              { text: "❓ Help", callback_data: "help" },
            ]],
          },
        })
      return NextResponse.json({ ok: true })
    }

    // Save admin's reply via native Telegram Reply
    await supabase.from("admin_chat_messages").insert({
      session_id: sessionId,
      sender: "admin",
      message: text,
    })
    await supabase.from("admin_chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("telegram-webhook:", err)
    return NextResponse.json({ ok: true })
  }
}
