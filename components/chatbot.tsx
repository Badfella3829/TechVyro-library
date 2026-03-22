"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, User, Loader2, ChevronDown, Minimize2, GraduationCap, Sparkles, MessageSquareHeart, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { label: "📚 PDF Dhundho", text: "Physics ke important PDFs suggest karo" },
  { label: "💡 Concept Samjho", text: "Newton ke laws simple mein explain karo" },
  { label: "🎯 Exam Tips", text: "NDA exam 2025 ki best preparation strategy kya hai?" },
]

function formatText(text: string) {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <br key={i} />
    const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="text-violet-400 mt-0.5 shrink-0 font-bold">›</span>
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s+/, "") }} />
        </div>
      )
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="text-violet-500 shrink-0 font-semibold text-[11px] mt-px">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s+/, "") }} />
        </div>
      )
    }
    return <p key={i} className="mt-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
  })
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Namaste! 🎓 Main TechVyro AI Assistant hoon.\n\nAapki madad kar sakta hoon:\n- **Study questions** — Mathematics, Physics, Chemistry, Biology...\n- **PDFs dhundhna** — library mein available materials\n- **Exam preparation** — NDA, SSC, JEE, NEET tips\n\nKya poochna chahte ho?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Contact Admin mode
  const [contactMode, setContactMode] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactMsg, setContactMsg] = useState("")
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const contactNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (open) {
      scrollToBottom()
      setUnread(0)
      setTimeout(() => {
        if (contactMode) contactNameRef.current?.focus()
        else inputRef.current?.focus()
      }, 150)
    }
  }, [open, scrollToBottom, contactMode])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages, open, scrollToBottom])

  async function sendMessage(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()
      const reply = data.reply || data.error || "Kuch gadbad ho gaya, dobara try karo."

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }])
      if (!open) setUnread(prev => prev + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Network error. Please dobara try karo.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  async function submitContact() {
    if (!contactName.trim() || !contactMsg.trim() || contactLoading) return
    setContactLoading(true)

    try {
      const res = await fetch("/api/contact-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName.trim(), message: contactMsg.trim() }),
      })

      if (res.ok) {
        setContactSuccess(true)
        setTimeout(() => {
          setContactMode(false)
          setContactSuccess(false)
          setContactName("")
          setContactMsg("")
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: `✅ **Message bhej diya!**\n\nTumhara message admin tak pahunch gaya. Woh jald hi Telegram par reply karenge.\n\nTab tak koi aur sawaal ho toh poochho! 😊`,
            timestamp: new Date(),
          }])
        }, 2000)
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "❌ Message nahi bheja ja saka. Please baad mein try karo.",
          timestamp: new Date(),
        }])
        setContactMode(false)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "❌ Network error. Please baad mein try karo.",
        timestamp: new Date(),
      }])
      setContactMode(false)
    } finally {
      setContactLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!mounted) return null

  return (
    <div className={cn(
      "fixed z-40",
      "bottom-[84px] right-4 md:bottom-6 md:right-6"
    )}>

      {/* Chat window */}
      {open && (
        <div className={cn(
          "absolute bottom-[72px] right-0",
          "w-[calc(100vw-2rem)] sm:w-[360px]",
          "max-w-[360px]",
          "bg-background border border-border/50 rounded-2xl shadow-2xl shadow-violet-500/10",
          "flex flex-col overflow-hidden",
          "transition-all duration-300 ease-out origin-bottom-right",
          minimized ? "h-[52px]" : "h-[420px] sm:h-[480px] max-h-[calc(100dvh-160px)]",
        )}>

          {/* Header */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-chat-shimmer" />

            {contactMode ? (
              <button
                onClick={() => { setContactMode(false); setContactSuccess(false) }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 shrink-0 hover:bg-white/25 transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4 text-white" />
              </button>
            ) : (
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 shrink-0">
                <GraduationCap style={{ height: "18px", width: "18px" }} className="text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-green-400 border border-violet-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-white leading-tight">
                  {contactMode ? "Admin se Baat Karo" : "TechVyro AI"}
                </p>
                {!contactMode && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-semibold text-white/90 tracking-wide">BETA</span>
                )}
              </div>
              <p className="text-[10px] text-white/70 leading-tight">
                {contactMode ? "Message directly to admin via Telegram" : "Study Assistant + PDF Finder"}
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              {!contactMode && (
                <button
                  onClick={() => setMinimized(m => !m)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                >
                  {minimized ? <ChevronDown className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </button>
              )}
              <button
                onClick={() => { setOpen(false); setContactMode(false) }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* ── CONTACT ADMIN FORM ── */}
              {contactMode ? (
                <div className="flex-1 flex flex-col px-4 py-4 gap-3 overflow-y-auto bg-gradient-to-b from-violet-50/30 to-background dark:from-violet-950/10">
                  {contactSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Message bhej diya!</p>
                        <p className="text-xs text-muted-foreground mt-1">Admin ko Telegram par notification mil gayi hai.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40">
                        <MessageSquareHeart className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-violet-700 dark:text-violet-300 leading-relaxed">
                          Admin ko direct message karo. Yeh Telegram par bheja jayega aur woh jald reply karenge.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold text-muted-foreground">Aapka Naam *</label>
                        <Input
                          ref={contactNameRef}
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Jaise: Rahul Kumar"
                          className="h-9 text-xs rounded-xl border-border/50 bg-background focus:border-violet-400"
                          disabled={contactLoading}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold text-muted-foreground">Aapka Message *</label>
                        <textarea
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value)}
                          placeholder="Admin se kya poochna chahte ho?"
                          rows={4}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border/50 bg-background focus:border-violet-400 focus:outline-none resize-none transition-colors disabled:opacity-50"
                          disabled={contactLoading}
                        />
                      </div>

                      <Button
                        onClick={submitContact}
                        disabled={!contactName.trim() || !contactMsg.trim() || contactLoading}
                        className="w-full h-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold shadow-sm shadow-violet-500/30 disabled:opacity-50"
                      >
                        {contactLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Bhej raha hoon…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-3.5 w-3.5" />
                            Admin ko Message Karo
                          </span>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* ── NORMAL CHAT ── */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm bg-gradient-to-b from-muted/20 to-background">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2 items-end",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn(
                          "shrink-0 flex h-6 w-6 items-center justify-center rounded-full mb-0.5",
                          msg.role === "user"
                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                            : "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/60"
                        )}>
                          {msg.role === "user" ? <User className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                        </div>

                        <div className={cn(
                          "max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed",
                          msg.role === "user"
                            ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-sm"
                            : "bg-card border border-border/40 text-foreground rounded-bl-sm shadow-sm"
                        )}>
                          {formatText(msg.content)}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-2 items-end">
                        <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/60">
                          <GraduationCap className="h-3 w-3" />
                        </div>
                        <div className="bg-card border border-border/40 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick prompts */}
                  {messages.length === 1 && (
                    <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="shrink-0 px-2.5 py-1.5 rounded-full border border-violet-200/60 dark:border-violet-700/40 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100/60 dark:hover:bg-violet-900/40 transition-colors text-[11px] text-violet-700 dark:text-violet-300 font-medium whitespace-nowrap"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Connect to Admin banner */}
                  <div className="shrink-0 mx-3 mb-2">
                    <button
                      onClick={() => setContactMode(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-violet-200/50 dark:border-violet-800/40 bg-gradient-to-r from-violet-50/60 to-purple-50/60 dark:from-violet-950/20 dark:to-purple-950/20 hover:from-violet-100/70 hover:to-purple-100/70 dark:hover:from-violet-900/30 dark:hover:to-purple-900/30 transition-all group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60 transition-colors">
                        <MessageSquareHeart className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 leading-tight">Admin se Baat Karo</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Direct message → Telegram par milega</p>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                    </button>
                  </div>

                  {/* Input area */}
                  <div className="shrink-0 border-t border-border/40 px-3 py-2.5 bg-muted/10">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Kuch bhi poochho..."
                        className="h-9 text-xs rounded-xl border-border/50 bg-background focus:border-violet-400 transition-colors"
                        disabled={loading}
                      />
                      <Button
                        size="sm"
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="h-9 w-9 p-0 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-sm shadow-violet-500/30 disabled:opacity-50 disabled:shadow-none"
                      >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1.5 flex items-center justify-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      TechVyro AI — GPT-4o powered
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Floating Trigger Button ── */}
      <div className="relative">
        {!open && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 opacity-40 animate-ping scale-110" style={{ animationDuration: "2.5s" }} />
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 opacity-20 animate-ping scale-125" style={{ animationDuration: "2.5s", animationDelay: "0.6s" }} />
          </>
        )}

        <button
          onClick={() => { setOpen(o => !o); setUnread(0) }}
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5",
            "h-14 w-14 rounded-2xl",
            "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600",
            "shadow-lg shadow-violet-500/40",
            "transition-all duration-300 ease-out",
            "hover:shadow-xl hover:shadow-violet-500/50 hover:scale-110 hover:-translate-y-0.5",
            "active:scale-95 active:translate-y-0",
          )}
          title="TechVyro AI Assistant"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />

          {open ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <>
              <GraduationCap className="h-5 w-5 text-white drop-shadow" />
              <span className="text-[8px] font-bold text-white/90 leading-none tracking-widest">AI</span>
            </>
          )}

          {!open && unread > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-background shadow">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
