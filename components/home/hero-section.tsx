"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, ArrowRight, Users, RefreshCw, Star, GraduationCap, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const DEFAULT_TAGLINES = [
  "Explore Curated Knowledge",
  "Download Quality PDFs",
  "Learn Without Limits",
  "Expand Your Horizons",
]

const DEFAULT_TRUST_STATS = [
  { icon: Users, label: "10,000+ Students", color: "text-blue-500" },
  { icon: RefreshCw, label: "Updated Daily", color: "text-green-500" },
  { icon: Star, label: "4.9/5 Rating", color: "text-amber-500" },
]

const STAT_ICONS = [Users, RefreshCw, Star]
const STAT_COLORS = ["text-blue-500", "text-green-500", "text-amber-500"]

const features = [
  { icon: Shield, label: "Verified Content", color: "text-primary", hoverBg: "hover:bg-primary/5", hoverBorder: "hover:border-primary/50" },
  { icon: Zap, label: "One-Click Download", color: "text-green-500", hoverBg: "hover:bg-green-500/5", hoverBorder: "hover:border-green-500/50" },
  { icon: GraduationCap, label: "Student Approved", color: "text-accent", hoverBg: "hover:bg-accent/5", hoverBorder: "hover:border-accent/50" },
]

const DEFAULT_WHATSAPP = "https://whatsapp.com/channel/0029Vadk2XHLSmbX3oEVmX37"

export function HeroSection() {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const [taglines, setTaglines] = useState(DEFAULT_TAGLINES)
  const [trustStatLabels, setTrustStatLabels] = useState(DEFAULT_TRUST_STATS.map(s => s.label))
  const [badgeText, setBadgeText] = useState("Free Educational Resources")
  const [description, setDescription] = useState("Discover our comprehensive collection of educational PDFs. Browse by categories, search documents instantly, and download with premium watermark protection.")
  const [heroBtnText, setHeroBtnText] = useState("Browse Library")
  const [whatsappBtnText, setWhatsappBtnText] = useState("Join Updates")
  const [whatsappUrl, setWhatsappUrl] = useState(DEFAULT_WHATSAPP)

  useEffect(() => {
    fetch("/api/site-settings?key=hero_settings")
      .then(r => r.json())
      .then(data => {
        if (data.value) {
          if (data.value.taglines?.length) setTaglines(data.value.taglines)
          if (data.value.trustStats?.length) setTrustStatLabels(data.value.trustStats)
          if (data.value.badgeText) setBadgeText(data.value.badgeText)
          if (data.value.description) setDescription(data.value.description)
          if (data.value.heroBtnText) setHeroBtnText(data.value.heroBtnText)
          if (data.value.whatsappBtnText) setWhatsappBtnText(data.value.whatsappBtnText)
        }
      })
      .catch(() => {})

    fetch("/api/site-settings?key=general_settings")
      .then(r => r.json())
      .then(data => {
        if (data.value?.whatsappChannelUrl) setWhatsappUrl(data.value.whatsappChannelUrl)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (taglines.length === 0) return
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length)
        setIsAnimating(false)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [taglines])

  const activeTrustStats = trustStatLabels.map((label, i) => ({
    icon: STAT_ICONS[i % STAT_ICONS.length],
    label,
    color: STAT_COLORS[i % STAT_COLORS.length],
  }))

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,200,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%)] bg-[length:60px_60px] opacity-[0.03]" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTrustStats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs sm:text-sm font-medium"
              >
                <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                <span className="text-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4" />
            {badgeText}
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-foreground block sm:inline">Welcome to </span>
            <span className="relative inline-block mt-1 sm:mt-0">
              <span className="bg-gradient-to-r from-[#ef4444] via-primary to-accent bg-clip-text text-transparent">
                TechVyro
              </span>
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 2 150 2 198 10" stroke="url(#underline-gradient)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#ef4444" />
                    <stop offset="0.5" stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Animated Tagline */}
          <div className="h-8 sm:h-10 md:h-12 mb-6 sm:mb-8 overflow-hidden">
            <p 
              className={`text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium transition-all duration-500 ${
                isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              {taglines[taglineIndex] || ""}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 px-4 sm:px-0">
            <Button 
              size="lg" 
              className="group w-full sm:w-auto px-8 h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
              asChild
            >
              <a href="#content">
                <BookOpen className="h-5 w-5 mr-2" />
                {heroBtnText}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto px-8 h-12 sm:h-14 text-base font-semibold border-border/50 hover:border-primary/50 hover:bg-primary/5"
              asChild
            >
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5 mr-2 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {whatsappBtnText}
              </a>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 px-4 sm:px-0">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-xs sm:text-sm text-muted-foreground ${feature.hoverBorder} ${feature.hoverBg} transition-all duration-300 cursor-default`}
              >
                <feature.icon className={`h-4 w-4 ${feature.color} shrink-0`} />
                <span className="whitespace-nowrap">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="hsl(var(--muted) / 0.3)"
          />
        </svg>
      </div>
    </section>
  )
}
