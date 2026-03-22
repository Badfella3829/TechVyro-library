"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

const REFRESH_INTERVAL = 5 * 60 * 1000

export function HomeAutoRefresh() {
  const router = useRouter()
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setLastRefresh(new Date())

    timerRef.current = setInterval(() => {
      setIsRefreshing(true)
      router.refresh()
      setTimeout(() => {
        setIsRefreshing(false)
        setLastRefresh(new Date())
      }, 1500)
    }, REFRESH_INTERVAL)

    const showTimer = setTimeout(() => setShow(true), 3000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearTimeout(showTimer)
    }
  }, [router])

  if (!show || !lastRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg text-[11px] text-muted-foreground font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
      <span className={`h-1.5 w-1.5 rounded-full ${isRefreshing ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
      {isRefreshing
        ? <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Updating…</span>
        : <span>Live · {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      }
    </div>
  )
}
