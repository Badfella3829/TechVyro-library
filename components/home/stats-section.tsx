"use client"

import { useEffect, useState, useRef } from "react"
import { FileText, FolderOpen, Download, Eye, Star, TrendingUp } from "lucide-react"

interface StatsSectionProps {
  stats: {
    totalPdfs: number
    totalCategories: number
    totalDownloads: number
    totalViews: number
    avgRating: number
  }
}

function AnimatedCounter({ 
  value, 
  duration = 2000,
  suffix = "" 
}: { 
  value: number
  duration?: number
  suffix?: string 
}) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const startValue = 0
    const endValue = value

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(startValue + (endValue - startValue) * easeOut))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, isVisible])

  return (
    <span ref={countRef}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const statsConfig = [
  {
    key: "totalPdfs",
    label: "Total PDFs",
    icon: FileText,
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/40",
    shadowHover: "hover:shadow-primary/10",
  },
  {
    key: "totalCategories",
    label: "Categories",
    icon: FolderOpen,
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    borderHover: "hover:border-accent/40",
    shadowHover: "hover:shadow-accent/10",
  },
  {
    key: "totalDownloads",
    label: "Downloads",
    icon: Download,
    color: "green",
    gradient: "from-green-500/20 to-green-500/5",
    iconBg: "bg-green-500/15",
    iconColor: "text-green-500",
    borderHover: "hover:border-green-500/40",
    shadowHover: "hover:shadow-green-500/10",
  },
  {
    key: "totalViews",
    label: "Total Views",
    icon: Eye,
    color: "blue",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-500",
    borderHover: "hover:border-blue-500/40",
    shadowHover: "hover:shadow-blue-500/10",
  },
]

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative py-6 sm:py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon
            const value = stats[stat.key as keyof typeof stats]
            
            return (
              <div
                key={stat.key}
                className={`group relative bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-border/50 ${stat.borderHover} hover:shadow-xl ${stat.shadowHover} transition-all duration-300 hover:-translate-y-1`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg sm:rounded-xl ${stat.iconBg} mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.iconColor}`} />
                  </div>
                  <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
                    <AnimatedCounter value={typeof value === 'number' ? Math.round(value) : 0} />
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-medium truncate">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Average Rating Card - Separate highlight */}
        {stats.avgRating > 0 && (
          <div className="mt-4 sm:mt-6 md:mt-8 max-w-sm mx-auto px-1 sm:px-0">
            <div className="group relative bg-gradient-to-r from-amber-500/10 via-card to-orange-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-amber-500/30 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium truncate">Community Rating</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${i < Math.round(stats.avgRating) ? "fill-current" : "opacity-30"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
