import { NextResponse } from "next/server"
import { verifyAdminToken, extractToken } from "@/lib/admin-auth"

export async function POST(request: Request) {
  if (!verifyAdminToken(extractToken(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured in secrets" }, { status: 500 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL is not configured" }, { status: 500 })

  const webhookUrl = `${siteUrl}/api/telegram/webhook`

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    }),
  })

  const data = await res.json()

  if (data.ok) {
    return NextResponse.json({ ok: true, webhookUrl, message: data.description || "Webhook set successfully" })
  } else {
    return NextResponse.json({ error: data.description || "Failed to set webhook" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!verifyAdminToken(extractToken(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 })

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
  const data = await res.json()

  const botRes = await fetch(`https://api.telegram.org/bot${token}/getMe`)
  const botData = await botRes.json()

  return NextResponse.json({
    ok: true,
    webhook: data.result,
    bot: botData.result,
  })
}

export async function DELETE(request: Request) {
  if (!verifyAdminToken(extractToken(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 })

  const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: true }),
  })

  const data = await res.json()
  return NextResponse.json({ ok: data.ok, message: data.description })
}
