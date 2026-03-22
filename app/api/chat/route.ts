import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `You are TechVyro Study Assistant — a smart, friendly AI tutor for Indian students preparing for competitive exams and school/college studies.

You specialize in:
- 📚 All school/college subjects: Mathematics, Physics, Chemistry, Biology, English, Hindi, History, Geography, Economics, Computer Science, Sanskrit, Political Science
- 🎯 Competitive exams: NDA, SSC CGL/CHSL, JEE Main/Advanced, NEET, UPSC, IBPS, RRB, GATE, CAT, CUET
- 📖 Concept explanations — step-by-step, with examples
- 🔍 PDF/study material recommendations from TechVyro library
- 💡 Study strategies, time management, exam tips
- 🧮 Solving problems (math, physics, chemistry numericals)
- 📝 Essay writing, grammar, comprehension help

Response Style:
- Be concise but complete. Avoid unnecessary filler sentences.
- Use **bold** for key terms, formulas, and important points
- Use numbered lists for steps/processes
- Use bullet points (•) for features/comparisons  
- Use headings (##) when explaining multi-part topics
- For math/physics: show formula first, then step-by-step solution
- For code: use code blocks
- Always respond in the same language as the student (Hindi/English/Hinglish)
- End with a helpful follow-up suggestion when appropriate

Important: Never make up PDFs. Only suggest titles that exist in the provided library list.`

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 503 })
    }

    const { messages } = await request.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), { status: 400 })
    }

    // Fetch PDFs for context
    let pdfContext = ""
    try {
      const supabase = await createClient()
      if (supabase) {
        const { data: pdfs } = await supabase
          .from("pdfs")
          .select("title, description")
          .order("view_count", { ascending: false })
          .limit(100)

        if (pdfs && pdfs.length > 0) {
          const pdfList = pdfs
            .map(p => `• ${p.title}${p.description ? ` — ${p.description.slice(0, 50)}` : ""}`)
            .join("\n")
          pdfContext = `\n\n---\nTechVyro PDF Library (${pdfs.length} books available):\n${pdfList}\n\nFor PDFs, tell students to search on the website or browse by category.`
        }
      }
    } catch { /* silently ignore */ }

    const systemMessage = { role: "system", content: SYSTEM_PROMPT + pdfContext }
    const trimmedMessages = messages.slice(-16) // Keep last 16 messages

    // Call OpenAI with streaming enabled
    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...trimmedMessages],
        max_tokens: 1000,
        temperature: 0.65,
        stream: true,
      }),
    })

    if (!openAIRes.ok) {
      const err = await openAIRes.json().catch(() => ({}))
      return new Response(JSON.stringify({ error: err.error?.message || "AI error" }), { status: 500 })
    }

    // Stream the response directly to the client
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = openAIRes.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim()
                if (jsonStr === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                  continue
                }
                try {
                  const parsed = JSON.parse(jsonStr)
                  const token = parsed.choices?.[0]?.delta?.content || ""
                  if (token) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
                  }
                } catch { /* skip malformed chunks */ }
              }
            }
          }
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[chat] Error:", error)
    return new Response(JSON.stringify({ error: "Failed to get response" }), { status: 500 })
  }
}
