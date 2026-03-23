import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"

export async function GET() {
  const result: Record<string, unknown> = {}

  // 1. Check token
  const token = process.env.TELEGRAM_BOT_TOKEN
  result.token_set = !!token
  result.token_preview = token ? `${token.slice(0, 10)}...` : "NOT SET"

  // 2. Check Supabase admin
  result.supabase_configured = isAdminConfigured()

  if (!token) {
    return NextResponse.json({ ...result, error: "TELEGRAM_BOT_TOKEN is not set in environment variables" })
  }

  // 3. Verify token with Telegram
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const meData = await meRes.json()
    result.bot_valid = meData.ok
    result.bot_name = meData.result?.first_name || "Unknown"
    result.bot_username = meData.result?.username || "Unknown"
    if (!meData.ok) {
      return NextResponse.json({ ...result, error: "Token is invalid — get a new one from @BotFather" })
    }
  } catch {
    return NextResponse.json({ ...result, error: "Could not reach Telegram API" })
  }

  // 4. Check Chat ID in Supabase
  let chatId = ""
  if (isAdminConfigured()) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "general_settings")
      .single()
    chatId = String((data?.value as Record<string, string>)?.telegramChatId || "")
    result.chat_id_configured = !!chatId
    result.chat_id_value = chatId || "NOT SET — go to Admin → General Settings → Telegram Chat ID"
  }

  if (!chatId) {
    return NextResponse.json({ ...result, error: "Telegram Chat ID is not configured. Go to Admin Panel → General Settings → set your Telegram Chat ID" })
  }

  // 5. Send test message
  try {
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ <b>TechVyro Bot Test</b>\n\nYour Telegram bot is working correctly!\n\nStudents can now chat with you via the website.",
        parse_mode: "HTML",
      }),
    })
    const sendData = await sendRes.json()
    result.message_sent = sendData.ok
    result.send_error = sendData.ok ? null : sendData.description
    if (!sendData.ok) {
      return NextResponse.json({ ...result, error: `Failed to send message: ${sendData.description}. Check if Chat ID "${chatId}" is correct.` })
    }
  } catch {
    return NextResponse.json({ ...result, error: "Failed to send test message" })
  }

  return NextResponse.json({ ...result, success: true, message: "Everything is working! Check your Telegram for a test message." })
}
