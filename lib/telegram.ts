import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"

interface InlineButton {
  text: string
  callback_data?: string
  url?: string
}

interface TelegramOptions {
  parse_mode?: "HTML" | "Markdown"
  disable_web_page_preview?: boolean
  reply_markup?: {
    inline_keyboard?: InlineButton[][]
    force_reply?: boolean
    selective?: boolean
    remove_keyboard?: boolean
  }
  reply_to_message_id?: number
}

async function getTelegramConfig(): Promise<{ token: string; chatId: string } | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !isAdminConfigured()) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "general_settings")
    .single()

  const chatId: string | null = (data?.value as Record<string, string>)?.telegramChatId || null
  if (!chatId) return null

  return { token, chatId }
}

export async function sendTelegramMessage(
  text: string,
  options: TelegramOptions = {}
): Promise<number | null> {
  try {
    const cfg = await getTelegramConfig()
    if (!cfg) return null

    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: options.parse_mode ?? "HTML",
        disable_web_page_preview: options.disable_web_page_preview ?? true,
        ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
        ...(options.reply_to_message_id ? { reply_to_message_id: options.reply_to_message_id } : {}),
      }),
    })

    const data = await res.json()
    return data?.result?.message_id ?? null
  } catch {
    return null
  }
}

export async function sendTelegramToChat(
  token: string,
  chatId: string,
  text: string,
  options: TelegramOptions = {}
): Promise<number | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode ?? "HTML",
        disable_web_page_preview: options.disable_web_page_preview ?? true,
        ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
        ...(options.reply_to_message_id ? { reply_to_message_id: options.reply_to_message_id } : {}),
      }),
    })
    const data = await res.json()
    return data?.result?.message_id ?? null
  } catch {
    return null
  }
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string
): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
    })
  } catch {}
}
