"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Flame, Clock, TrendingUp, Star, ChevronRight, Eye, Download, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PDF } from "@/lib/types"

const REFRESH_INTERVAL = 2 * 60 * 1000

interface FeaturedData {
  popular: PDF[]
  trending: PDF[]
  recent: PDF[]
  topRated: PDF[]
}

interface FeaturedSectionProps {
  featured: FeaturedData
}

const tabs = [
  { id: "popular", label: "Most Downloaded", mobileLabel: "Popular", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { id: "trending", label: "Trending", mobileLabel: "Trending", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "recent", label: "New", mobileLabel: "New", icon: Clock, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  { id: "topRated", label: "Top Rated", mobileLabel: "Top Rated", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
]

function FeaturedCard({ pdf, index }: { pdf: PDF; index: number }) {
  return (
    <Link href={`/pdf/${pdf.id}`} className="group block">
      <Card className="h-full overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg sm:text-xl ${
              index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30" :
              index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-500/30" :
              index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30" :
              "bg-muted text-muted-foreground"
            }`}>
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {pdf.title}
                </h3>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              {pdf.category && (
                <Badge
                  variant="secondary"
                  className="mt-2 text-[10px] sm:text-xs"
                  style={{ backgroundColor: pdf.category.color + "20", color: pdf.category.color }}
                >
                  {pdf.category.name}
                </Badge>
              )}

              <div className="flex items-center gap-3 sm:gap-4 mt-3 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {(pdf.view_count || 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {pdf.download_count.toLocaleString()}
                </span>
                {pdf.average_rating && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                    {pdf.average_rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function FeaturedSection({ featured: initialFeatured }: FeaturedSectionProps) {
  const [activeTab, setActiveTab] = useState("popular")
  const [featured, setFeatured] = useState<FeaturedData>(initialFeatured)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFresh = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const res = await fetch("/api/homepage-data", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (data.featured) {
        setFeatured(data.featured)
        setLastUpdated(new Date())
      }
    } catch {
    } finally {
      if (showSpinner) setTimeout(() => setIsRefreshing(false), 600)
    }
  }, [])

  useEffect(() => {
    fetchFresh(false)
    timerRef.current = setInterval(() => fetchFresh(true), REFRESH_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchFresh])

  const currentPdfs = featured[activeTab as keyof FeaturedData] || []
  if (currentPdfs.length === 0) return null

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Featured Content
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Popular PDFs
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Discover what other students are reading and downloading
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground/50 mt-2">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-1 sm:pb-0 sm:justify-center no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? `${tab.bg} ${tab.color} ${tab.border} border shadow-lg`
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? tab.color : ""}`} />
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Cards Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 transition-opacity duration-300 ${isRefreshing ? "opacity-60" : "opacity-100"}`}>
          {currentPdfs.slice(0, 4).map((pdf, index) => (
            <FeaturedCard key={pdf.id} pdf={pdf} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <Button variant="outline" size="lg" asChild className="gap-2 px-8">
            <a href="#content">
              View All PDFs
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
