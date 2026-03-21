"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Settings, Home, ExternalLink, Search, X, Sparkles, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSearchQuery("")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Scroll to content section and trigger search
      const contentSection = document.getElementById("content")
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: "smooth" })
      }
      setSearchOpen(false)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      isScrolled 
        ? "border-border/60 bg-background/98 backdrop-blur-xl shadow-sm" 
        : "border-border/40 bg-background/95 backdrop-blur-xl"
    } supports-[backdrop-filter]:bg-background/80`}>
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <FileText className="h-5 w-5 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
              <span className="text-[#ef4444]">Tech</span>
              <span className="text-foreground">Vyro</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5 hidden sm:block font-medium">PDF Library</span>
          </div>
        </Link>
        
        {/* Center Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative w-full group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search PDFs... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 bg-muted/50 border-border/50 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary/50 text-sm rounded-xl transition-all duration-300"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Home link - visible on desktop */}
          <Button variant="ghost" size="sm" asChild className="hidden lg:flex px-3 gap-2 hover:bg-primary/10 hover:text-primary">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          
          {/* Main Website Link */}
          <Button variant="ghost" size="sm" asChild className="hidden lg:flex px-3 gap-2 hover:bg-primary/10 hover:text-primary">
            <a href="https://www.techvyro.in/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          </Button>
          
          <ThemeToggle />
          
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Link href="/admin">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
        </nav>
      </div>
      
      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/40 p-4 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search PDFs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 bg-muted/50 border-border/50 focus-visible:ring-primary text-base rounded-xl"
              autoFocus
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-lg"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
          
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            <a 
              href="#content" 
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <TrendingUp className="h-3 w-3" />
              Popular
            </a>
            <a 
              href="#content"
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              New
            </a>
            <a 
              href="#content"
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-500/20 transition-colors"
            >
              <Clock className="h-3 w-3" />
              Recent
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
