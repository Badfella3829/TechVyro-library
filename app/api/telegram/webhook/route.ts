import { NextResponse } from "next/server"
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import OpenAI from "openai"

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function tgPost(method: string, body: object) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json()
  } catch {
    return { ok: false }
  }
}

async function sendMsg(chatId: number | string, text: string, replyTo?: number) {
  return tgPost("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyTo ? { reply_to_message_id: replyTo } : {}),
  })
}

async function editMsg(chatId: number | string, messageId: number, text: string) {
  return tgPost("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  })
}

async function getAuthorizedChatId(supabase: ReturnType<typeof createAdminClient>): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "general_settings")
      .single()
    const settings = data?.value as Record<string, string> | null
    return settings?.telegramChatId || null
  } catch {
    return null
  }
}

async function analyzeFilename(
  filename: string,
  categories: string[]
): Promise<{ title: string; description: string; category: string; tags: string[] }> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const cleanName = filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim()

    const prompt = `You are analyzing a PDF filename for TechVyro — an Indian educational platform for NDA, CDS, SSC, UPSC, and competitive exam preparation.

Filename: "${cleanName}"
Available categories: ${categories.length > 0 ? categories.join(", ") : "General, Mathematics, English, Science, History, Geography, Current Affairs"}

Generate metadata in JSON:
{
  "title": "Clean professional title (capitalize properly, no underscores)",
  "description": "2-3 sentence description of what this PDF likely contains based on the filename",
  "category": "Best matching category from the list above (exact match required)",
  "tags": ["3-5 short keyword tags relevant to this study material"]
}

Return only valid JSON, no other text.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 350,
    })

    const content = response.choices[0].message.content?.trim() || ""
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim()
    const json = JSON.parse(cleaned)

    return {
      title: json.title || cleanName,
      description: json.description || "",
      category: json.category || (categories[0] ?? "General"),
      tags: Array.isArray(json.tags) ? json.tags.slice(0, 5) : [],
    }
  } catch {
    const cleanName = filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim()
    return {
      title: cleanName,
      description: "",
      category: categories[0] ?? "General",
      tags: [],
    }
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

export async function POST(request: Request) {
  try {
    if (!TOKEN) return NextResponse.json({ ok: true })
    if (!isAdminConfigured()) return NextResponse.json({ ok: true })

    const body = await request.json()
    const { message } = body
    if (!message) return NextResponse.json({ ok: true })

    const chatId = message.chat?.id
    const msgId = message.message_id
    const text: string = message.text || ""
    const document = message.document

    if (!chatId) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    const authorizedChatId = await getAuthorizedChatId(supabase)
    if (!authorizedChatId || String(chatId) !== String(authorizedChatId)) {
      await sendMsg(chatId, "❌ <b>Access Denied</b>\n\nYou are not authorized to use this bot.\n\nConfigure your Chat ID in TechVyro Admin → General Settings.", msgId)
      return NextResponse.json({ ok: true })
    }

    if (text === "/start") {
      await sendMsg(chatId, [
        "🤖 <b>TechVyro Auto-Upload Bot</b>",
        "",
        "Send me any <b>PDF file</b> and I will automatically:",
        "  📝 Generate a clean title",
        "  📂 Detect the right category",
        "  📋 Write a description",
        "  🏷️ Add relevant tags",
        "  ✅ Upload to TechVyro library",
        "",
        "Just send the PDF directly in this chat!",
        "",
        "<b>Commands:</b>",
        "/start — Show this help",
        "/status — Show library stats",
      ].join("\n"))
      return NextResponse.json({ ok: true })
    }

    if (text === "/status") {
      const { count: pdfCount } = await supabase.from("pdfs").select("*", { count: "exact", head: true })
      const { count: catCount } = await supabase.from("categories").select("*", { count: "exact", head: true })
      await sendMsg(chatId, [
        "📊 <b>TechVyro Library Status</b>",
        "",
        `📄 Total PDFs: <b>${pdfCount ?? 0}</b>`,
        `📁 Categories: <b>${catCount ?? 0}</b>`,
        `🕐 ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`,
      ].join("\n"), msgId)
      return NextResponse.json({ ok: true })
    }

    if (!document) {
      if (text && !text.startsWith("/")) {
        await sendMsg(chatId, "📁 Send a <b>PDF file</b> to upload it automatically.\n\nUse /start for instructions.", msgId)
      }
      return NextResponse.json({ ok: true })
    }

    const isPdf = document.mime_type === "application/pdf" || document.file_name?.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      await sendMsg(chatId, "⚠️ <b>Only PDF files are supported.</b>\n\nPlease send a .pdf file.", msgId)
      return NextResponse.json({ ok: true })
    }

    const MAX_SIZE = 20 * 1024 * 1024
    if (document.file_size && document.file_size > MAX_SIZE) {
      await sendMsg(chatId, [
        "⚠️ <b>File too large!</b>",
        "",
        `Your file: <b>${formatSize(document.file_size)}</b>`,
        `Telegram limit: <b>20 MB</b>`,
        "",
        "Please upload larger files via the <b>Admin Panel</b> directly.",
      ].join("\n"), msgId)
      return NextResponse.json({ ok: true })
    }

    const processingRes = await sendMsg(chatId, [
      `⏳ <b>Received: ${document.file_name}</b>`,
      "",
      "🤖 Analyzing with AI...",
    ].join("\n"))
    const processingMsgId: number | undefined = processingRes?.result?.message_id

    const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name")
    const categoryNames = categoriesData?.map((c: { id: string; name: string }) => c.name) || []

    const metadata = await analyzeFilename(document.file_name || "document.pdf", categoryNames)

    if (processingMsgId) {
      await editMsg(chatId, processingMsgId, [
        `⬇️ <b>Downloading PDF...</b>`,
        "",
        `📄 <b>Title:</b> ${metadata.title}`,
        `📂 <b>Category:</b> ${metadata.category}`,
        `🏷️ <b>Tags:</b> ${metadata.tags.join(", ") || "—"}`,
      ].join("\n"))
    }

    const fileInfoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${document.file_id}`)
    const fileInfo = await fileInfoRes.json()

    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      if (processingMsgId) await editMsg(chatId, processingMsgId, "❌ <b>Failed to get file from Telegram.</b>\n\nPlease try again.")
      return NextResponse.json({ ok: true })
    }

    const downloadUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.result.file_path}`
    const fileRes = await fetch(downloadUrl)

    if (!fileRes.ok) {
      if (processingMsgId) await editMsg(chatId, processingMsgId, "❌ <b>Failed to download file.</b>\n\nPlease try again.")
      return NextResponse.json({ ok: true })
    }

    const fileBuffer = await fileRes.arrayBuffer()

    if (processingMsgId) {
      await editMsg(chatId, processingMsgId, [
        `☁️ <b>Uploading to TechVyro...</b>`,
        "",
        `📄 ${metadata.title}`,
        `📂 ${metadata.category}`,
        `📊 ${formatSize(document.file_size || fileBuffer.byteLength)}`,
      ].join("\n"))
    }

    const timestamp = Date.now()
    const sanitizedName = (document.file_name || "document.pdf").replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `${timestamp}-${sanitizedName}`

    const { error: storageError } = await supabase.storage
      .from("pdfs")
      .upload(filePath, fileBuffer, { contentType: "application/pdf", upsert: false })

    if (storageError) {
      if (processingMsgId) await editMsg(chatId, processingMsgId, `❌ <b>Storage upload failed.</b>\n\n${storageError.message}`)
      return NextResponse.json({ ok: true })
    }

    const matchedCat = categoriesData?.find(
      (c: { id: string; name: string }) => c.name.toLowerCase() === metadata.category.toLowerCase()
    )
    const categoryId = matchedCat?.id || null

    const { data: pdf, error: dbError } = await supabase
      .from("pdfs")
      .insert({
        title: metadata.title,
        description: metadata.description || null,
        file_path: filePath,
        file_size: document.file_size || fileBuffer.byteLength || null,
        category_id: categoryId,
        view_count: 0,
        ...(metadata.tags.length > 0 ? { tags: metadata.tags } : {}),
      })
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from("pdfs").remove([filePath]).catch(() => {})
      if (processingMsgId) await editMsg(chatId, processingMsgId, `❌ <b>Database error.</b>\n\n${dbError.message}`)
      return NextResponse.json({ ok: true })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    const pdfUrl = pdf?.id ? `${siteUrl}/pdf/${pdf.id}` : siteUrl

    if (processingMsgId) {
      await editMsg(chatId, processingMsgId, [
        `✅ <b>Upload Successful!</b>`,
        "",
        `📄 <b>${metadata.title}</b>`,
        `📂 Category: ${metadata.category}`,
        `📊 Size: ${formatSize(document.file_size || fileBuffer.byteLength)}`,
        ...(metadata.tags.length > 0 ? [`🏷️ Tags: ${metadata.tags.join(", ")}`] : []),
        ...(metadata.description ? [`📝 ${metadata.description.slice(0, 120)}${metadata.description.length > 120 ? "…" : ""}`] : []),
        "",
        `🔗 <a href="${pdfUrl}">View on TechVyro</a>`,
      ].join("\n"))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[telegram-webhook] Error:", error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "TechVyro Telegram Auto-Upload Webhook" })
}
